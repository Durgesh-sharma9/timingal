import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { setupSignalingServer } from './server/signaling.js';
import { moderateFrame } from './server/moderation.js';
import { getIceServers } from './server/ice.js';

const PORT = 3000;

async function startServer() {
  const app = express();
  const httpServer = createServer(app);

  // Body parsing for JSON (needed for frame snapshots)
  app.use(express.json({ limit: '10mb' }));

  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // API Health Endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Dynamic ICE (STUN + TURN) Server Endpoint
  app.get('/api/ice-servers', (_req, res) => {
    try {
      const config = getIceServers();
      res.json(config);
    } catch (err) {
      console.error('[API] Error getting ICE servers:', err);
      res.status(500).json({ error: 'Failed to retrieve ICE servers' });
    }
  });

  // Real-Time Video Frame AI Moderation Endpoint
  app.post('/api/moderate-frame', async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: 'Image data is required' });
      }

      const result = await moderateFrame(image);
      res.json(result);
    } catch (err) {
      console.error('[API] Error moderating frame:', err);
      res.status(500).json({ isSafe: true, confidence: 0.5 });
    }
  });

  // Attach Socket.IO signaling & moderation event listeners
  setupSignalingServer(io);

  // Integrate Vite dev middleware or static production files
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

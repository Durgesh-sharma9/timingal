/**
 * ============================================================================
 * IMPORTANT NOTICE / DISCLAIMER:
 * This application is a LOCAL DEMO & LEARNING PROJECT ONLY.
 * It is NOT intended for public deployment or commercial production use.
 * 
 * A production-ready version of a random video chat app requires:
 * 1. Mandatory Age Verification (18+ / Parental Controls).
 * 2. Automated Content Moderation (real-time video/image classification & text filters).
 * 3. User Reporting, Blocking, and Abuse Monitoring Mechanisms.
 * 4. Rate Limiting, Anti-Spam, and IP/Device Banning capabilities.
 * 5. TURN Servers (CoTURN / Twilio) alongside STUN for symmetric NAT traversal.
 * 6. Legal Compliance & Terms of Service Review (COPPA, GDPR, Privacy Policies).
 * ============================================================================
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { setupSignalingServer } from './server/signaling.js';

const PORT = 3000;

async function startServer() {
  const app = express();
  const httpServer = createServer(app);

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

  // Attach Socket.IO signaling event listeners
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

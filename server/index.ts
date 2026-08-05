/**
 * Standalone Server Module for Express + Socket.io
 */
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupSignalingServer } from './signaling.js';

export function createSignalingApp() {
  const app = express();
  const httpServer = createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Health check API route
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'random-video-chat-signaling' });
  });

  // Setup WebRTC signaling & queue logic
  setupSignalingServer(io);

  return { app, httpServer, io };
}

import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';

const PORT = Number(process.env.PORT || 3000);
const allowedOrigins = (process.env.CLIENT_ORIGIN || '*').split(',').map(v => v.trim()).filter(Boolean);
const roomPattern = /^[A-Za-z0-9_-]{2,80}$/;

function isValidRoomId(roomId: unknown): roomId is string {
  return typeof roomId === 'string' && roomPattern.test(roomId);
}

async function startServer() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '32kb' }));

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: allowedOrigins.includes('*') ? true : allowedOrigins, methods: ['GET', 'POST'] },
    maxHttpBufferSize: 64 * 1024,
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  io.use((socket, next) => {
    const roomId = socket.handshake.auth?.roomId;
    if (roomId !== undefined && !isValidRoomId(roomId)) return next(new Error('Invalid room ID'));
    next();
  });

  io.on('connection', (socket) => {
    socket.on('join-room', (roomId: string, role: 'broadcaster' | 'viewer') => {
      if (!isValidRoomId(roomId) || !['broadcaster', 'viewer'].includes(role)) return;
      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.role = role;
      if (role === 'viewer') socket.to(roomId).emit('viewer-joined', socket.id);
      else socket.to(roomId).emit('broadcaster-joined', socket.id);
    });

    socket.on('offer', (targetId: string, offer: unknown) => {
      if (typeof targetId === 'string' && offer && typeof offer === 'object') socket.to(targetId).emit('offer', socket.id, offer);
    });
    socket.on('answer', (targetId: string, answer: unknown) => {
      if (typeof targetId === 'string' && answer && typeof answer === 'object') socket.to(targetId).emit('answer', socket.id, answer);
    });
    socket.on('ice-candidate', (targetId: string, candidate: unknown) => {
      if (typeof targetId === 'string' && candidate && typeof candidate === 'object') socket.to(targetId).emit('ice-candidate', socket.id, candidate);
    });
    socket.on('stop-stream', (roomId: string) => {
      if (isValidRoomId(roomId)) socket.to(roomId).emit('stream-stopped');
    });
    socket.on('send-message', (roomId: string, message: unknown) => {
      if (!isValidRoomId(roomId) || !message || typeof message !== 'object') return;
      const value = message as Record<string, unknown>;
      const text = typeof value.text === 'string' ? value.text.trim().slice(0, 2000) : '';
      if (!text) return;
      socket.to(roomId).emit('chat-message', { ...value, text });
    });
    socket.on('disconnecting', () => {
      socket.rooms.forEach(room => { if (room !== socket.id) socket.to(room).emit('peer-disconnected', socket.id); });
    });
  });

  app.get('/api/health', (_req, res) => res.status(200).json({ status: 'ok', service: 'safaricast-signaling', time: new Date().toISOString() }));

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { maxAge: '1h' }));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  httpServer.listen(PORT, '0.0.0.0', () => console.log(`SafariCast server listening on port ${PORT}`));
}

startServer().catch(error => { console.error('Fatal server startup error:', error); process.exit(1); });

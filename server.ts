import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = 3000;
  const httpServer = createServer(app);
  
  const io = new Server(httpServer, {
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    socket.on('join-room', (roomId: string, role: 'broadcaster' | 'viewer') => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId} as ${role}`);
      if (role === 'viewer') {
        socket.to(roomId).emit('viewer-joined', socket.id);
      } else if (role === 'broadcaster') {
        socket.to(roomId).emit('broadcaster-joined', socket.id);
      }
    });

    socket.on('offer', (targetId: string, offer: any) => {
      socket.to(targetId).emit('offer', socket.id, offer);
    });

    socket.on('answer', (targetId: string, answer: any) => {
      socket.to(targetId).emit('answer', socket.id, answer);
    });

    socket.on('ice-candidate', (targetId: string, candidate: any) => {
      socket.to(targetId).emit('ice-candidate', socket.id, candidate);
    });

    socket.on('stop-stream', (roomId: string) => {
      socket.to(roomId).emit('stream-stopped');
    });

    socket.on('disconnecting', () => {
      socket.rooms.forEach(room => {
        if (room !== socket.id) {
          socket.to(room).emit('peer-disconnected', socket.id);
        }
      });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import matchRoutes from './routes/matchRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { registerMatchSocket } from './sockets/matchSocket.js';

const app = express();
const server = http.createServer(app);

const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins.length ? allowedOrigins : '*',
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);

app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/matches', matchRoutes);
app.use('/api/admin', adminRoutes);

io.on('connection', (socket) => {
  registerMatchSocket(io, socket);
});

const start = async () => {
  const port = Number(process.env.PORT || 5000);
  await connectDB(process.env.MONGODB_URI);
  server.listen(port, () => {
    process.stdout.write(`Backend running on ${port}\n`);
  });
};

start().catch((error) => {
  process.stderr.write(`Startup failed: ${error.message}\n`);
  process.exit(1);
});

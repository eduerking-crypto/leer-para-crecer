import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import authRoutes from './routes/auth.js';
import bookRoutes from './routes/books.js';
import forumRoutes from './routes/forums.js';
import gameRoutes from './routes/games.js';
import eventRoutes from './routes/events.js';
import freebookRoutes from './routes/freebooks.js';
import db from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, '..', 'public')));
app.use('/uploads', express.static(join(__dirname, '..', 'public', 'uploads')));

// Auto-seed if empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (userCount.count === 0) {
  console.log('🌱 Base de datos vacía — ejecutando seed automático...');
  const { execSync } = await import('child_process');
  execSync('node src/seed.js', { cwd: join(__dirname, '..'), stdio: 'inherit' });
  console.log('✅ Seed completado');
}

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/forums', forumRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/freebooks', freebookRoutes);

// SPA fallback
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Ruta no encontrada' });
  res.sendFile(join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`
  📖 Leer para Crecer - Backend
  ─────────────────────────────
  Servidor: http://localhost:${PORT}
  API:      http://localhost:${PORT}/api
  `);
});

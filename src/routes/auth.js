import { Router } from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import db from '../database.js';
import { generateToken, authMiddleware } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const avatarsDir = join(__dirname, '..', '..', 'public', 'uploads', 'avatars');
if (!existsSync(avatarsDir)) mkdirSync(avatarsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarsDir),
  filename: (req, file, cb) => cb(null, `user-${req.user.id}-${Date.now()}${file.originalname.match(/\.[^.]+$/)?.[0]||'.jpg'}`)
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 }, fileFilter: (req, file, cb) => file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Solo imágenes')) });

const router = Router();

router.post('/register', (req, res) => {
  const { name, email, password, bio, avatar } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Todos los campos son obligatorios' });

  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) return res.status(400).json({ error: 'El email ya está registrado' });

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (name, email, password, bio, avatar) VALUES (?, ?, ?, ?, ?)').run(name, email, hash, bio || '', avatar || '👤');
  const user = db.prepare('SELECT id, name, email, avatar, level, bio, is_admin FROM users WHERE id = ?').get(result.lastInsertRowid);

  res.json({ user, token: generateToken(user) });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Credenciales inválidas' });

  const { password: _, ...publicUser } = user;
  res.json({ user: publicUser, token: generateToken(publicUser) });
});

router.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, name, email, avatar, level, bio, is_admin, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  const booksRead = db.prepare('SELECT COUNT(*) as count FROM reading_lists WHERE user_id = ?').get(req.user.id);
  const gameScores = db.prepare('SELECT game, MAX(score) as best FROM game_scores WHERE user_id = ? GROUP BY game').all(req.user.id);

  res.json({ user, stats: { booksRead: booksRead.count, games: gameScores } });
});

router.put('/profile', authMiddleware, (req, res) => {
  const { name, bio, avatar, email } = req.body;
  const updates = [];
  const params = [];

  if (name) { updates.push('name = ?'); params.push(name); }
  if (bio !== undefined) { updates.push('bio = ?'); params.push(bio); }
  if (avatar) { updates.push('avatar = ?'); params.push(avatar); }
  if (email) { updates.push('email = ?'); params.push(email); }

  if (updates.length === 0) return res.status(400).json({ error: 'Sin datos para actualizar' });

  params.push(req.user.id);
  db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);

  const user = db.prepare('SELECT id, name, email, avatar, level, bio, is_admin, created_at FROM users WHERE id = ?').get(req.user.id);
  res.json({ user, token: generateToken(user) });
});

router.get('/users', authMiddleware, (req, res) => {
  if (!req.user.is_admin) return res.status(403).json({ error: 'Solo administradores' });
  const users = db.prepare('SELECT id, name, email, avatar, level, bio, is_admin, created_at FROM users ORDER BY id').all();
  res.json(users);
});

router.post('/upload-avatar', authMiddleware, (req, res) => {
  upload.single('avatar')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || 'Error al subir' });
    if (!req.file) return res.status(400).json({ error: 'Selecciona una imagen' });
    const url = `/uploads/avatars/${req.file.filename}`;
    db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(url, req.user.id);
    const user = db.prepare('SELECT id, name, email, avatar, level, bio, is_admin, created_at FROM users WHERE id = ?').get(req.user.id);
    res.json({ user, token: generateToken(user) });
  });
});

export default router;

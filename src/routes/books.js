import { Router } from 'express';
import db from '../database.js';
import { authMiddleware, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', (req, res) => {
  const { genre, search, limit = 50 } = req.query;
  let sql = 'SELECT * FROM books WHERE 1=1';
  const params = [];

  if (genre && genre !== 'all') { sql += ' AND genre = ?'; params.push(genre); }
  if (search) { sql += ' AND (title LIKE ? OR author LIKE ? OR genre LIKE ?)'; const s = `%${search}%`; params.push(s, s, s); }
  sql += ' ORDER BY rating DESC LIMIT ?';
  params.push(parseInt(limit));

  const books = db.prepare(sql).all(...params);
  const genres = db.prepare('SELECT DISTINCT genre FROM books ORDER BY genre').all().map(g => g.genre);

  res.json({ books, genres, total: books.length });
});

router.get('/genres', (req, res) => {
  const genres = db.prepare('SELECT DISTINCT genre FROM books ORDER BY genre').all().map(g => g.genre);
  res.json(genres);
});

router.get('/:id', (req, res) => {
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
  if (!book) return res.status(404).json({ error: 'Libro no encontrado' });
  res.json(book);
});

router.post('/:id/read', authMiddleware, (req, res) => {
  const existing = db.prepare('SELECT id FROM reading_lists WHERE user_id = ? AND book_id = ?').get(req.user.id, req.params.id);
  if (existing) return res.status(400).json({ error: 'Ya está en tu lista' });

  db.prepare('INSERT INTO reading_lists (user_id, book_id, status) VALUES (?, ?, ?)').run(req.user.id, req.params.id, 'leído');
  res.json({ success: true, message: 'Libro agregado a tu lista' });
});

router.get('/user/list', authMiddleware, (req, res) => {
  const list = db.prepare(`
    SELECT b.*, rl.status, rl.created_at as added_at
    FROM reading_lists rl JOIN books b ON rl.book_id = b.id
    WHERE rl.user_id = ?
    ORDER BY rl.created_at DESC
  `).all(req.user.id);
  res.json(list);
});

export default router;

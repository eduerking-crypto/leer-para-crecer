import { Router } from 'express';
import db from '../database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', (req, res) => {
  const forums = db.prepare(`
    SELECT f.*, (SELECT COUNT(*) FROM forum_posts WHERE forum_id = f.id) as posts_count
    FROM forums f ORDER BY f.members DESC
  `).all();
  res.json(forums);
});

router.get('/:id/posts', (req, res) => {
  const posts = db.prepare(`
    SELECT p.*, u.name as user_name, u.avatar as user_avatar
    FROM forum_posts p JOIN users u ON p.user_id = u.id
    WHERE p.forum_id = ? ORDER BY p.created_at DESC LIMIT 50
  `).all(req.params.id);
  res.json(posts);
});

router.post('/:id/posts', authMiddleware, (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Contenido requerido' });

  const result = db.prepare('INSERT INTO forum_posts (forum_id, user_id, content) VALUES (?, ?, ?)').run(req.params.id, req.user.id, content);
  db.prepare('UPDATE forums SET members = members + 1 WHERE id = ?').run(req.params.id);

  const post = db.prepare(`
    SELECT p.*, u.name as user_name, u.avatar as user_avatar
    FROM forum_posts p JOIN users u ON p.user_id = u.id
    WHERE p.id = ?
  `).get(result.lastInsertRowid);

  res.json(post);
});

export default router;

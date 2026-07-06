import { Router } from 'express';
import db from '../database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/score', authMiddleware, (req, res) => {
  const { game, score } = req.body;
  if (!game || score === undefined) return res.status(400).json({ error: 'Datos incompletos' });

  db.prepare('INSERT INTO game_scores (user_id, game, score) VALUES (?, ?, ?)').run(req.user.id, game, score);

  const best = db.prepare('SELECT MAX(score) as best FROM game_scores WHERE user_id = ? AND game = ?').get(req.user.id, game);
  res.json({ success: true, best: best.best });
});

router.get('/leaderboard/:game', (req, res) => {
  const scores = db.prepare(`
    SELECT u.name, u.avatar, MAX(gs.score) as best_score
    FROM game_scores gs JOIN users u ON gs.user_id = u.id
    WHERE gs.game = ?
    GROUP BY gs.user_id
    ORDER BY best_score DESC LIMIT 10
  `).all(req.params.game);
  res.json(scores);
});

export default router;

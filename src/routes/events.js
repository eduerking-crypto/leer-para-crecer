import { Router } from 'express';
import db from '../database.js';

const router = Router();

router.get('/', (req, res) => {
  const events = db.prepare("SELECT * FROM events ORDER BY event_date ASC LIMIT 6").all();
  res.json(events);
});

export default router;

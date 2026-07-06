import { Router } from 'express';
import db from '../database.js';

const router = Router();

router.get('/', (req, res) => {
  const { search, genre, limit = 50 } = req.query;
  let sql = 'SELECT * FROM free_books WHERE 1=1';
  const params = [];

  if (search) {
    sql += ' AND (title LIKE ? OR author LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s);
  }
  if (genre && genre !== 'all') {
    sql += ' AND genre = ?';
    params.push(genre);
  }

  sql += ' ORDER BY download_count DESC LIMIT ?';
  params.push(parseInt(limit));

  const books = db.prepare(sql).all(...params);
  const genres = db.prepare('SELECT DISTINCT genre FROM free_books ORDER BY genre').all().map(g => g.genre);

  res.json({ books, genres, total: books.length });
});

router.get('/genres', (req, res) => {
  const genres = db.prepare('SELECT DISTINCT genre FROM free_books ORDER BY genre').all().map(g => g.genre);
  res.json(genres);
});

router.get('/search', async (req, res) => {
  const { q = '', source = 'all' } = req.query;
  const results = [];

  if (source === 'all' || source === 'openlibrary') {
    try {
      const resp = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&language=spa&has_fulltext=true&limit=10`);
      const data = await resp.json();
      for (const doc of data.docs) {
        if (doc.title && doc.author_name) {
          results.push({
            title: doc.title,
            author: Array.isArray(doc.author_name) ? doc.author_name[0] : doc.author_name,
            source: 'openlibrary',
            source_id: doc.key?.replace('/works/', ''),
            cover_url: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : null,
            year: doc.first_publish_year,
            language: doc.language || [],
            read_url: doc.key ? `https://openlibrary.org${doc.key}` : null,
          });
        }
      }
    } catch (e) {
      console.error('OpenLibrary search error:', e.message);
    }
  }

  if (source === 'all' || source === 'gutenberg') {
    try {
      const resp = await fetch(`https://gutendex.com/books?search=${encodeURIComponent(q)}&languages=es&page=1`);
      const data = await resp.json();
      for (const book of data.results || []) {
        if (book.title && book.authors?.length) {
          results.push({
            title: book.title,
            author: book.authors.map(a => a.name).join(', '),
            source: 'gutenberg',
            source_id: String(book.id),
            cover_url: book.formats?.['image/jpeg'] || null,
            year: book.download_count,
            language: book.languages || [],
            read_url: book.formats?.['text/html'] || book.formats?.['application/pdf'] || null,
            epub_url: book.formats?.['application/epub+zip'] || book.formats?.['application/octet-stream'] || null,
            text_url: book.formats?.['text/plain'] || null,
            download_count: book.download_count,
          });
        }
      }
    } catch (e) {
      console.error('Gutenberg search error:', e.message);
    }
  }

  res.json({ results, total: results.length });
});

router.get('/epub', async (req, res) => {
  const { source, id } = req.query;
  if (!source || !id) return res.status(400).json({ error: 'source e id requeridos' });
  try {
    if (source === 'gutenberg') {
      const book = db.prepare('SELECT * FROM free_books WHERE source_id = ? AND source = ?').get(id, source);
      res.json({ read_url: book?.read_url || `https://www.gutenberg.org/ebooks/${id}`, text_url: book?.text_url || null });
    } else {
      res.status(400).json({ error: 'Fuente no soportada' });
    }
  } catch (e) { res.status(500).json({ error: e.message }) }
});

router.get('/proxy/text', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url requerida' });
  try {
    const resp = await fetch(url);
    if (!resp.ok) return res.status(404).json({ error: 'Texto no encontrado' });
    const text = await resp.text();
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(text);
  } catch (e) { res.status(500).json({ error: e.message }) }
});

router.get('/translate', async (req, res) => {
  const { text, tl = 'en' } = req.query;
  if (!text) return res.status(400).json({ error: 'text requerido' });
  if (text.length > 5000) return res.status(400).json({ error: 'Texto muy largo (máx 5000 caracteres)' });
  try {
    const resp = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`);
    if (!resp.ok) return res.status(502).json({ error: 'Error del servicio de traducción' });
    const data = await resp.json();
    const translated = data[0].map(s => s[0]).join('');
    res.json({ translated, original: text, tl });
  } catch (e) { res.status(500).json({ error: e.message }) }
});

export default router;

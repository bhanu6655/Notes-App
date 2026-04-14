const express = require('express');
const router = express.Router();
const db = require('../db/database');

function parseTags(raw) {
  try { return JSON.parse(raw); } catch { return []; }
}

function formatNote(row) {
  return { ...row, tags: parseTags(row.tags) };
}

router.get('/', (req, res) => {
  const { q, tag } = req.query;

  let stmt, rows;

  if (q) {
    const term = `%${q}%`;
    stmt = db.prepare(`
      SELECT * FROM notes
      WHERE title LIKE ? OR content LIKE ?
      ORDER BY updated_at DESC
    `);
    rows = stmt.all(term, term);
  } else if (tag) {
    stmt = db.prepare(`
      SELECT * FROM notes
      WHERE tags LIKE ?
      ORDER BY updated_at DESC
    `);
    rows = stmt.all(`%"${tag}"%`);
  } else {
    stmt = db.prepare('SELECT * FROM notes ORDER BY updated_at DESC');
    rows = stmt.all();
  }

  res.json({ success: true, data: rows.map(formatNote) });
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ success: false, error: 'Note not found' });
  res.json({ success: true, data: formatNote(row) });
});

router.post('/', (req, res) => {
  const { title = 'Untitled', content = '', tags = [] } = req.body;

  if (typeof title !== 'string' || title.length > 255) {
    return res.status(400).json({ success: false, error: 'Invalid title' });
  }

  const result = db.prepare(`
    INSERT INTO notes (title, content, tags)
    VALUES (?, ?, ?)
  `).run(title.trim(), content, JSON.stringify(tags));

  const created = db.prepare('SELECT * FROM notes WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ success: true, data: formatNote(created) });
});

router.put('/:id', (req, res) => {
  const { title, content, tags } = req.body;
  const existing = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id);

  if (!existing) return res.status(404).json({ success: false, error: 'Note not found' });

  const updatedTitle   = title   !== undefined ? title.trim()           : existing.title;
  const updatedContent = content !== undefined ? content                : existing.content;
  const updatedTags    = tags    !== undefined ? JSON.stringify(tags)   : existing.tags;

  db.prepare(`
    UPDATE notes
    SET title = ?, content = ?, tags = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(updatedTitle, updatedContent, updatedTags, req.params.id);

  const updated = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id);
  res.json({ success: true, data: formatNote(updated) });
});

router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT id FROM notes WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, error: 'Note not found' });

  db.prepare('DELETE FROM notes WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

module.exports = router;

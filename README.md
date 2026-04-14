# Markd — Markdown Notes Application

A full-stack Markdown-based notes app with live split-screen preview, persistent SQLite storage, debounced auto-save, full-text search, tags, and dark mode.

---

## Tech Stack

| Layer    | Technology                         |
|----------|------------------------------------|
| Frontend | React.js (Vite) + Axios            |
| Markdown | react-markdown + remark-gfm        |
| Backend  | Node.js + Express                  |
| Database | SQLite (via `better-sqlite3`)       |

---

## Features

### Core
- ✅ Create, view, edit, delete notes
- ✅ Markdown editor with live split-screen preview
- ✅ Renders: headings, bold/italic, lists, code blocks, links, tables, blockquotes
- ✅ Persistent SQLite database

### Bonus
- ✅ **Full-text search** across title + content
- ✅ **Tags / Categories** — add & filter by tags
- ✅ **Dark Mode** — toggle with one click, persisted to localStorage
- ✅ **Debounced Auto-Save** — saves 800ms after you stop typing, no API spam
- ✅ **Responsive Design** — works on mobile and desktop
- ✅ **Word count & read time** in the editor stats bar
- ✅ **Three view modes** — Editor | Split | Preview
- ✅ **Ctrl+K** keyboard shortcut to focus search

---

## Project Structure

```
notes-app/
├── backend/
│   ├── db/
│   │   └── database.js       # SQLite init + WAL + migrations
│   ├── routes/
│   │   └── notes.js          # CRUD + search route handlers
│   ├── server.js             # Express entry point
│   ├── .env                  # Environment variables
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── notesApi.js   # Axios HTTP client
    │   ├── components/
    │   │   ├── NotesList.jsx
    │   │   ├── NoteEditor.jsx
    │   │   ├── MarkdownPreview.jsx
    │   │   └── SearchBar.jsx
    │   ├── hooks/
    │   │   └── useDebounce.js
    │   ├── App.jsx
    │   ├── App.css            # Full design system (light + dark themes)
    │   └── index.css
    └── package.json
```

---

## API Design

| Method | Endpoint          | Description               | Response |
|--------|-------------------|---------------------------|----------|
| GET    | `/api/notes`      | List all notes            | 200      |
| GET    | `/api/notes?q=X`  | Search notes by keyword   | 200      |
| GET    | `/api/notes/:id`  | Get a single note         | 200/404  |
| POST   | `/api/notes`      | Create a note             | 201      |
| PUT    | `/api/notes/:id`  | Update a note             | 200/404  |
| DELETE | `/api/notes/:id`  | Delete a note             | 204/404  |
| GET    | `/api/health`     | Health check              | 200      |

All responses follow the shape: `{ success: boolean, data?: ... , error?: string }`

---

## Database Schema

```sql
CREATE TABLE notes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title      TEXT    NOT NULL DEFAULT 'Untitled',
  content    TEXT    NOT NULL DEFAULT '',
  tags       TEXT    NOT NULL DEFAULT '[]',   -- JSON array of strings
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_notes_updated ON notes(updated_at DESC);
```

Migration runs automatically on first boot — no manual step required.

---

## Local Setup

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### 1. Clone & navigate

```bash
git clone <your-repo-url>
cd notes-app
```

### 2. Backend

```bash
cd backend
npm install
```

Configure environment variables (`.env` already provided):
```
PORT=5000
FRONTEND_ORIGIN=http://localhost:5173
```

Start the server:
```bash
npm run dev      # node --watch (auto-restarts on file changes)
# or
npm start        # production
```

The API will be available at **http://localhost:5000**

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at **http://localhost:5173**

---

## Trade-offs & Decisions

| Decision | Rationale |
|----------|-----------|
| SQLite over PostgreSQL | Zero-config for local dev; swap in a few lines for production |
| `better-sqlite3` (sync) | Simpler code than async drivers; single-process Express doesn't block the event loop meaningfully |
| Debounce 800ms | Balances responsiveness with API chatter reduction |
| Tags as JSON column | Avoids a join table for a simple tagging feature; acceptable for this scale |
| No ORM | Raw SQL keeps queries transparent and avoids abstraction overhead |

---

## Screenshots

> Run the app and see the live split-screen editor with dark mode support.

---

## License

MIT

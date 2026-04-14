import { useState, useEffect, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Moon, Sun, NotebookPen } from 'lucide-react';
import NotesList from './components/NotesList';
import NoteEditor from './components/NoteEditor';
import SearchBar from './components/SearchBar';
import { getNotes, createNote, updateNote, deleteNote } from './api/notesApi';
import { useDebounce } from './hooks/useDebounce';
import './App.css';

export default function App() {
  const [notes,       setNotes]       = useState([]);
  const [activeNote,  setActiveNote]  = useState(null);
  const [search,      setSearch]      = useState('');
  const [darkMode,    setDarkMode]    = useState(() => localStorage.getItem('theme') === 'dark');
  const [loading,     setLoading]     = useState(false);
  const [saving,      setSaving]      = useState(false);

  const debouncedSearch = useDebounce(search, 350);

  // Apply theme class to root
  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Fetch notes (re-runs on search change)
  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = debouncedSearch ? { q: debouncedSearch } : {};
      const { data } = await getNotes(params);
      setNotes(data.data);
      // Keep active note in sync
      if (activeNote) {
        const refreshed = data.data.find((n) => n.id === activeNote.id);
        if (refreshed) setActiveNote(refreshed);
      }
    } catch {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  // ── Create ──────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    try {
      const { data } = await createNote({ title: 'Untitled', content: '', tags: [] });
      setNotes((prev) => [data.data, ...prev]);
      setActiveNote(data.data);
      toast.success('Note created');
    } catch {
      toast.error('Failed to create note');
    }
  };

  // ── Save / auto-save ────────────────────────────────────────────────────────
  const handleSave = useCallback(async (updates) => {
    if (!activeNote) return;
    setSaving(true);
    try {
      const { data } = await updateNote(activeNote.id, updates);
      setNotes((prev) => prev.map((n) => (n.id === data.data.id ? data.data : n)));
      setActiveNote(data.data);
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  }, [activeNote]);

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this note? This cannot be undone.');
    if (!confirmed) return;
    try {
      await deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (activeNote?.id === id) setActiveNote(null);
      toast.success('Note deleted');
    } catch {
      toast.error('Failed to delete note');
    }
  };

  return (
    <div className="app-shell">
      <Toaster
        position="bottom-right"
        toastOptions={{ style: { fontSize: '13px' } }}
      />

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <div className="sidebar">
        <header className="sidebar-header">
          <div className="brand">
            <NotebookPen size={20} className="brand-icon" />
            <span>Markd</span>
          </div>
          <button
            id="theme-toggle-btn"
            className="icon-btn"
            onClick={() => setDarkMode((d) => !d)}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </header>

        <div className="sidebar-search">
          <SearchBar
            value={search}
            onChange={setSearch}
            onClear={() => setSearch('')}
          />
        </div>

        <NotesList
          notes={notes}
          activeId={activeNote?.id}
          onSelect={setActiveNote}
          onCreate={handleCreate}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>

      {/* ── Main editor area ─────────────────────────────────────────────────── */}
      <main className="editor-area">
        <NoteEditor
          key={activeNote?.id}
          note={activeNote}
          onSave={handleSave}
          saving={saving}
        />
      </main>
    </div>
  );
}

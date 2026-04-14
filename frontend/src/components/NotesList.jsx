import { FileText, Plus, Trash2, Tag } from 'lucide-react';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr + 'Z').getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function NotesList({ notes, activeId, onSelect, onCreate, onDelete, loading }) {
  return (
    <aside className="notes-list" aria-label="Notes list">
      <div className="notes-list-header">
        <span className="notes-count">{notes.length} {notes.length === 1 ? 'note' : 'notes'}</span>
        <button
          id="new-note-btn"
          className="btn btn-primary"
          onClick={onCreate}
          aria-label="Create new note"
        >
          <Plus size={15} />
          <span>New</span>
        </button>
      </div>

      {loading && <div className="list-loading">Loading…</div>}

      {!loading && notes.length === 0 && (
        <div className="empty-list">
          <FileText size={36} opacity={0.3} />
          <p>No notes yet.<br />Click <strong>New</strong> to get started.</p>
        </div>
      )}

      <ul className="note-items" role="listbox">
        {notes.map((note) => (
          <li
            key={note.id}
            id={`note-item-${note.id}`}
            role="option"
            aria-selected={note.id === activeId}
            className={`note-item ${note.id === activeId ? 'active' : ''}`}
            onClick={() => onSelect(note)}
          >
            <div className="note-item-header">
              <span className="note-title">{note.title || 'Untitled'}</span>
              <button
                id={`delete-note-${note.id}`}
                className="icon-btn danger"
                onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                aria-label={`Delete note: ${note.title}`}
              >
                <Trash2 size={13} />
              </button>
            </div>

            <p className="note-preview">
              {note.content.replace(/[#*`_[\]]/g, '').slice(0, 80) || 'No content…'}
            </p>

            <div className="note-meta">
              <span className="note-time">{timeAgo(note.updated_at)}</span>
              {note.tags?.length > 0 && (
                <span className="note-tags">
                  <Tag size={10} />
                  {note.tags.slice(0, 2).join(', ')}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}

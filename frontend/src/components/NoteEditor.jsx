import { useState, useEffect, useCallback, useRef } from 'react';
import { Save, Tag, X, Eye, EyeOff, AlignLeft } from 'lucide-react';
import MarkdownPreview from './MarkdownPreview';
import { useDebounce } from '../hooks/useDebounce';

function wordCount(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function readTime(words) {
  const mins = Math.ceil(words / 200);
  return mins === 1 ? '1 min read' : `${mins} min read`;
}

export default function NoteEditor({ note, onSave, saving }) {
  const [title,    setTitle]    = useState('');
  const [content,  setContent]  = useState('');
  const [tags,     setTags]     = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [view,     setView]     = useState('split');
  const [dirty,    setDirty]    = useState(false);

  const textareaRef = useRef(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags || []);
      setDirty(false);
    }
  }, [note?.id]);

  const debouncedContent = useDebounce(content, 800);
  const debouncedTitle   = useDebounce(title,   800);

  useEffect(() => {
    if (!note || !dirty) return;
    onSave({ title: debouncedTitle, content: debouncedContent, tags });
  }, [debouncedTitle, debouncedContent]);

  const handleTitleChange   = (e) => { setTitle(e.target.value);   setDirty(true); };
  const handleContentChange = (e) => { setContent(e.target.value); setDirty(true); };

  const addTag = useCallback(() => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) {
      const next = [...tags, t];
      setTags(next);
      onSave({ title, content, tags: next });
    }
    setTagInput('');
  }, [tagInput, tags, title, content, onSave]);

  const removeTag = (tag) => {
    const next = tags.filter((t) => t !== tag);
    setTags(next);
    onSave({ title, content, tags: next });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const { selectionStart: s, selectionEnd: end } = e.target;
      const next = content.slice(0, s) + '  ' + content.slice(end);
      setContent(next);
      setDirty(true);
      requestAnimationFrame(() => {
        textareaRef.current.selectionStart = s + 2;
        textareaRef.current.selectionEnd   = s + 2;
      });
    }
    if (e.key === 'Enter' && e.target === document.getElementById('tag-input')) {
      e.preventDefault();
      addTag();
    }
  };

  const words = wordCount(content);

  if (!note) {
    return (
      <div className="editor-empty">
        <p>Select a note or create a new one to start editing.</p>
      </div>
    );
  }

  return (
    <div className="note-editor">
      <div className="editor-titlebar">
        <input
          id="note-title-input"
          className="title-input"
          type="text"
          placeholder="Note title…"
          value={title}
          onChange={handleTitleChange}
          aria-label="Note title"
        />
        <div className="editor-actions">
          {saving && <span className="saving-badge">Saving…</span>}
          {!saving && dirty === false && <span className="saved-badge">✓ Saved</span>}

          <div className="view-toggle" role="group" aria-label="View mode">
            <button
              id="view-editor-btn"
              className={`tog-btn ${view === 'editor' ? 'active' : ''}`}
              onClick={() => setView('editor')}
              title="Editor only"
            >
              <AlignLeft size={14} />
            </button>
            <button
              id="view-split-btn"
              className={`tog-btn ${view === 'split' ? 'active' : ''}`}
              onClick={() => setView('split')}
              title="Split view"
            >
              <Eye size={14} />
            </button>
            <button
              id="view-preview-btn"
              className={`tog-btn ${view === 'preview' ? 'active' : ''}`}
              onClick={() => setView('preview')}
              title="Preview only"
            >
              <EyeOff size={14} />
            </button>
          </div>

          <button
            id="save-note-btn"
            className="btn btn-primary btn-sm"
            onClick={() => onSave({ title, content, tags })}
            aria-label="Save note"
          >
            <Save size={14} />
            Save
          </button>
        </div>
      </div>

      <div className="stats-bar">
        <span>{words} words</span>
        <span>·</span>
        <span>{readTime(words)}</span>
        <span>·</span>
        <span>{content.length} chars</span>
      </div>

      <div className="tags-bar">
        <Tag size={12} opacity={0.5} />
        {tags.map((tag) => (
          <span key={tag} className="tag-chip">
            {tag}
            <button
              className="tag-remove"
              onClick={() => removeTag(tag)}
              aria-label={`Remove tag ${tag}`}
            >
              <X size={10} />
            </button>
          </span>
        ))}
        <input
          id="tag-input"
          className="tag-input"
          type="text"
          placeholder="Add tag…"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          aria-label="Add tag"
        />
      </div>

      <div className={`editor-split view-${view}`}>
        {view !== 'preview' && (
          <div className="editor-pane">
            <div className="pane-label">MARKDOWN</div>
            <textarea
              id="markdown-editor"
              ref={textareaRef}
              className="md-textarea"
              value={content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              placeholder={'# Your note\n\nStart writing in **Markdown**…'}
              spellCheck="true"
              aria-label="Markdown editor"
            />
          </div>
        )}
        {view !== 'editor' && (
          <div className="preview-wrapper">
            <div className="pane-label">PREVIEW</div>
            <MarkdownPreview content={content} />
          </div>
        )}
      </div>
    </div>
  );
}

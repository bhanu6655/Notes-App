import { Search, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function SearchBar({ value, onChange, onClear }) {
  const inputRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="search-bar">
      <Search size={15} className="search-icon" />
      <input
        id="search-input"
        ref={inputRef}
        type="text"
        placeholder="Search notes… (Ctrl+K)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search notes"
      />
      {value && (
        <button
          id="clear-search-btn"
          className="clear-btn"
          onClick={onClear}
          aria-label="Clear search"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}

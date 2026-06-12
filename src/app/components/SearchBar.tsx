'use client';

import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps<T> {
  items: T[];
  searchFn: (item: T, query: string) => boolean;
  renderItem: (item: T) => React.ReactNode;
  placeholder?: string;
  emptyMessage?: string;
  minChars?: number;
}

export default function SearchBar<T extends object>({
  items,
  searchFn,
  renderItem,
  placeholder = 'Поиск...',
  emptyMessage = 'Ничего не найдено',
  minChars = 1,
}: SearchBarProps<T>) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (query.trim().length < minChars) return [];
    return items.filter(item => searchFn(item, query.trim().toLowerCase()));
  }, [query, items, searchFn, minChars]);

  const isSearching = query.trim().length >= minChars;

  return (
    <div style={{ position: 'relative' }}>
      {/* Input */}
      <div style={{ position: 'relative' }}>
        <Search size={16} style={{
          position: 'absolute', left: 12, top: '50%',
          transform: 'translateY(-50%)', color: 'var(--text-muted)',
          pointerEvents: 'none',
        }} />
        <input
          className="form-control"
          style={{ width: '100%', paddingLeft: '2.25rem', paddingRight: query ? '2.25rem' : '1rem' }}
          placeholder={placeholder}
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            style={{
              position: 'absolute', right: 10, top: '50%',
              transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', padding: 2,
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {isSearching && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: 10, zIndex: 50,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          maxHeight: 360, overflowY: 'auto',
        }}>
          {results.length === 0 ? (
            <div style={{ padding: '1rem 1.25rem', color: '#000000', fontSize: '0.9rem' }}>
              {emptyMessage}    
            </div>
          ) : (
            results.map((item, i) => (
              <div key={i} style={{ borderBottom: i < results.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                {renderItem(item)}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
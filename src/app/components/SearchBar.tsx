'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps<T> {
  items: T[];
  getSearchText: (item: T) => string;
  renderItem: (item: T, active: boolean) => React.ReactNode;

  placeholder?: string;
  minChars?: number;

  onSelect?: (item: T) => void;
  onSearch?: (query: string) => void;
}

export default function SearchBar<T>({
  items,
  getSearchText,
  renderItem,
  placeholder = 'Поиск...',
  minChars = 1,
  onSelect,
  onSearch,
}: SearchBarProps<T>) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < minChars) return [];

    return items.filter(item =>
      getSearchText(item).toLowerCase().includes(q)
    );
  }, [query, items, getSearchText, minChars]);

  // reset selection when results change
  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  const handleSelect = (item: T) => {
    onSelect?.(item);
    setQuery('');
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!results.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, results.length - 1));
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    }

    if (e.key === 'Enter') {
      e.preventDefault();

      const activeItem = results[activeIndex];

      if (activeItem) {
        handleSelect(activeItem);
      } else {
        onSearch?.(query.trim());
      }
    }

    if (e.key === 'Escape') {
      setQuery('');
      setActiveIndex(-1);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* INPUT */}
      <div style={{ position: 'relative' }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
          }}
        />

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="form-control"
          style={{
            width: '100%',
            paddingLeft: '2.25rem',
            paddingRight: query ? '2.25rem' : '1rem',
          }}
        />

        {query && (
          <button
            onClick={() => setQuery('')}
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* DROPDOWN */}
      {query.trim().length >= minChars && results.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 10,
            zIndex: 50,
            maxHeight: 360,
            overflowY: 'auto',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          }}
        >
          {results.map((item, i) => {
            const active = i === activeIndex;

            return (
              <div
                key={i}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseDown={() => handleSelect(item)}
                style={{
                  background: active ? 'rgba(0,0,0,0.05)' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                {renderItem(item, active)}
              </div>
            );
          })}
        </div>
      )}

      {/* EMPTY STATE */}
      {query.trim().length >= minChars && results.length === 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 10,
            padding: '1rem',
            color: 'var(--text-muted)',
            zIndex: 50,
          }}
        >
          Ничего не найдено
        </div>
      )}
    </div>
  );
}
'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps<T> {
  items: T[];
  getSearchText: (item: T) => string;
  renderItem: (item: T, active: boolean) => React.ReactNode;

  getDisplayValue?: (item: T) => string;

  placeholder?: string;
  minChars?: number;

  onSelect?: (item: T) => void;
  onSearch?: (query: string) => void;
  onQueryChange?: (query: string) => void;
}

export default function SearchBar<T>({
  items,
  getSearchText,
  renderItem,
  getDisplayValue,
  placeholder = 'Поиск...',
  minChars = 1,
  onSelect,
  onSearch,
  onQueryChange,
}: SearchBarProps<T>) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < minChars) return [];

    return items.filter(item =>
      getSearchText(item).toLowerCase().includes(q)
    );
  }, [query, items, getSearchText, minChars]);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setActiveIndex(-1);
    setIsOpen(true);
    onQueryChange?.(val);
  };

  const handleSelect = (item: T) => {
    const displayVal = getDisplayValue ? getDisplayValue(item) : getSearchText(item);
    setQuery(displayVal);
    setActiveIndex(-1);
    setIsOpen(false);
    onSelect?.(item);
    onQueryChange?.(displayVal);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();

      const activeItem = results[activeIndex];

      if (activeItem) {
        handleSelect(activeItem);
      } else {
        setIsOpen(false);
        onSearch?.(query.trim());
        onQueryChange?.(query.trim());
      }
      return;
    }

    if (!results.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, results.length - 1));
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
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
          onChange={handleQueryChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
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
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              onQueryChange?.('');
            }}
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
      {isOpen && query.trim().length >= minChars && results.length > 0 && (
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
      {isOpen && query.trim().length >= minChars && results.length === 0 && (
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
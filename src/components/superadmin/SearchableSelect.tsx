'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { HiOutlineSearch, HiChevronDown, HiX } from 'react-icons/hi';

export interface SearchableOption {
  value: string;
  label: string;
}

interface Props {
  id?: string;
  options: SearchableOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
}

/**
 * Selector con búsqueda por texto: input filtrable + lista desplegable,
 * navegable con flechas y Enter.
 */
export default function SearchableSelect({
  id,
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  emptyMessage = 'Sin resultados',
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = useMemo(
    () => options.find((o) => o.value === value) || null,
    [options, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    setHighlighted(0);
  }, [query, open]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.children[highlighted] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [highlighted, open]);

  const openList = () => {
    if (disabled) return;
    setOpen(true);
    setQuery('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const select = (option: SearchableOption) => {
    onChange(option.value);
    setOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const option = filtered[highlighted];
      if (option) select(option);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {open ? (
        <div className="relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            ref={inputRef}
            id={id}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe para buscar..."
            autoComplete="off"
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-blue-500 bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      ) : (
        <button
          type="button"
          id={id}
          onClick={openList}
          disabled={disabled}
          className={`w-full flex items-center justify-between gap-2 text-left pl-3 pr-2 py-2.5 text-sm rounded-lg border border-gray-300 bg-gray-50 ${
            disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-gray-400'
          }`}
        >
          <span className={selected ? 'text-gray-900 truncate' : 'text-gray-500 truncate'}>
            {selected ? selected.label : placeholder}
          </span>
          <span className="flex items-center gap-1 flex-shrink-0">
            {selected && !disabled && (
              <HiX
                className="h-4 w-4 text-gray-400 hover:text-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                }}
              />
            )}
            <HiChevronDown className="h-4 w-4 text-gray-500" />
          </span>
        </button>
      )}

      {open && (
        <ul
          ref={listRef}
          className="absolute z-30 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-gray-500">{emptyMessage}</li>
          ) : (
            filtered.map((o, i) => (
              <li
                key={o.value}
                onMouseDown={(e) => {
                  e.preventDefault();
                  select(o);
                }}
                onMouseEnter={() => setHighlighted(i)}
                className={`px-3 py-2 text-sm cursor-pointer ${
                  i === highlighted ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                } ${o.value === value ? 'font-semibold' : ''}`}
              >
                {o.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

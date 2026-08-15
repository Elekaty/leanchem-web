import { useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { SearchIcon } from './Icons'
import {
  highlightMatch,
  searchProductsTypeahead,
  type RankedHit,
} from '../lib/catalogDiscovery'

const FIELD_LABEL: Record<RankedHit['field'], string> = {
  name: 'Name',
  cas: 'CAS',
  grade: 'Grade',
}

interface CatalogTypeaheadProps {
  /** Controlled query synced with catalog URL/search. */
  value?: string
  onQueryChange?: (q: string) => void
  /** When true, selecting a hit navigates to PDP; otherwise applies catalog filter. */
  navigateOnSelect?: boolean
  placeholder?: string
  className?: string
  id?: string
}

export function CatalogTypeahead({
  value,
  onQueryChange,
  navigateOnSelect = false,
  placeholder = 'Search by name, CAS, or grade…',
  className = '',
  id,
}: CatalogTypeaheadProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const listboxId = `${inputId}-listbox`
  const navigate = useNavigate()
  const rootRef = useRef<HTMLDivElement>(null)
  const [internal, setInternal] = useState(value ?? '')
  const [open, setOpen] = useState(false)
  const [hits, setHits] = useState<RankedHit[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [fetching, setFetching] = useState(false)

  const query = internal

  useEffect(() => {
    if (value !== undefined) setInternal(value)
  }, [value])

  useEffect(() => {
    const q = query.trim()
    if (q.length < 3) {
      setHits([])
      setFetching(false)
      setActiveIndex(-1)
      return
    }
    setFetching(true)
    const t = window.setTimeout(() => {
      setHits(searchProductsTypeahead(q))
      setFetching(false)
      setActiveIndex(-1)
    }, 180)
    return () => window.clearTimeout(t)
  }, [query])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const setQuery = (next: string) => {
    setInternal(next)
  }

  const applyHit = (hit: RankedHit) => {
    setOpen(false)
    setInternal(hit.product.name)
    if (navigateOnSelect) {
      void navigate({ to: '/catalog/$slug', params: { slug: hit.product.slug } })
      return
    }
    onQueryChange?.(hit.product.name)
    void navigate({
      to: '/catalog',
      search: (prev) => ({ ...prev, q: hit.product.name }),
    })
  }

  const commitSearch = () => {
    setOpen(false)
    const q = query.trim()
    onQueryChange?.(q)
    void navigate({
      to: '/catalog',
      search: (prev) => ({ ...prev, q: q || undefined }),
    })
  }

  const showDropdown = open && query.trim().length >= 3

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <label className="sr-only" htmlFor={inputId}>
        Search catalog
      </label>
      <div className="relative flex items-center">
        <SearchIcon className="pointer-events-none absolute left-3 h-4 w-4 text-organza" />
        <input
          id={inputId}
          type="search"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined
          }
          autoComplete="off"
          value={query}
          placeholder={placeholder}
          className="h-11 w-full rounded border border-organza/40 bg-white py-2 pr-3 pl-10 text-sm text-velvet outline-none focus:border-adamantine"
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (!showDropdown) {
              if (e.key === 'Enter') {
                e.preventDefault()
                commitSearch()
              }
              return
            }
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActiveIndex((i) => Math.min(i + 1, hits.length - 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActiveIndex((i) => Math.max(i - 1, 0))
            } else if (e.key === 'Enter') {
              e.preventDefault()
              if (activeIndex >= 0 && hits[activeIndex]) applyHit(hits[activeIndex])
              else commitSearch()
            } else if (e.key === 'Escape') {
              setOpen(false)
            }
          }}
        />
      </div>

      {showDropdown ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-40 mt-1 max-h-80 w-full overflow-auto rounded-lg border border-organza/35 bg-white py-1 shadow-lg"
        >
          {fetching ? (
            <li className="px-3 py-2 text-sm text-velvet/55">Searching…</li>
          ) : hits.length === 0 ? (
            <li className="px-3 py-2 text-sm text-velvet/55">No matches for “{query.trim()}”</li>
          ) : (
            hits.map((hit, index) => (
              <li
                key={hit.product.id}
                id={`${listboxId}-opt-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                className={`cursor-pointer px-3 py-2 ${
                  index === activeIndex ? 'bg-canvas' : 'hover:bg-canvas'
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(e) => {
                  e.preventDefault()
                  applyHit(hit)
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-velvet">
                    {highlightMatch(hit.product.name, query).map((part, i) =>
                      part.match ? (
                        <mark
                          key={i}
                          className="rounded-sm bg-adamantine/25 px-0.5 font-bold text-lapis"
                        >
                          {part.text}
                        </mark>
                      ) : (
                        <span key={i}>{part.text}</span>
                      ),
                    )}
                  </p>
                  <span className="shrink-0 text-[0.65rem] font-semibold tracking-wide text-organza uppercase">
                    {FIELD_LABEL[hit.field]}
                  </span>
                </div>
                <p className="mt-0.5 text-xs font-semibold text-lapis">
                  CAS{' '}
                  {highlightMatch(hit.product.casNumber, query).map((part, i) =>
                    part.match ? (
                      <mark
                        key={i}
                        className="rounded-sm bg-adamantine/25 px-0.5 font-semibold text-lapis"
                      >
                        {part.text}
                      </mark>
                    ) : (
                      <span key={i}>{part.text}</span>
                    ),
                  )}
                  <span className="mx-1.5 text-organza">·</span>
                  Grade{' '}
                  {highlightMatch(hit.product.purity, query).map((part, i) =>
                    part.match ? (
                      <mark
                        key={i}
                        className="rounded-sm bg-adamantine/25 px-0.5 font-semibold text-lapis"
                      >
                        {part.text}
                      </mark>
                    ) : (
                      <span key={i}>{part.text}</span>
                    ),
                  )}
                </p>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  )
}

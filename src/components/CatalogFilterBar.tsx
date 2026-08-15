import { useEffect, useId, useRef, useState } from 'react'
import type { CatalogSort } from '../lib/catalogDiscovery'
import { ChevronIcon } from './Icons'

export interface CatalogFiltersState {
  hsChapters: string[]
  purities: string[]
  packagingSizes: string[]
  inStockOnly: boolean
  sort: CatalogSort
}

interface FacetOption {
  value: string
  count: number
  label?: string
}

interface CatalogFilterBarProps {
  facets: {
    hsChapters: FacetOption[]
    purities: FacetOption[]
    packagingSizes: FacetOption[]
  }
  value: CatalogFiltersState
  onChange: (next: CatalogFiltersState) => void
  resultCount: number
}

const SORT_OPTIONS: Array<{ value: CatalogSort; label: string }> = [
  { value: 'name_asc', label: 'Name A–Z' },
  { value: 'name_desc', label: 'Name Z–A' },
  { value: 'purity_desc', label: 'Purity (high first)' },
  { value: 'stock_first', label: 'In stock first' },
]

export function CatalogFilterBar({
  facets,
  value,
  onChange,
  resultCount,
}: CatalogFilterBarProps) {
  const hsLabels = Object.fromEntries(
    facets.hsChapters.map((o) => [o.value, o.label ?? `HS ${o.value}`]),
  )

  return (
    <div className="rounded-lg border border-organza/30 bg-white p-3 shadow-[0_1px_2px_rgba(34,34,53,0.04)]">
      <div className="flex flex-wrap items-center gap-2">
        <MultiSelectDropdown
          label="HS Chapter"
          options={facets.hsChapters.map((o) => ({
            ...o,
            label: o.label ?? `HS ${o.value}`,
          }))}
          selected={value.hsChapters}
          onChange={(hsChapters) => onChange({ ...value, hsChapters })}
        />
        <MultiSelectDropdown
          label="Purity Grade"
          options={facets.purities}
          selected={value.purities}
          onChange={(purities) => onChange({ ...value, purities })}
        />
        <MultiSelectDropdown
          label="Packaging Size"
          options={facets.packagingSizes}
          selected={value.packagingSizes}
          onChange={(packagingSizes) => onChange({ ...value, packagingSizes })}
        />

        <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded border border-organza/40 bg-canvas px-3 text-sm font-semibold text-velvet">
          <input
            type="checkbox"
            className="accent-lapis"
            checked={value.inStockOnly}
            onChange={(e) => onChange({ ...value, inStockOnly: e.target.checked })}
          />
          In Stock Only
        </label>

        <label className="ml-auto inline-flex h-10 items-center gap-2 text-sm font-semibold text-velvet">
          <span className="text-velvet/55">Sort By</span>
          <select
            className="h-10 rounded border border-organza/40 bg-white px-2 font-semibold text-lapis outline-none focus:border-adamantine"
            value={value.sort}
            onChange={(e) =>
              onChange({ ...value, sort: e.target.value as CatalogSort })
            }
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-velvet/55">
        <p>
          <span className="font-semibold text-lapis">{resultCount}</span> products
          {value.hsChapters.length ||
          value.purities.length ||
          value.packagingSizes.length ||
          value.inStockOnly
            ? ' · filters active'
            : ''}
        </p>
        {value.hsChapters.length ||
        value.purities.length ||
        value.packagingSizes.length ||
        value.inStockOnly ? (
          <button
            type="button"
            className="font-semibold text-adamantine hover:underline"
            onClick={() =>
              onChange({
                hsChapters: [],
                purities: [],
                packagingSizes: [],
                inStockOnly: false,
                sort: value.sort,
              })
            }
          >
            Clear filters
          </button>
        ) : null}
      </div>

      {(value.hsChapters.length > 0 ||
        value.purities.length > 0 ||
        value.packagingSizes.length > 0) && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {value.hsChapters.map((v) => (
            <ActiveChip
              key={`hs-${v}`}
              label={hsLabels[v] ?? v}
              onRemove={() =>
                onChange({
                  ...value,
                  hsChapters: value.hsChapters.filter((x) => x !== v),
                })
              }
            />
          ))}
          {value.purities.map((v) => (
            <ActiveChip
              key={`p-${v}`}
              label={v}
              onRemove={() =>
                onChange({
                  ...value,
                  purities: value.purities.filter((x) => x !== v),
                })
              }
            />
          ))}
          {value.packagingSizes.map((v) => (
            <ActiveChip
              key={`pack-${v}`}
              label={v}
              onRemove={() =>
                onChange({
                  ...value,
                  packagingSizes: value.packagingSizes.filter((x) => x !== v),
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 rounded-full border border-organza/40 bg-canvas px-2.5 py-0.5 text-xs font-semibold text-velvet"
      onClick={onRemove}
    >
      {label}
      <span aria-hidden="true" className="text-organza">
        ×
      </span>
      <span className="sr-only">Remove {label}</span>
    </button>
  )
}

function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: FacetOption[]
  selected: string[]
  onChange: (next: string[]) => void
}) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const toggle = (value: string) => {
    if (selected.includes(value)) onChange(selected.filter((v) => v !== value))
    else onChange([...selected, value])
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        id={id}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`inline-flex h-10 items-center gap-1.5 rounded border px-3 text-sm font-semibold ${
          selected.length
            ? 'border-lapis bg-lapis/5 text-lapis'
            : 'border-organza/40 bg-white text-velvet'
        }`}
        onClick={() => setOpen((v) => !v)}
      >
        {label}
        {selected.length ? (
          <span className="rounded-full bg-lapis px-1.5 text-[0.65rem] text-white">
            {selected.length}
          </span>
        ) : null}
        <ChevronIcon className={`transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-labelledby={id}
          aria-multiselectable="true"
          className="absolute z-30 mt-1 max-h-64 min-w-[220px] overflow-auto rounded-lg border border-organza/35 bg-white py-1 shadow-lg"
        >
          {options.map((opt) => {
            const checked = selected.includes(opt.value)
            return (
              <li key={opt.value} role="option" aria-selected={checked}>
                <label className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-canvas">
                  <input
                    type="checkbox"
                    className="accent-lapis"
                    checked={checked}
                    onChange={() => toggle(opt.value)}
                  />
                  <span className="min-w-0 flex-1 font-normal text-velvet">
                    {opt.label ?? opt.value}
                  </span>
                  <span className="text-xs font-semibold text-organza">{opt.count}</span>
                </label>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

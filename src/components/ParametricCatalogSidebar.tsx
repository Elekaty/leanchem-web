import { Search } from 'lucide-react'
import {
  CHEMICAL_GRADES,
  MARKET_APPLICATIONS,
  type ChemicalGrade,
  type MarketApplication,
} from '../data/parametricCatalogMock'

export interface ParametricFilters {
  query: string
  markets: MarketApplication[]
  grades: ChemicalGrade[]
}

interface ParametricCatalogSidebarProps {
  value: ParametricFilters
  onChange: (next: ParametricFilters) => void
  resultCount: number
  totalCount: number
}

function toggleValue<T extends string>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

export function ParametricCatalogSidebar({
  value,
  onChange,
  resultCount,
  totalCount,
}: ParametricCatalogSidebarProps) {
  const activeFilters = value.markets.length + value.grades.length + (value.query.trim() ? 1 : 0)

  return (
    <aside className="rounded border border-organza/30 bg-white p-4 lg:sticky lg:top-24">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-bold text-velvet">Filters</h2>
        <p className="text-xs font-semibold text-velvet/50">
          {resultCount} of {totalCount}
        </p>
      </div>

      <label className="mt-4 block">
        <span className="text-xs font-semibold tracking-wide text-organza uppercase">
          CAS Number or Chemical Name
        </span>
        <span className="relative mt-1.5 block">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-organza"
            aria-hidden="true"
          />
          <input
            type="search"
            value={value.query}
            onChange={(e) => onChange({ ...value, query: e.target.value })}
            placeholder="e.g. 67-63-0 or toluene"
            className="h-11 w-full rounded border border-organza/40 bg-canvas py-2 pr-3 pl-10 text-sm outline-none focus:border-adamantine"
          />
        </span>
      </label>

      <fieldset className="mt-5">
        <legend className="text-xs font-semibold tracking-wide text-organza uppercase">
          Market Application
        </legend>
        <ul className="mt-2 space-y-2">
          {MARKET_APPLICATIONS.map((market) => (
            <li key={market}>
              <label className="flex cursor-pointer items-start gap-2.5 text-sm text-velvet">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-organza text-lapis accent-lapis"
                  checked={value.markets.includes(market)}
                  onChange={() =>
                    onChange({
                      ...value,
                      markets: toggleValue(value.markets, market),
                    })
                  }
                />
                <span className="font-semibold leading-snug">{market}</span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset className="mt-5">
        <legend className="text-xs font-semibold tracking-wide text-organza uppercase">
          Grade
        </legend>
        <ul className="mt-2 space-y-2">
          {CHEMICAL_GRADES.map((grade) => (
            <li key={grade}>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-velvet">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-organza text-lapis accent-lapis"
                  checked={value.grades.includes(grade)}
                  onChange={() =>
                    onChange({
                      ...value,
                      grades: toggleValue(value.grades, grade),
                    })
                  }
                />
                <span className="font-semibold">{grade}</span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      {activeFilters > 0 ? (
        <button
          type="button"
          className="btn btn-ghost mt-5 w-full text-xs"
          onClick={() => onChange({ query: '', markets: [], grades: [] })}
        >
          Clear all filters
        </button>
      ) : null}
    </aside>
  )
}

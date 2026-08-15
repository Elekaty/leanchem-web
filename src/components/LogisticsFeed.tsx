import { Link } from '@tanstack/react-router'
import { LOGISTICS_UPDATES } from '../data/marketing'

const STATUS_CLASS: Record<string, string> = {
  'In Transit': 'status-chip--transit',
  'Customs Cleared': 'status-chip--customs',
  Watch: 'status-chip--watch',
  Clear: 'status-chip--clear',
  'On schedule': 'status-chip--customs',
}

export function LogisticsFeed() {
  return (
    <div className="flex max-h-[420px] flex-col gap-3 overflow-y-auto pr-1">
      {LOGISTICS_UPDATES.map((row) => {
        const chipClass = STATUS_CLASS[row.status] ?? 'status-chip--clear'
        return (
          <article
            key={row.id}
            className="rounded-lg border border-organza/35 bg-white px-5 py-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-bold text-lapis">{row.corridor}</p>
              <span className={`status-chip ${chipClass}`}>[{row.status}]</span>
            </div>
            <p className="mt-1 text-xs font-semibold text-velvet/45">{row.timestamp}</p>
            <p className="mt-2 text-sm text-velvet/70">{row.summary}</p>
            <Link
              to="/news/$slug"
              params={{ slug: row.articleSlug }}
              className="mt-2 inline-block text-sm font-semibold text-adamantine no-underline hover:underline"
            >
              Read update
            </Link>
          </article>
        )
      })}
    </div>
  )
}

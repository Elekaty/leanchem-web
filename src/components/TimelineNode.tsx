import type { ReactNode } from 'react'
import type { TimelineStatus } from '../types/catalog'
import { CheckIcon } from './Icons'

interface TimelineNodeProps {
  status: TimelineStatus
  timestamp?: string
  label: string
  isLast?: boolean
  children?: ReactNode
}

export function TimelineNode({
  status,
  timestamp,
  label,
  isLast = false,
  children,
}: TimelineNodeProps) {
  const isComplete = status === 'Complete'
  const isActive = status === 'Active'
  const isAction = status === 'Action_Required'

  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      <div className="flex flex-col items-center" aria-hidden="true">
        <span
          className={`grid h-6 w-6 place-items-center rounded-full ${
            isComplete
              ? 'bg-lapis text-white'
              : isActive
                ? 'timeline-pulse border-2 border-lapis bg-white'
                : isAction
                  ? 'border-2 border-error bg-error/10'
                  : 'border-2 border-organza/50 bg-white'
          }`}
        >
          {isComplete ? <CheckIcon /> : null}
        </span>
        {!isLast ? <span className="mt-1 w-px flex-1 bg-organza/40" /> : null}
      </div>
      <div className="min-w-0 flex-1 pb-1">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-sm font-bold text-velvet">{label}</span>
          {timestamp ? (
            <time className="text-xs font-semibold text-velvet/50">{timestamp}</time>
          ) : null}
        </div>
        {isAction && children ? <div className="mt-3">{children}</div> : null}
      </div>
    </li>
  )
}

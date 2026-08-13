import type { ReactNode } from 'react'
import type { TimelineStatus } from '../../types'
import { CheckIcon } from '../Icons'
import './TimelineNode.css'

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
  const statusClass = status.toLowerCase().replace('_', '-')

  return (
    <li className={`timeline-node timeline-node--${statusClass}`}>
      <div className="timeline-node__rail" aria-hidden="true">
        <span className="timeline-node__dot">
          {status === 'Complete' ? <CheckIcon /> : null}
        </span>
        {!isLast ? <span className="timeline-node__line" /> : null}
      </div>
      <div className="timeline-node__body">
        <div className="timeline-node__header">
          <span className="timeline-node__label">{label}</span>
          {timestamp ? <time className="timeline-node__time">{timestamp}</time> : null}
        </div>
        {status === 'Action_Required' && children ? (
          <div className="timeline-node__hub">{children}</div>
        ) : null}
      </div>
    </li>
  )
}

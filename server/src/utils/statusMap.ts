import type { canonical_order_status } from './types.js'

/** Maps canonical DB status → UI display labels for the tracking timeline. */
export function mapOrderStatus(backend: string): {
  backend: string
  ui_display: string
} {
  const map: Record<string, string> = {
    draft: 'Draft',
    request_submitted: 'Pending',
    verified: 'Verified',
    delivering: 'Delivering',
    fulfilled: 'Fulfilled',
  }
  return {
    backend,
    ui_display: map[backend] ?? backend,
  }
}

export function buildTimeline(backend: string) {
  const steps = [
    { key: 'request_submitted', label: 'Order Placed' },
    { key: 'verified', label: 'Verified' },
    { key: 'delivering', label: 'Delivering' },
    { key: 'fulfilled', label: 'Fulfilled' },
  ] as const

  const order: Record<string, number> = {
    draft: -1,
    request_submitted: 0,
    verified: 1,
    delivering: 2,
    fulfilled: 3,
  }

  const current = order[backend] ?? 0

  return steps.map((step, index) => {
    let status: 'Complete' | 'Active' | 'Pending' | 'Action_Required' = 'Pending'
    if (index < current) status = 'Complete'
    else if (index === current) {
      status = backend === 'request_submitted' ? 'Action_Required' : 'Active'
    }
    return {
      id: step.key,
      label: step.label,
      status,
      taskType: status === 'Action_Required' ? ('Upload_Receipt' as const) : undefined,
    }
  })
}

export type CanonicalOrderStatus = canonical_order_status

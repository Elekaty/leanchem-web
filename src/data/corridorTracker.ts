/** Customer-scoped Ethiopian import corridor pipeline + mock buyer orders. */

export const CORRIDOR_STEPS = [
  { id: 'origin-port', label: 'Origin Port' },
  { id: 'ocean-transit', label: 'Ocean Transit' },
  { id: 'djibouti-customs', label: 'Djibouti Customs' },
  { id: 'modjo-dry-port', label: 'Modjo Dry Port' },
  { id: 'addis-delivery', label: 'Addis Delivery' },
] as const

export type CorridorStepId = (typeof CORRIDOR_STEPS)[number]['id']

export type CorridorOrderLifecycle = 'open' | 'closed'

export interface CorridorLogEntry {
  id: string
  poNumber: string
  stepId: CorridorStepId
  /** ISO-8601 timestamp (stored UTC; display in EAT). */
  timestamp: string
  message: string
}

export interface CorridorChemicalLine {
  name: string
  casNumber: string
  quantity: string
}

export interface CorridorPurchaseOrder {
  poNumber: string
  /** Buyer account this PO belongs to — never shown across accounts. */
  accountId: string
  productSummary: string
  chemicals: CorridorChemicalLine[]
  lifecycle: CorridorOrderLifecycle
  /** Index into CORRIDOR_STEPS for the current stage (0-based). Closed POs use the last step. */
  activeStepIndex: number
  logs: CorridorLogEntry[]
}

/** Demo buyer account id — matches AuthContext demo session. */
export const DEMO_BUYER_ACCOUNT_ID = 'demo-buyer'

/**
 * Active (and a few closed) POs for the demo buyer.
 * Other accounts' shipments must never appear in this list.
 */
export const CUSTOMER_CORRIDOR_ORDERS: CorridorPurchaseOrder[] = [
  {
    poNumber: 'PO-1042',
    accountId: DEMO_BUYER_ACCOUNT_ID,
    productSummary: 'Isopropyl Alcohol · Toluene · 18 MT',
    chemicals: [
      { name: 'Isopropyl Alcohol', casNumber: '67-63-0', quantity: '8 MT' },
      { name: 'Toluene', casNumber: '108-88-3', quantity: '10 MT' },
    ],
    lifecycle: 'open',
    activeStepIndex: 2, // Djibouti Customs
    logs: [
      {
        id: '1042-1',
        poNumber: 'PO-1042',
        stepId: 'origin-port',
        timestamp: '2026-07-12T08:15:00.000Z',
        message: 'Containers gated out at Shanghai — 2 × 20ft DG-rated units sealed.',
      },
      {
        id: '1042-2',
        poNumber: 'PO-1042',
        stepId: 'ocean-transit',
        timestamp: '2026-07-14T06:05:00.000Z',
        message: 'Vessel departed. Ocean transit on schedule (ETA Djibouti +11 days).',
      },
      {
        id: '1042-3',
        poNumber: 'PO-1042',
        stepId: 'djibouti-customs',
        timestamp: '2026-07-25T09:10:00.000Z',
        message: 'Vessel berthed at Doraleh. Ethiopian Customs file opened.',
      },
      {
        id: '1042-4',
        poNumber: 'PO-1042',
        stepId: 'djibouti-customs',
        timestamp: '2026-08-05T13:18:00.000Z',
        message: 'IPA line cleared by examiner; toluene DG paperwork pending final stamp.',
      },
      {
        id: '1042-5',
        poNumber: 'PO-1042',
        stepId: 'djibouti-customs',
        timestamp: '2026-08-15T07:00:00.000Z',
        message: 'Container dwell within SLA.',
      },
    ],
  },
  {
    poNumber: 'PO-1045',
    accountId: DEMO_BUYER_ACCOUNT_ID,
    productSummary: 'Sodium Hydroxide (Pellets) · 12 MT',
    chemicals: [
      { name: 'Sodium Hydroxide (Pellets)', casNumber: '1310-73-2', quantity: '12 MT' },
    ],
    lifecycle: 'open',
    activeStepIndex: 3, // Modjo Dry Port
    logs: [
      {
        id: '1045-1',
        poNumber: 'PO-1045',
        stepId: 'origin-port',
        timestamp: '2026-06-20T10:00:00.000Z',
        message: 'Bags loaded and sealed at origin warehouse.',
      },
      {
        id: '1045-2',
        poNumber: 'PO-1045',
        stepId: 'ocean-transit',
        timestamp: '2026-06-22T07:30:00.000Z',
        message: 'Ocean transit underway — ETA Djibouti confirmed.',
      },
      {
        id: '1045-3',
        poNumber: 'PO-1045',
        stepId: 'djibouti-customs',
        timestamp: '2026-07-08T09:40:00.000Z',
        message: 'Customs release issued. Inland transfer to Modjo booked.',
      },
      {
        id: '1045-4',
        poNumber: 'PO-1045',
        stepId: 'modjo-dry-port',
        timestamp: '2026-07-18T08:00:00.000Z',
        message: 'Arrived at Modjo Dry Port. Yard slot assigned — awaiting plant delivery booking.',
      },
      {
        id: '1045-5',
        poNumber: 'PO-1045',
        stepId: 'modjo-dry-port',
        timestamp: '2026-08-14T11:20:00.000Z',
        message: 'Inland rail transfer complete. Container dwell within SLA.',
      },
    ],
  },
  {
    poNumber: 'PO-1038',
    accountId: DEMO_BUYER_ACCOUNT_ID,
    productSummary: 'Titanium Dioxide · 9 MT',
    chemicals: [
      { name: 'Titanium Dioxide (Rutile)', casNumber: '13463-67-7', quantity: '9 MT' },
    ],
    lifecycle: 'open',
    activeStepIndex: 1, // Ocean Transit
    logs: [
      {
        id: '1038-1',
        poNumber: 'PO-1038',
        stepId: 'origin-port',
        timestamp: '2026-08-01T06:30:00.000Z',
        message: 'TiO₂ bags sealed and gated out at origin.',
      },
      {
        id: '1038-2',
        poNumber: 'PO-1038',
        stepId: 'ocean-transit',
        timestamp: '2026-08-03T14:00:00.000Z',
        message: 'Vessel departed. AIS tracking live — ETA Djibouti +12 days.',
      },
      {
        id: '1038-3',
        poNumber: 'PO-1038',
        stepId: 'ocean-transit',
        timestamp: '2026-08-12T09:45:00.000Z',
        message: 'Mid-ocean position update. Schedule remains within SLA.',
      },
    ],
  },
  {
    poNumber: 'PO-0988',
    accountId: DEMO_BUYER_ACCOUNT_ID,
    productSummary: 'Isopropyl Alcohol · 5 MT',
    chemicals: [
      { name: 'Isopropyl Alcohol', casNumber: '67-63-0', quantity: '5 MT' },
    ],
    lifecycle: 'closed',
    activeStepIndex: 4, // Addis Delivery (complete)
    logs: [
      {
        id: '0988-1',
        poNumber: 'PO-0988',
        stepId: 'origin-port',
        timestamp: '2026-05-10T08:00:00.000Z',
        message: 'Order gated out at origin.',
      },
      {
        id: '0988-2',
        poNumber: 'PO-0988',
        stepId: 'addis-delivery',
        timestamp: '2026-06-08T12:00:00.000Z',
        message: 'Delivered to plant gate in Addis. POD signed — order closed.',
      },
    ],
  },
]

/** @deprecated Use CUSTOMER_CORRIDOR_ORDERS — kept for any legacy imports. */
export const ACTIVE_CORRIDOR_PO = CUSTOMER_CORRIDOR_ORDERS[0]!

export function ordersForAccount(accountId: string): CorridorPurchaseOrder[] {
  if (!accountId) return []
  const staticOrders = CUSTOMER_CORRIDOR_ORDERS.filter((po) => po.accountId === accountId)
  let registered: CorridorPurchaseOrder[] = []
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem('leanchem.customer.orders.v1')
      if (raw) {
        const map = JSON.parse(raw) as Record<string, CorridorPurchaseOrder[]>
        registered = map[accountId] ?? []
      }
    } catch {
      registered = []
    }
  }
  return [...staticOrders, ...registered]
}

export function formatEatTimestamp(iso: string): string {
  try {
    return (
      new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Addis_Ababa',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date(iso)) + ' EAT'
    )
  } catch {
    return iso
  }
}

/** Human-readable date for Live Updates (e.g. "15 Aug 2026"). */
export function formatLiveUpdateDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Addis_Ababa',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

/** Only return log lines for this PO (never mix other shipments). */
export function logsForPurchaseOrder(po: CorridorPurchaseOrder): CorridorLogEntry[] {
  return po.logs
    .filter((entry) => entry.poNumber === po.poNumber)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export function stepLabelForIndex(index: number): string {
  return CORRIDOR_STEPS[index]?.label ?? 'Unknown'
}

/** Map DB `current_stage` label → stepper index (0-based). */
export function stageLabelToIndex(stage: string): number {
  const normalized = stage.trim().toLowerCase()
  const idx = CORRIDOR_STEPS.findIndex((s) => s.label.toLowerCase() === normalized)
  return idx >= 0 ? idx : 0
}

export function stepIdForStageLabel(stage: string): CorridorStepId {
  return CORRIDOR_STEPS[stageLabelToIndex(stage)]!.id
}

/** Build a timeline row for a Realtime / admin stage change. */
export function makeStageUpdateLog(input: {
  poNumber: string
  stage: string
  timestamp?: string
}): CorridorLogEntry {
  const timestamp = input.timestamp ?? new Date().toISOString()
  return {
    id: `rt-${input.poNumber}-${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
    poNumber: input.poNumber,
    stepId: stepIdForStageLabel(input.stage),
    timestamp,
    message: `Stage updated to ${input.stage} by LeanChem Logistics`,
  }
}

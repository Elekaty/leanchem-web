/** Customer-scoped Ethiopian import corridor pipeline + mock buyer orders. */

export const CORRIDOR_STEPS = [
  { id: 'origin-port', label: 'Origin Port' },
  { id: 'ocean-transit', label: 'Ocean Transit' },
  { id: 'djibouti-port', label: 'Djibouti Port' },
  { id: 'customs-clearance', label: 'Customs Clearance' },
  { id: 'modjo-dry-port', label: 'Modjo Dry Port' },
  { id: 'final-delivery', label: 'Final Delivery' },
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
  /** Individual chemical lines on this PO (a buyer may have several concurrent). */
  chemicals: CorridorChemicalLine[]
  lifecycle: CorridorOrderLifecycle
  /** Index into CORRIDOR_STEPS for the current stage (0-based). Closed POs use the last step. */
  activeStepIndex: number
  logs: CorridorLogEntry[]
}

/** Demo buyer account id — matches AuthContext demo session. */
export const DEMO_BUYER_ACCOUNT_ID = 'demo-buyer'

/**
 * Orders belonging to the demo buyer only.
 * Other accounts' shipments must never appear in this list.
 */
export const CUSTOMER_CORRIDOR_ORDERS: CorridorPurchaseOrder[] = [
  {
    poNumber: 'PO-2026-1142',
    accountId: DEMO_BUYER_ACCOUNT_ID,
    productSummary: 'Isopropyl Alcohol · Toluene · 18 MT',
    chemicals: [
      { name: 'Isopropyl Alcohol', casNumber: '67-63-0', quantity: '8 MT' },
      { name: 'Toluene', casNumber: '108-88-3', quantity: '10 MT' },
    ],
    lifecycle: 'open',
    activeStepIndex: 3, // Customs Clearance
    logs: [
      {
        id: '1142-1',
        poNumber: 'PO-2026-1142',
        stepId: 'origin-port',
        timestamp: '2026-07-12T08:15:00.000Z',
        message: 'Your containers gated out at Shanghai — 2 × 20ft DG-rated units sealed.',
      },
      {
        id: '1142-2',
        poNumber: 'PO-2026-1142',
        stepId: 'ocean-transit',
        timestamp: '2026-07-14T06:05:00.000Z',
        message: 'Vessel departed. Ocean transit on schedule (ETA Djibouti +11 days).',
      },
      {
        id: '1142-3',
        poNumber: 'PO-2026-1142',
        stepId: 'djibouti-port',
        timestamp: '2026-07-25T09:10:00.000Z',
        message: 'Vessel berthed at Doraleh. Discharge window allocated for your cargo.',
      },
      {
        id: '1142-4',
        poNumber: 'PO-2026-1142',
        stepId: 'customs-clearance',
        timestamp: '2026-07-28T07:30:00.000Z',
        message: 'Customs declaration lodged. SDS pack and commercial invoice under review.',
      },
      {
        id: '1142-5',
        poNumber: 'PO-2026-1142',
        stepId: 'customs-clearance',
        timestamp: '2026-08-05T13:18:00.000Z',
        message:
          'Live: IPA line cleared by examiner; toluene DG paperwork pending final stamp.',
      },
    ],
  },
  {
    poNumber: 'PO-2026-1098',
    accountId: DEMO_BUYER_ACCOUNT_ID,
    productSummary: 'Sodium Hydroxide (Pellets) · 12 MT',
    chemicals: [
      { name: 'Sodium Hydroxide (Pellets)', casNumber: '1310-73-2', quantity: '12 MT' },
    ],
    lifecycle: 'open',
    activeStepIndex: 4, // Modjo Dry Port
    logs: [
      {
        id: '1098-1',
        poNumber: 'PO-2026-1098',
        stepId: 'origin-port',
        timestamp: '2026-06-20T10:00:00.000Z',
        message: 'Bags loaded and sealed at origin warehouse for your NaOH order.',
      },
      {
        id: '1098-2',
        poNumber: 'PO-2026-1098',
        stepId: 'ocean-transit',
        timestamp: '2026-06-22T07:30:00.000Z',
        message: 'Ocean transit underway — ETA Djibouti confirmed.',
      },
      {
        id: '1098-3',
        poNumber: 'PO-2026-1098',
        stepId: 'djibouti-port',
        timestamp: '2026-07-02T11:15:00.000Z',
        message: 'Discharged at Djibouti and handed to Ethiopian Customs file.',
      },
      {
        id: '1098-4',
        poNumber: 'PO-2026-1098',
        stepId: 'customs-clearance',
        timestamp: '2026-07-08T09:40:00.000Z',
        message: 'Customs release issued. Inland transfer to Modjo booked.',
      },
      {
        id: '1098-5',
        poNumber: 'PO-2026-1098',
        stepId: 'modjo-dry-port',
        timestamp: '2026-07-18T08:00:00.000Z',
        message: 'Your cargo arrived at Modjo Dry Port. Yard slot assigned — awaiting plant delivery booking.',
      },
    ],
  },
  {
    poNumber: 'PO-2026-0988',
    accountId: DEMO_BUYER_ACCOUNT_ID,
    productSummary: 'Isopropyl Alcohol · 5 MT',
    chemicals: [
      { name: 'Isopropyl Alcohol', casNumber: '67-63-0', quantity: '5 MT' },
    ],
    lifecycle: 'closed',
    activeStepIndex: 5, // Final Delivery (complete)
    logs: [
      {
        id: '0988-1',
        poNumber: 'PO-2026-0988',
        stepId: 'origin-port',
        timestamp: '2026-05-10T08:00:00.000Z',
        message: 'Order gated out at origin.',
      },
      {
        id: '0988-2',
        poNumber: 'PO-2026-0988',
        stepId: 'final-delivery',
        timestamp: '2026-06-08T12:00:00.000Z',
        message: 'Delivered to your plant gate. POD signed — order closed.',
      },
    ],
  },
  {
    poNumber: 'PO-2026-0912',
    accountId: DEMO_BUYER_ACCOUNT_ID,
    productSummary: 'Calcium Chloride Anhydrous · 16 MT',
    chemicals: [
      { name: 'Calcium Chloride Anhydrous', casNumber: '10043-52-4', quantity: '16 MT' },
    ],
    lifecycle: 'closed',
    activeStepIndex: 5,
    logs: [
      {
        id: '0912-1',
        poNumber: 'PO-2026-0912',
        stepId: 'final-delivery',
        timestamp: '2026-05-22T14:20:00.000Z',
        message: 'Bulk tanker offloaded at your site. Order closed.',
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

/** Only return log lines for this PO (never mix other shipments). */
export function logsForPurchaseOrder(po: CorridorPurchaseOrder): CorridorLogEntry[] {
  return po.logs
    .filter((entry) => entry.poNumber === po.poNumber)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export function stepLabelForIndex(index: number): string {
  return CORRIDOR_STEPS[index]?.label ?? 'Unknown'
}

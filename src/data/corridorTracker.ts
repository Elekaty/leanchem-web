/** Ethiopian import corridor pipeline + mock PO logistics state. */

export const CORRIDOR_STEPS = [
  { id: 'origin-port', label: 'Origin Port' },
  { id: 'ocean-transit', label: 'Ocean Transit' },
  { id: 'djibouti-port', label: 'Djibouti Port' },
  { id: 'customs-clearance', label: 'Customs Clearance' },
  { id: 'modjo-dry-port', label: 'Modjo Dry Port' },
  { id: 'final-delivery', label: 'Final Delivery' },
] as const

export type CorridorStepId = (typeof CORRIDOR_STEPS)[number]['id']

export interface CorridorLogEntry {
  id: string
  poNumber: string
  stepId: CorridorStepId
  /** ISO-8601 timestamp (stored UTC; display in EAT). */
  timestamp: string
  message: string
}

export interface CorridorPurchaseOrder {
  poNumber: string
  productSummary: string
  /** Index into CORRIDOR_STEPS for the currently active stage (0-based). */
  activeStepIndex: number
  logs: CorridorLogEntry[]
}

/** Active PO mock — currently at Customs Clearance. */
export const ACTIVE_CORRIDOR_PO: CorridorPurchaseOrder = {
  poNumber: 'PO-2026-1142',
  productSummary: 'Isopropyl Alcohol · Toluene · 18 MT',
  activeStepIndex: 3, // Customs Clearance
  logs: [
    {
      id: 'log-1',
      poNumber: 'PO-2026-1142',
      stepId: 'origin-port',
      timestamp: '2026-07-12T08:15:00.000Z',
      message: 'Containers gated out at Shanghai — 2 × 20ft DG-rated units sealed and documented.',
    },
    {
      id: 'log-2',
      poNumber: 'PO-2026-1142',
      stepId: 'origin-port',
      timestamp: '2026-07-12T14:40:00.000Z',
      message: 'Bill of lading confirmed. Vessel MSC Djibouti Express ETD locked.',
    },
    {
      id: 'log-3',
      poNumber: 'PO-2026-1142',
      stepId: 'ocean-transit',
      timestamp: '2026-07-14T06:05:00.000Z',
      message: 'Vessel departed. Ocean transit on schedule (ETA Djibouti +11 days).',
    },
    {
      id: 'log-4',
      poNumber: 'PO-2026-1142',
      stepId: 'ocean-transit',
      timestamp: '2026-07-20T11:22:00.000Z',
      message: 'Mid-voyage position update — no weather diversion; ETA unchanged.',
    },
    {
      id: 'log-5',
      poNumber: 'PO-2026-1142',
      stepId: 'djibouti-port',
      timestamp: '2026-07-25T09:10:00.000Z',
      message: 'Vessel berthed at Doraleh Multipurpose Port. Discharge window allocated.',
    },
    {
      id: 'log-6',
      poNumber: 'PO-2026-1142',
      stepId: 'djibouti-port',
      timestamp: '2026-07-26T15:45:00.000Z',
      message: 'Containers discharged and staged for Ethiopian Customs transfer file.',
    },
    {
      id: 'log-7',
      poNumber: 'PO-2026-1142',
      stepId: 'customs-clearance',
      timestamp: '2026-07-28T07:30:00.000Z',
      message: 'Customs declaration lodged. SDS pack and commercial invoice under review.',
    },
    {
      id: 'log-8',
      poNumber: 'PO-2026-1142',
      stepId: 'customs-clearance',
      timestamp: '2026-08-02T10:05:00.000Z',
      message: 'Physical inspection slot confirmed. Awaiting release order for Modjo transfer.',
    },
    {
      id: 'log-9',
      poNumber: 'PO-2026-1142',
      stepId: 'customs-clearance',
      timestamp: '2026-08-05T13:18:00.000Z',
      message: 'Live: examiner notes cleared for IPA line; toluene DG paperwork pending final stamp.',
    },
    // Noise from another PO — tracker must filter these out.
    {
      id: 'log-other-1',
      poNumber: 'PO-2026-1098',
      stepId: 'modjo-dry-port',
      timestamp: '2026-07-19T08:00:00.000Z',
      message: 'NaOH bags received at Modjo yard — not related to PO-2026-1142.',
    },
    {
      id: 'log-other-2',
      poNumber: 'PO-2026-0988',
      stepId: 'final-delivery',
      timestamp: '2026-06-15T12:00:00.000Z',
      message: 'Prior IPA delivery completed at plant gate.',
    },
  ],
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

export function logsForPurchaseOrder(
  po: CorridorPurchaseOrder,
  allLogs: CorridorLogEntry[] = po.logs,
): CorridorLogEntry[] {
  return allLogs
    .filter((entry) => entry.poNumber === po.poNumber)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

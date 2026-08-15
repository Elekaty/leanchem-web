import { json } from '@tanstack/react-start'
import { createServerFileRoute } from '@tanstack/react-start/server'
import { processPoUpdate } from '../../../server/poUpdate'

/**
 * Loop C — Logistics Tracking.
 * POST /api/po/update { poId, stage } → update purchase_orders + buyer email.
 */
export const ServerRoute = createServerFileRoute('/api/po/update').methods({
  POST: async ({ request }) => {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return json({ success: false, error: 'Invalid JSON body.' }, { status: 400 })
    }

    const result = await processPoUpdate(body)
    return json(result.payload, { status: result.status })
  },
})

import { json } from '@tanstack/react-start'
import { createServerFileRoute } from '@tanstack/react-start/server'
import { processSourcingRequest } from '../../../server/sourcingRequest'

/**
 * Loop B — Supplier Sourcing Engine.
 * POST /api/sourcing/request { rfqId } → anonymized BCC blast + status under_review.
 */
export const ServerRoute = createServerFileRoute('/api/sourcing/request').methods({
  POST: async ({ request }) => {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return json({ success: false, error: 'Invalid JSON body.' }, { status: 400 })
    }

    const result = await processSourcingRequest(body)
    return json(result.payload, { status: result.status })
  },
})

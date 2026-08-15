import { json } from '@tanstack/react-start'
import { createServerFileRoute } from '@tanstack/react-start/server'
import { processRfqSubmit } from '../../../server/rfqSubmit'

/**
 * Loop A public RFQ submit endpoint.
 * POST /api/rfq/submit → insert `rfqs` + Resend + Telegram.
 */
export const ServerRoute = createServerFileRoute('/api/rfq/submit').methods({
  POST: async ({ request }) => {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return json({ success: false, error: 'Invalid JSON body.' }, { status: 400 })
    }

    const result = await processRfqSubmit(body)
    return json(result.payload, { status: result.status })
  },
})

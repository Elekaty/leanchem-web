import { Router } from 'express'
import { z } from 'zod'
import { withUserContext } from '../db.js'
import { fail, ok } from '../utils/response.js'

export const rfqRouter = Router()

const rfqSchema = z.object({
  company_name: z.string().min(2),
  contact_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  product_slug: z.string().optional(),
  product_id: z.string().uuid().optional(),
  product_name: z.string().optional(),
  cas_number: z.string().optional(),
  volume_text: z.string().min(1),
  delivery_terms: z.string().min(2),
  market: z.string().optional(),
  intent: z.enum(['quote', 'sample']).optional(),
  notes: z.string().optional(),
})

rfqRouter.post('/', async (req, res) => {
  const parsed = rfqSchema.safeParse(req.body)
  if (!parsed.success) {
    fail(res, 'VALIDATION_ERROR', parsed.error.issues[0]?.message ?? 'Invalid RFQ payload.', 400)
    return
  }

  const body = parsed.data
  try {
    const row = await withUserContext(null, async (client) => {
      let productId = body.product_id ?? null
      let productName = body.product_name ?? null
      let cas = body.cas_number ?? null
      let slug = body.product_slug ?? null

      if (body.product_slug || body.product_id) {
        const product = await client.query(
          `SELECT id, name, cas_number, slug FROM products
           WHERE ($1::uuid IS NOT NULL AND id = $1)
              OR ($2::text IS NOT NULL AND slug = $2)
           LIMIT 1`,
          [body.product_id ?? null, body.product_slug ?? null],
        )
        if (product.rowCount) {
          productId = product.rows[0].id
          productName = product.rows[0].name
          cas = product.rows[0].cas_number
          slug = product.rows[0].slug
        }
      }

      const inserted = await client.query(
        `INSERT INTO rfq_requests (
           company_name, contact_name, email, phone,
           product_id, product_slug, product_name, cas_number,
           volume_text, delivery_terms, market, intent, notes, status
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'request_submitted')
         RETURNING id, status, created_at`,
        [
          body.company_name,
          body.contact_name,
          body.email,
          body.phone ?? null,
          productId,
          slug,
          productName,
          cas,
          body.volume_text,
          body.delivery_terms,
          body.market ?? null,
          body.intent ?? 'quote',
          body.notes ?? null,
        ],
      )
      return inserted.rows[0]
    })

    ok(
      res,
      {
        id: row.id,
        status: row.status,
        message: 'RFQ submitted. A LeanChem specialist will follow up shortly.',
        created_at: row.created_at,
      },
      201,
    )
  } catch (error) {
    console.error(error)
    fail(res, 'RFQ_SUBMIT_FAILED', 'Unable to submit RFQ. Please try again or email commercial@leanchem.et.', 500)
  }
})

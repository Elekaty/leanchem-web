import { Router } from 'express'
import { z } from 'zod'
import { withUserContext } from '../db.js'
import {
  requireAuth,
  requireVerified,
  type AuthedRequest,
} from '../middleware/auth.js'
import { fail, ok } from '../utils/response.js'
import { buildTimeline, mapOrderStatus } from '../utils/statusMap.js'

export const ordersRouter = Router()

const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        requested_quantity: z.number().int().positive(),
        packaging_preference: z.string().optional(),
      }),
    )
    .min(1),
  delivery_address: z.string().min(5),
  internal_notes: z.string().optional(),
})

ordersRouter.get('/', requireAuth, async (req: AuthedRequest, res) => {
  const user = req.user!
  try {
    const rows = await withUserContext(user.id, async (client) => {
      const result = await client.query(
        `SELECT o.id, o.status, o.created_at, o.delivery_address,
                (
                  SELECT p.name FROM order_items oi
                  JOIN products p ON p.id = oi.product_id
                  WHERE oi.order_id = o.id
                  ORDER BY oi.id ASC
                  LIMIT 1
                ) AS product_name,
                (
                  SELECT p.cas_number FROM order_items oi
                  JOIN products p ON p.id = oi.product_id
                  WHERE oi.order_id = o.id
                  ORDER BY oi.id ASC
                  LIMIT 1
                ) AS cas_number
         FROM orders o
         ORDER BY o.created_at DESC`,
      )
      return result.rows
    })

    ok(
      res,
      rows.map((row) => ({
        id: row.id,
        status: mapOrderStatus(row.status),
        created_at: row.created_at,
        product_name: row.product_name,
        cas_number: row.cas_number,
        timeline: buildTimeline(row.status),
      })),
    )
  } catch (error) {
    console.error(error)
    fail(res, 'ORDERS_FETCH_FAILED', 'Unable to retrieve orders.', 500)
  }
})

ordersRouter.get('/:id', requireAuth, async (req: AuthedRequest, res) => {
  const user = req.user!
  const { id } = req.params
  try {
    const payload = await withUserContext(user.id, async (client) => {
      const order = await client.query(
        `SELECT id, status, delivery_address, internal_notes, created_at, updated_at
         FROM orders WHERE id = $1`,
        [id],
      )
      if (!order.rowCount) return null

      const items = await client.query(
        `SELECT oi.id, oi.product_id, oi.requested_quantity, oi.packaging_preference,
                p.name AS product_name, p.cas_number
         FROM order_items oi
         LEFT JOIN products p ON p.id = oi.product_id
         WHERE oi.order_id = $1`,
        [id],
      )
      const docs = await client.query(
        `SELECT id, document_type, file_url, file_size_bytes, uploaded_at
         FROM order_documents WHERE order_id = $1
         ORDER BY uploaded_at DESC`,
        [id],
      )

      const row = order.rows[0]
      return {
        id: row.id,
        status: mapOrderStatus(row.status),
        delivery_address: row.delivery_address,
        internal_notes: row.internal_notes,
        created_at: row.created_at,
        updated_at: row.updated_at,
        items: items.rows,
        documents: docs.rows,
        timeline: buildTimeline(row.status),
        product_name: items.rows[0]?.product_name ?? null,
        cas_number: items.rows[0]?.cas_number ?? null,
      }
    })

    if (!payload) {
      fail(res, 'NOT_FOUND', 'Order not found.', 404)
      return
    }
    ok(res, payload)
  } catch (error) {
    console.error(error)
    fail(res, 'ORDER_FETCH_FAILED', 'Unable to retrieve order details.', 500)
  }
})

ordersRouter.post('/', requireAuth, requireVerified, async (req: AuthedRequest, res) => {
  const parsed = createOrderSchema.safeParse(req.body)
  if (!parsed.success) {
    fail(res, 'VALIDATION_ERROR', 'Invalid order payload.', 400)
    return
  }

  const user = req.user!
  const { items, delivery_address, internal_notes } = parsed.data

  try {
    const created = await withUserContext(user.id, async (client) => {
      const order = await client.query(
        `INSERT INTO orders (company_id, requested_by, status, delivery_address, internal_notes)
         VALUES ($1, $2, 'request_submitted', $3, $4)
         RETURNING id, status`,
        [user.company_id, user.id, delivery_address, internal_notes ?? null],
      )

      for (const item of items) {
        const product = await client.query(`SELECT id FROM products WHERE id = $1`, [
          item.product_id,
        ])
        if (!product.rowCount) {
          throw Object.assign(new Error('Product not found'), {
            code: 'PRODUCT_NOT_FOUND',
            status: 400,
            message: `Product ${item.product_id} was not found.`,
          })
        }
        await client.query(
          `INSERT INTO order_items (order_id, product_id, requested_quantity, packaging_preference)
           VALUES ($1, $2, $3, $4)`,
          [
            order.rows[0].id,
            item.product_id,
            item.requested_quantity,
            item.packaging_preference ?? null,
          ],
        )
      }

      return order.rows[0]
    })

    ok(
      res,
      {
        id: created.id,
        status: created.status,
        message: 'Order request successfully submitted.',
      },
      201,
    )
  } catch (error: unknown) {
    console.error(error)
    const e = error as { code?: string; message?: string; status?: number }
    if (e.code === 'PRODUCT_NOT_FOUND') {
      fail(res, e.code, e.message ?? 'Product not found.', e.status ?? 400)
      return
    }
    fail(
      res,
      'ORDER_SUBMIT_FAILED',
      'Unable to submit order request. Please try again.',
      500,
    )
  }
})

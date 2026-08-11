import { Router } from 'express'
import { withUserContext } from '../db.js'
import {
  canSeeEstimatedPrice,
  optionalAuth,
  requireAuth,
  type AuthedRequest,
} from '../middleware/auth.js'
import { fail, ok } from '../utils/response.js'

export const productsRouter = Router()

const HAZARD_TO_UI: Record<string, string> = {
  GHS02: 'flammable',
  GHS05: 'corrosive',
  GHS06: 'toxic',
  GHS07: 'irritant',
  GHS08: 'health',
  GHS09: 'environment',
}

productsRouter.get('/', optionalAuth, async (req: AuthedRequest, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : ''
  const page = Math.max(1, Number(req.query.page ?? 1) || 1)
  const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20) || 20))
  const sort = typeof req.query.sort === 'string' ? req.query.sort : 'name_asc'
  const offset = (page - 1) * limit

  const orderBy =
    sort === 'name_desc'
      ? 'name DESC'
      : sort === 'cas_asc'
        ? 'cas_number ASC NULLS LAST'
        : 'name ASC'

  const params: unknown[] = []
  let where = ''
  if (search) {
    params.push(`%${search}%`)
    where = `WHERE (name ILIKE $1 OR cas_number ILIKE $1)`
  }

  try {
    const showPrice = canSeeEstimatedPrice(req.user)
    const result = await withUserContext(req.user?.id ?? null, async (client) => {
      const count = await client.query(
        `SELECT COUNT(*)::int AS total FROM products ${where}`,
        params,
      )
      const listParams = [...params, limit, offset]
      const limitIdx = params.length + 1
      const offsetIdx = params.length + 2
      const rows = await client.query(
        `SELECT id, cas_number, name, purity_grade, in_stock, moq, moq_unit,
                lead_time_days, estimated_price, primary_hazard_code, physical_state
         FROM products
         ${where}
         ORDER BY ${orderBy}
         LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
        listParams,
      )
      return { total: count.rows[0].total as number, rows: rows.rows }
    })

    const items = result.rows.map((row) => {
      const item: Record<string, unknown> = {
        id: row.id,
        cas_number: row.cas_number,
        name: row.name,
        purity_grade: row.purity_grade,
        in_stock: row.in_stock,
        moq: row.moq,
        moq_unit: row.moq_unit,
        lead_time_days: row.lead_time_days,
        physical_state: row.physical_state,
        primary_hazard_code: row.primary_hazard_code,
        hazard: HAZARD_TO_UI[row.primary_hazard_code] ?? 'irritant',
      }
      // Tier 1 / unverified: strip estimated_price entirely
      if (showPrice) {
        item.estimated_price =
          row.estimated_price != null ? Number(row.estimated_price) : null
      }
      return item
    })

    const totalPages = Math.max(1, Math.ceil(result.total / limit))
    ok(res, {
      items,
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_items: result.total,
      },
    })
  } catch (error) {
    console.error(error)
    fail(res, 'CATALOG_FETCH_FAILED', 'Unable to retrieve catalog data. Please check your connection.', 500)
  }
})

productsRouter.get('/:id', optionalAuth, async (req: AuthedRequest, res) => {
  const { id } = req.params
  try {
    const showPrice = canSeeEstimatedPrice(req.user)
    const payload = await withUserContext(req.user?.id ?? null, async (client) => {
      const product = await client.query(`SELECT * FROM products WHERE id = $1`, [id])
      if (!product.rowCount) return null

      const docs = await client.query(
        `SELECT document_type AS type, file_url AS url, last_updated
         FROM product_documents WHERE product_id = $1
         ORDER BY last_updated DESC`,
        [id],
      )

      let sampleAlready = false
      if (req.user) {
        const sample = await client.query(
          `SELECT id FROM sample_requests WHERE product_id = $1 AND user_id = $2`,
          [id, req.user.id],
        )
        sampleAlready = Boolean(sample.rowCount)
      }

      const row = product.rows[0]
      const pricing =
        showPrice
          ? {
              estimated_price:
                row.estimated_price != null ? Number(row.estimated_price) : null,
              currency: row.price_currency ?? 'USD',
            }
          : null

      return {
        id: row.id,
        cas_number: row.cas_number,
        name: row.name,
        description: row.description,
        primary_hazard_code: row.primary_hazard_code,
        hazard: HAZARD_TO_UI[row.primary_hazard_code] ?? 'irritant',
        packaging: row.packaging_volumes,
        pricing,
        specs: {
          moq: row.moq,
          moq_unit: row.moq_unit,
          lead_time_days: row.lead_time_days,
          physical_state: row.physical_state,
          purity_grade: row.purity_grade,
        },
        documents: docs.rows.map((d) => ({
          type: d.type,
          url: d.url,
          last_updated:
            d.last_updated instanceof Date
              ? d.last_updated.toISOString().slice(0, 10)
              : String(d.last_updated).slice(0, 10),
        })),
        user_context: {
          sample_already_requested: sampleAlready,
          price_locked: !showPrice,
        },
      }
    })

    if (!payload) {
      fail(res, 'NOT_FOUND', 'Product not found.', 404)
      return
    }
    ok(res, payload)
  } catch (error) {
    console.error(error)
    fail(res, 'PRODUCT_FETCH_FAILED', 'Unable to retrieve product details.', 500)
  }
})

productsRouter.post('/:id/sample-request', requireAuth, async (req: AuthedRequest, res) => {
  const { id } = req.params
  const user = req.user!
  try {
    const result = await withUserContext(user.id, async (client) => {
      const product = await client.query(`SELECT id FROM products WHERE id = $1`, [id])
      if (!product.rowCount) return { kind: 'missing' as const }

      try {
        await client.query(
          `INSERT INTO sample_requests (product_id, user_id, status)
           VALUES ($1, $2, 'requested')`,
          [id, user.id],
        )
        return { kind: 'created' as const }
      } catch (err: unknown) {
        const e = err as { code?: string }
        if (e.code === '23505') return { kind: 'duplicate' as const }
        throw err
      }
    })

    if (result.kind === 'missing') {
      fail(res, 'NOT_FOUND', 'Product not found.', 404)
      return
    }
    if (result.kind === 'duplicate') {
      fail(res, 'SAMPLE_EXISTS', 'A sample has already been requested for this product.', 409)
      return
    }
    ok(res, { status: 'requested', message: 'Sample request received.' }, 201)
  } catch (error) {
    console.error(error)
    fail(res, 'SAMPLE_REQUEST_FAILED', 'Unable to submit sample request.', 500)
  }
})

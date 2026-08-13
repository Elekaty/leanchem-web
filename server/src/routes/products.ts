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

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const HAZARD_TO_UI: Record<string, string> = {
  GHS02: 'flammable',
  GHS05: 'corrosive',
  GHS06: 'toxic',
  GHS07: 'irritant',
  GHS08: 'health',
  GHS09: 'environment',
}

function mapProductRow(row: Record<string, unknown>, showPrice: boolean) {
  const packaging =
    (row.packaging_options as string | null) ??
    (row.packaging_volumes as string | null) ??
    null
  const item: Record<string, unknown> = {
    id: row.id,
    slug: row.slug,
    cas_number: row.cas_number,
    name: row.name,
    purity_grade: row.purity_grade,
    in_stock: row.in_stock,
    moq: row.moq,
    moq_unit: row.moq_unit,
    lead_time_days: row.lead_time_days,
    physical_state: row.physical_state,
    primary_hazard_code: row.primary_hazard_code,
    hazard: HAZARD_TO_UI[String(row.primary_hazard_code ?? '')] ?? 'irritant',
    packaging,
    packaging_options: packaging,
    hs_chapter: row.hs_chapter,
    industry_tags: row.industry_tags,
    seo_description: row.seo_description,
    category: inferCategory(String(row.physical_state ?? ''), String(row.name ?? '')),
  }
  if (showPrice) {
    item.estimated_price =
      row.estimated_price != null ? Number(row.estimated_price) : null
  }
  return item
}

function inferCategory(physicalState: string, name: string) {
  const n = name.toLowerCase()
  if (n.includes('acid')) return 'Acids'
  if (n.includes('toluene')) return 'Aromatics'
  if (physicalState.toLowerCase().includes('solid')) return 'Inorganics'
  return 'Solvents'
}

productsRouter.get('/', optionalAuth, async (req: AuthedRequest, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : ''
  const industry = typeof req.query.industry === 'string' ? req.query.industry.trim() : ''
  const hs = typeof req.query.hs_chapter === 'string' ? req.query.hs_chapter.trim() : ''
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
  const clauses: string[] = []
  if (search) {
    params.push(`%${search}%`)
    clauses.push(
      `(name ILIKE $${params.length} OR cas_number ILIKE $${params.length} OR slug ILIKE $${params.length})`,
    )
  }
  if (industry) {
    params.push(`%${industry}%`)
    clauses.push(`industry_tags ILIKE $${params.length}`)
  }
  if (hs) {
    params.push(hs)
    clauses.push(`hs_chapter = $${params.length}`)
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''

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
        `SELECT id, slug, cas_number, name, purity_grade, in_stock, moq, moq_unit,
                lead_time_days, estimated_price, primary_hazard_code, physical_state,
                packaging_volumes, packaging_options, hs_chapter, industry_tags, seo_description
         FROM products
         ${where}
         ORDER BY ${orderBy}
         LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
        listParams,
      )
      return { total: count.rows[0].total as number, rows: rows.rows }
    })

    const items = result.rows.map((row) => mapProductRow(row, showPrice))
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

productsRouter.get('/:idOrSlug', optionalAuth, async (req: AuthedRequest, res) => {
  const idOrSlug = String(req.params.idOrSlug)
  try {
    const showPrice = canSeeEstimatedPrice(req.user)
    const payload = await withUserContext(req.user?.id ?? null, async (client) => {
      const byUuid = UUID_RE.test(idOrSlug)
      const product = await client.query(
        byUuid
          ? `SELECT * FROM products WHERE id = $1`
          : `SELECT * FROM products WHERE slug = $1`,
        [idOrSlug],
      )
      if (!product.rowCount) return null

      const row = product.rows[0]
      const docs = await client.query(
        `SELECT document_type AS type, file_url AS url, last_updated
         FROM product_documents WHERE product_id = $1
         ORDER BY last_updated DESC`,
        [row.id],
      )

      let sampleAlready = false
      if (req.user) {
        const sample = await client.query(
          `SELECT id FROM sample_requests WHERE product_id = $1 AND user_id = $2`,
          [row.id, req.user.id],
        )
        sampleAlready = Boolean(sample.rowCount)
      }

      const packaging =
        (row.packaging_options as string | null) ??
        (row.packaging_volumes as string | null) ??
        null
      const pricing = showPrice
        ? {
            estimated_price:
              row.estimated_price != null ? Number(row.estimated_price) : null,
            currency: row.price_currency ?? 'USD',
          }
        : null

      return {
        id: row.id,
        slug: row.slug,
        cas_number: row.cas_number,
        name: row.name,
        description: row.description,
        seo_description: row.seo_description,
        primary_hazard_code: row.primary_hazard_code,
        hazard: HAZARD_TO_UI[row.primary_hazard_code] ?? 'irritant',
        packaging,
        packaging_options: packaging,
        hs_chapter: row.hs_chapter,
        industry_tags: row.industry_tags,
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

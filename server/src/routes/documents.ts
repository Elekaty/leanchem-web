import { Router } from 'express'
import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'
import { withUserContext } from '../db.js'
import { requireAuth, type AuthedRequest } from '../middleware/auth.js'
import { fail, ok } from '../utils/response.js'

export const documentsRouter = Router()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadRoot = path.resolve(__dirname, '..', '..', process.env.UPLOAD_DIR ?? 'uploads')
fs.mkdirSync(uploadRoot, { recursive: true })

const ALLOWED_MIME = new Set(['application/pdf', 'image/jpeg', 'image/png'])
const MAX_BYTES = 5 * 1024 * 1024

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')
    cb(null, `${Date.now()}-${safe}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      cb(
        Object.assign(new Error('Invalid file type. Please upload PDF, JPG, or PNG.'), {
          code: 'ERR_FILE_TYPE',
          status: 400,
        }),
      )
      return
    }
    cb(null, true)
  },
})

const metaSchema = z.object({
  entity_type: z.enum(['company', 'order']),
  entity_id: z.string().uuid(),
  document_type: z.string().min(1),
})

documentsRouter.post(
  '/upload',
  requireAuth,
  (req, res, next) => {
    upload.single('file')(req, res, (err: unknown) => {
      if (!err) return next()
      const e = err as { code?: string; message?: string; status?: number }
      if (e.code === 'LIMIT_FILE_SIZE') {
        fail(res, 'ERR_FILE_SIZE', 'File exceeds 5MB limit.', 400)
        return
      }
      if (e.code === 'ERR_FILE_TYPE') {
        fail(res, 'ERR_FILE_TYPE', e.message ?? 'Invalid file type. Please upload PDF, JPG, or PNG.', 400)
        return
      }
      fail(res, 'UPLOAD_FAILED', e.message ?? 'Upload failed.', 400)
    })
  },
  async (req: AuthedRequest, res) => {
    const user = req.user!
    if (!req.file) {
      fail(res, 'ERR_FILE_MISSING', 'A file is required.', 400)
      return
    }

    const parsed = metaSchema.safeParse(req.body)
    if (!parsed.success) {
      fs.unlink(req.file.path, () => undefined)
      fail(res, 'VALIDATION_ERROR', 'entity_type, entity_id, and document_type are required.', 400)
      return
    }

    const { entity_type, entity_id, document_type } = parsed.data
    const fileUrl = `/uploads/${req.file.filename}`

    try {
      const saved = await withUserContext(user.id, async (client) => {
        if (entity_type === 'company') {
          if (entity_id !== user.company_id) {
            throw Object.assign(new Error('You can only upload documents for your company.'), {
              code: 'FORBIDDEN',
              status: 403,
            })
          }
          if (!['business_license', 'tin_certificate'].includes(document_type)) {
            throw Object.assign(new Error('Invalid company document type.'), {
              code: 'VALIDATION_ERROR',
              status: 400,
            })
          }
          const row = await client.query(
            `INSERT INTO company_documents (company_id, document_type, file_url)
             VALUES ($1, $2, $3)
             RETURNING id, document_type, file_url, uploaded_at`,
            [entity_id, document_type, fileUrl],
          )
          return row.rows[0]
        }

        if (!['payment_receipt', 'final_invoice'].includes(document_type)) {
          throw Object.assign(new Error('Invalid order document type.'), {
            code: 'VALIDATION_ERROR',
            status: 400,
          })
        }

        const owns = await client.query(`SELECT id FROM orders WHERE id = $1`, [entity_id])
        if (!owns.rowCount) {
          throw Object.assign(new Error('Order not found or access denied.'), {
            code: 'NOT_FOUND',
            status: 404,
          })
        }

        const row = await client.query(
          `INSERT INTO order_documents (order_id, uploaded_by, document_type, file_url, file_size_bytes)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, document_type, file_url, file_size_bytes, uploaded_at`,
          [entity_id, user.id, document_type, fileUrl, req.file!.size],
        )
        return row.rows[0]
      })

      ok(res, { ...saved, message: 'Document uploaded successfully.' }, 201)
    } catch (error: unknown) {
      fs.unlink(req.file.path, () => undefined)
      console.error(error)
      const e = error as { code?: string; message?: string; status?: number }
      fail(res, e.code ?? 'UPLOAD_FAILED', e.message ?? 'Upload failed.', e.status ?? 500)
    }
  },
)

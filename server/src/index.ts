import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { authRouter } from './routes/auth.js'
import { companyRouter } from './routes/company.js'
import { documentsRouter } from './routes/documents.js'
import { ordersRouter } from './routes/orders.js'
import { productsRouter } from './routes/products.js'
import { rfqRouter } from './routes/rfq.js'
import { ok, fail } from './utils/response.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const port = Number(process.env.PORT ?? 4000)

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? true,
    credentials: true,
  }),
)
app.use(express.json({ limit: '1mb' }))
app.use(
  '/uploads',
  express.static(path.resolve(__dirname, '..', process.env.UPLOAD_DIR ?? 'uploads')),
)

app.get('/api/v1/health', (_req, res) => {
  ok(res, { status: 'ok', service: 'leanchem-api', version: 'v1' })
})

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/company', companyRouter)
app.use('/api/v1/products', productsRouter)
app.use('/api/v1/orders', ordersRouter)
app.use('/api/v1/rfq', rfqRouter)
app.use('/api/v1/documents', documentsRouter)

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  if (err && typeof err === 'object' && 'code' in err && 'message' in err) {
    const e = err as { code: string; message: string; status?: number }
    fail(res, e.code, e.message, e.status ?? 400)
    return
  }
  fail(res, 'INTERNAL_ERROR', 'An unexpected server error occurred.', 500)
})

app.listen(port, () => {
  console.log(`LeanChem API listening on http://localhost:${port}/api/v1`)
})

import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { pool } from '../db.js'
import { fail, ok } from '../utils/response.js'
import { verificationToTier } from '../utils/types.js'

export const authRouter = Router()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  company_name: z.string().min(2),
  tin_number: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

function signTokens(userId: string, companyId: string) {
  const secret = process.env.JWT_SECRET ?? 'dev-secret'
  const accessExpires = (process.env.JWT_EXPIRES_IN ?? '8h') as jwt.SignOptions['expiresIn']
  const refreshExpires = (process.env.REFRESH_TOKEN_EXPIRES_IN ?? '7d') as jwt.SignOptions['expiresIn']
  const access_token = jwt.sign({ sub: userId, company_id: companyId }, secret, {
    expiresIn: accessExpires,
  })
  const refresh_token = jwt.sign(
    { sub: userId, company_id: companyId, typ: 'refresh' },
    secret,
    { expiresIn: refreshExpires },
  )
  return { access_token, refresh_token }
}

authRouter.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    fail(res, 'VALIDATION_ERROR', 'Invalid registration payload.', 400)
    return
  }

  const { email, password, company_name, tin_number } = parsed.data
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [
      email.toLowerCase(),
    ])
    if (existing.rowCount) {
      await client.query('ROLLBACK')
      fail(res, 'EMAIL_EXISTS', 'An account with this email already exists.', 409)
      return
    }

    const company = await client.query(
      `INSERT INTO companies (name, tin_number, verification_status)
       VALUES ($1, $2, 'pending')
       RETURNING id, verification_status`,
      [company_name, tin_number ?? null],
    )

    const password_hash = await bcrypt.hash(password, 12)
    const user = await client.query(
      `INSERT INTO users (company_id, email, password_hash, role)
       VALUES ($1, $2, $3, 'super_admin')
       RETURNING id, role, company_id`,
      [company.rows[0].id, email.toLowerCase(), password_hash],
    )

    await client.query('COMMIT')
    const tokens = signTokens(user.rows[0].id, user.rows[0].company_id)
    ok(
      res,
      {
        ...tokens,
        user: {
          id: user.rows[0].id,
          role: user.rows[0].role,
          company_id: user.rows[0].company_id,
          tier: verificationToTier(company.rows[0].verification_status),
          verification_status: company.rows[0].verification_status,
        },
      },
      201,
    )
  } catch (error) {
    await client.query('ROLLBACK')
    console.error(error)
    fail(res, 'REGISTER_FAILED', 'Unable to create account. Please try again.', 500)
  } finally {
    client.release()
  }
})

authRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    fail(res, 'VALIDATION_ERROR', 'Email and password are required.', 400)
    return
  }

  const { email, password } = parsed.data
  const result = await pool.query(
    `SELECT u.id, u.role, u.company_id, u.password_hash, u.is_active,
            c.verification_status
     FROM users u
     JOIN companies c ON c.id = u.company_id
     WHERE u.email = $1`,
    [email.toLowerCase()],
  )
  const row = result.rows[0]
  if (!row || !row.is_active) {
    fail(res, 'INVALID_CREDENTIALS', 'Invalid email or password.', 401)
    return
  }

  const match = await bcrypt.compare(password, row.password_hash)
  if (!match) {
    fail(res, 'INVALID_CREDENTIALS', 'Invalid email or password.', 401)
    return
  }

  const tokens = signTokens(row.id, row.company_id)
  ok(res, {
    ...tokens,
    user: {
      id: row.id,
      role: row.role,
      company_id: row.company_id,
      tier: verificationToTier(row.verification_status),
      verification_status: row.verification_status,
    },
  })
})

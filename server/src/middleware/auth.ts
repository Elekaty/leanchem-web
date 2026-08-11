import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { pool } from '../db.js'
import type { AuthUser, VerificationStatus } from '../utils/types.js'
import { fail } from '../utils/response.js'

export interface AuthedRequest extends Request {
  user?: AuthUser
  tokenPayload?: { sub: string; company_id: string }
}

function getBearer(req: Request): string | null {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return null
  return header.slice(7)
}

async function loadUser(userId: string): Promise<AuthUser | null> {
  const result = await pool.query(
    `SELECT u.id, u.email, u.role, u.company_id, u.is_active,
            c.verification_status, c.name AS company_name
     FROM users u
     JOIN companies c ON c.id = u.company_id
     WHERE u.id = $1`,
    [userId],
  )
  const row = result.rows[0]
  if (!row || !row.is_active) return null
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    company_id: row.company_id,
    verification_status: row.verification_status as VerificationStatus,
    company_name: row.company_name,
  }
}

/** Optional auth — attaches user when a valid JWT is present. */
export async function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  try {
    const token = getBearer(req)
    if (!token) return next()
    const secret = process.env.JWT_SECRET
    if (!secret) return next()
    const payload = jwt.verify(token, secret) as { sub: string; company_id: string }
    const user = await loadUser(payload.sub)
    if (user) {
      req.user = user
      req.tokenPayload = payload
    }
    next()
  } catch {
    next()
  }
}

/** Required auth — rejects anonymous callers. */
export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const token = getBearer(req)
    if (!token) {
      fail(res, 'UNAUTHORIZED', 'Authentication required.', 401)
      return
    }
    const secret = process.env.JWT_SECRET
    if (!secret) {
      fail(res, 'SERVER_MISCONFIG', 'JWT secret is not configured.', 500)
      return
    }
    const payload = jwt.verify(token, secret) as { sub: string; company_id: string }
    const user = await loadUser(payload.sub)
    if (!user) {
      fail(res, 'UNAUTHORIZED', 'Invalid or inactive account.', 401)
      return
    }
    req.user = user
    req.tokenPayload = payload
    next()
  } catch {
    fail(res, 'UNAUTHORIZED', 'Invalid or expired access token.', 401)
  }
}

/** Tier 3 only — verified company required for order submission. */
export function requireVerified(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    fail(res, 'UNAUTHORIZED', 'Authentication required.', 401)
    return
  }
  if (req.user.verification_status !== 'verified') {
    fail(
      res,
      'VERIFICATION_REQUIRED',
      'Your account is pending verification. Ordering is restricted until compliance review is complete.',
      403,
    )
    return
  }
  next()
}

export function isPriceVisible(user?: AuthUser): boolean {
  return Boolean(user && user.verification_status === 'verified')
}

/** Spec: strip estimated_price unless requester has a valid verified JWT (Tier 3).
 *  Tier 1 anonymous and Tier 2 pending both hide numerical pricing. */
export function canSeeEstimatedPrice(user?: AuthUser): boolean {
  return isPriceVisible(user)
}

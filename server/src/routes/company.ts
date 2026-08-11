import { Router } from 'express'
import { requireAuth, type AuthedRequest } from '../middleware/auth.js'
import { ok } from '../utils/response.js'
import { verificationToTier } from '../utils/types.js'

export const companyRouter = Router()

companyRouter.get('/status', requireAuth, async (req: AuthedRequest, res) => {
  const user = req.user!
  ok(res, {
    company_id: user.company_id,
    tier: verificationToTier(user.verification_status),
    verification_status: user.verification_status,
    company_name: user.company_name,
    role: user.role,
  })
})

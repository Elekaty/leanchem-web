export type VerificationStatus = 'pending' | 'verified' | 'rejected'
export type canonical_order_status =
  | 'draft'
  | 'request_submitted'
  | 'verified'
  | 'delivering'
  | 'fulfilled'

export type UiTier = 'tier_1' | 'tier_2' | 'tier_3'

export function verificationToTier(status: VerificationStatus | null | undefined): UiTier {
  if (!status) return 'tier_1'
  if (status === 'verified') return 'tier_3'
  if (status === 'pending') return 'tier_2'
  return 'tier_1'
}

export interface AuthUser {
  id: string
  email: string
  role: string
  company_id: string
  verification_status: VerificationStatus
  company_name: string
}

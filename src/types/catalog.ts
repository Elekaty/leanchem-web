export type UserTier = 1 | 2 | 3

export type VerificationStatus = 'unverified' | 'pending' | 'verified'

export type PricingStatus = 'Available' | 'Unavailable' | 'Tier1Locked'

export type TimelineStatus = 'Complete' | 'Active' | 'Pending' | 'Action_Required'

export type ActionTaskType = 'Upload_Receipt' | 'Sign_Doc'

export type HazardPictogram =
  | 'flammable'
  | 'corrosive'
  | 'toxic'
  | 'irritant'
  | 'health'
  | 'environment'

export interface Product {
  id: string
  name: string
  casNumber: string
  purity: string
  moq: string
  physicalState: string
  packaging: string
  /** Split packaging choices for PDP / RFQ selectors. */
  packagingOptions: string[]
  leadTime: string
  estimatedPrice: number | null
  /** Primary hazard (card badge). */
  hazard: HazardPictogram
  /** Full GHS set for PDP. */
  hazards: HazardPictogram[]
  sdsUrl: string
  tdsUrl: string
  coaUrl: string
  sdsUpdatedAt: string
  category: string
  slug: string
  inStock: boolean
  hsChapter: string
  industryTags: string
  description: string
  applications: string
  handlingNotes: string
  seoTitle?: string
  seoDescription?: string
  properties: Array<{ key: string; value: string }>
}

export interface RfqLineItem {
  productId: string
  slug: string
  name: string
  casNumber: string
  quantity: string
  notes: string
  packaging: string
}

export interface OrderTimelineStep {
  id: string
  label: string
  status: TimelineStatus
  timestamp?: string
  taskType?: ActionTaskType
}

export interface Order {
  id: string
  productName: string
  casNumber: string
  placedAt: string
  steps: OrderTimelineStep[]
}

export interface UserSession {
  tier: UserTier
  verificationStatus: VerificationStatus
  displayName: string
  roleLabel: string
  siteLabel: string
  isLoggedIn: boolean
}

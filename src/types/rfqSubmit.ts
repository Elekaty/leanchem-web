/** Shared Loop A RFQ submit types (client ↔ `/api/rfq/submit`). */

export interface RfqSubmitCartItem {
  productId: string
  slug: string
  name: string
  casNumber: string
  quantity?: string
  packaging?: string
  notes?: string
}

export interface RfqSubmitRequest {
  contactName: string
  companyName: string
  email: string
  phone: string
  volume: number
  unit: string
  packaging: string
  incoterms: string
  targetDeliveryDate: string
  items: RfqSubmitCartItem[]
}

export interface RfqSubmitSuccess {
  success: true
  rfqId: string
  reference: string
}

export interface RfqSubmitFailure {
  success: false
  error: string
}

export type RfqSubmitResponse = RfqSubmitSuccess | RfqSubmitFailure

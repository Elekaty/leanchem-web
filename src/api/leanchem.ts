import { apiRequest, clearTokens, setTokens } from './client'

export interface AuthUserPayload {
  id: string
  role: string
  company_id: string
  tier: 'tier_1' | 'tier_2' | 'tier_3'
  verification_status: 'pending' | 'verified' | 'rejected'
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  user: AuthUserPayload
}

export interface CompanyStatus {
  company_id: string
  tier: 'tier_1' | 'tier_2' | 'tier_3'
  verification_status: 'pending' | 'verified' | 'rejected'
  company_name: string
  role: string
}

export interface CatalogItem {
  id: string
  slug?: string
  cas_number: string
  name: string
  purity_grade: string
  in_stock: boolean
  moq: number
  moq_unit: string
  lead_time_days?: number
  estimated_price?: number | null
  physical_state?: string
  primary_hazard_code?: string
  hazard?: string
  category?: string
  packaging?: string
  packaging_options?: string
  hs_chapter?: string
  industry_tags?: string
  seo_description?: string
}

export interface CatalogResponse {
  items: CatalogItem[]
  pagination: {
    current_page: number
    total_pages: number
    total_items: number
  }
}

export interface ProductDetail {
  id: string
  slug?: string
  cas_number: string
  name: string
  description?: string
  seo_description?: string
  primary_hazard_code: string
  hazard: string
  packaging?: string
  packaging_options?: string
  hs_chapter?: string
  industry_tags?: string
  pricing: { estimated_price: number | null; currency: string } | null
  specs: {
    moq: number
    moq_unit: string
    lead_time_days: number
    physical_state: string
    purity_grade: string
  }
  documents: Array<{ type: string; url: string; last_updated: string }>
  user_context: {
    sample_already_requested: boolean
    price_locked: boolean
  }
}

export interface OrderListItem {
  id: string
  status: { backend: string; ui_display: string }
  created_at: string
  product_name?: string
  cas_number?: string
  timeline: Array<{
    id: string
    label: string
    status: 'Complete' | 'Active' | 'Pending' | 'Action_Required'
    taskType?: 'Upload_Receipt' | 'Sign_Doc'
  }>
}

export async function login(email: string, password: string) {
  const data = await apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  setTokens(data.access_token, data.refresh_token)
  return data
}

export async function register(payload: {
  email: string
  password: string
  company_name: string
  tin_number?: string
}) {
  const data = await apiRequest<LoginResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  setTokens(data.access_token, data.refresh_token)
  return data
}

export async function fetchCompanyStatus() {
  return apiRequest<CompanyStatus>('/company/status')
}

export async function logout() {
  clearTokens()
}

export async function fetchProducts(params: {
  search?: string
  page?: number
  limit?: number
  sort?: string
  industry?: string
  hs_chapter?: string
}) {
  const q = new URLSearchParams()
  if (params.search) q.set('search', params.search)
  if (params.page) q.set('page', String(params.page))
  if (params.limit) q.set('limit', String(params.limit))
  if (params.sort) q.set('sort', params.sort)
  if (params.industry) q.set('industry', params.industry)
  if (params.hs_chapter) q.set('hs_chapter', params.hs_chapter)
  const qs = q.toString()
  return apiRequest<CatalogResponse>(`/products${qs ? `?${qs}` : ''}`)
}

export async function fetchProduct(idOrSlug: string) {
  return apiRequest<ProductDetail>(`/products/${encodeURIComponent(idOrSlug)}`)
}

export async function requestSample(productId: string) {
  return apiRequest<{ status: string; message: string }>(
    `/products/${productId}/sample-request`,
    { method: 'POST' },
  )
}

export async function createOrder(payload: {
  items: Array<{
    product_id: string
    requested_quantity: number
    packaging_preference?: string
  }>
  delivery_address: string
  internal_notes?: string
}) {
  return apiRequest<{ id: string; status: string; message: string }>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function submitRfq(payload: {
  company_name: string
  contact_name: string
  email: string
  phone?: string
  product_slug?: string
  product_id?: string
  product_name?: string
  cas_number?: string
  volume_text: string
  delivery_terms: string
  market?: string
  intent?: 'quote' | 'sample'
  notes?: string
}) {
  return apiRequest<{ id: string; status: string; message: string }>('/rfq', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function fetchOrders() {
  return apiRequest<OrderListItem[]>('/orders')
}

export async function uploadDocument(form: FormData) {
  return apiRequest<Record<string, unknown>>('/documents/upload', {
    method: 'POST',
    body: form,
  })
}

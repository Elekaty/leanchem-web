import type { CorridorPurchaseOrder } from '../data/corridorTracker'
import { DEMO_BUYER_ACCOUNT_ID } from '../data/corridorTracker'

const USERS_KEY = 'leanchem.customer.users.v1'
const ORDERS_KEY = 'leanchem.customer.orders.v1'

export interface RegisteredCustomer {
  accountId: string
  email: string
  /** SHA-256 hex digest — demo-grade client storage only. */
  passwordHash: string
  fullName: string
  companyName: string
  phone: string
  createdAt: string
}

export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function readUsers(): RegisteredCustomer[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(USERS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as RegisteredCustomer[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeUsers(users: RegisteredCustomer[]) {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function readOrderMap(): Record<string, CorridorPurchaseOrder[]> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(ORDERS_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, CorridorPurchaseOrder[]>
  } catch {
    return {}
  }
}

function writeOrderMap(map: Record<string, CorridorPurchaseOrder[]>) {
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(map))
}

export function findCustomerByEmail(email: string): RegisteredCustomer | undefined {
  const normalized = email.trim().toLowerCase()
  return readUsers().find((u) => u.email === normalized)
}

export async function ensureDemoCustomer(): Promise<void> {
  if (typeof window === 'undefined') return
  const existing = findCustomerByEmail('buyer@example.com')
  if (existing) return
  const passwordHash = await hashPassword('demo123')
  const demo: RegisteredCustomer = {
    accountId: DEMO_BUYER_ACCOUNT_ID,
    email: 'buyer@example.com',
    passwordHash,
    fullName: 'A. Bekele',
    companyName: 'Addis Industrial Chemicals PLC',
    phone: '+251 911 000 111',
    createdAt: new Date().toISOString(),
  }
  writeUsers([...readUsers(), demo])
}

export type RegisterInput = {
  email: string
  password: string
  fullName: string
  companyName: string
  phone: string
}

export type AuthResult =
  | { ok: true; customer: RegisteredCustomer }
  | { ok: false; error: string }

export async function registerCustomer(input: RegisterInput): Promise<AuthResult> {
  await ensureDemoCustomer()
  const email = input.email.trim().toLowerCase()
  if (!email || !input.password || input.password.length < 6) {
    return { ok: false, error: 'Use a valid email and a password of at least 6 characters.' }
  }
  if (!input.fullName.trim() || !input.companyName.trim()) {
    return { ok: false, error: 'Name and company are required.' }
  }
  if (findCustomerByEmail(email)) {
    return { ok: false, error: 'An account with this email already exists. Please sign in.' }
  }

  const accountId = `acct-${crypto.randomUUID().slice(0, 8)}`
  const customer: RegisteredCustomer = {
    accountId,
    email,
    passwordHash: await hashPassword(input.password),
    fullName: input.fullName.trim(),
    companyName: input.companyName.trim(),
    phone: input.phone.trim(),
    createdAt: new Date().toISOString(),
  }
  writeUsers([...readUsers(), customer])
  seedStarterOrders(accountId, customer.companyName)
  return { ok: true, customer }
}

export async function authenticateCustomer(
  email: string,
  password: string,
): Promise<AuthResult> {
  await ensureDemoCustomer()
  const customer = findCustomerByEmail(email)
  if (!customer) {
    return { ok: false, error: 'No account found for that email. Please register.' }
  }
  const hash = await hashPassword(password)
  if (hash !== customer.passwordHash) {
    return { ok: false, error: 'Incorrect password. Try again.' }
  }
  return { ok: true, customer }
}

/** Personal starter POs so a new registrant sees their own tracker immediately. */
function seedStarterOrders(accountId: string, companyName: string) {
  const map = readOrderMap()
  if (map[accountId]?.length) return

  const poOpen = `PO-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`
  const now = Date.now()
  const orders: CorridorPurchaseOrder[] = [
    {
      poNumber: poOpen,
      accountId,
      productSummary: 'Isopropyl Alcohol · 4 MT',
      chemicals: [
        { name: 'Isopropyl Alcohol', casNumber: '67-63-0', quantity: '4 MT' },
      ],
      lifecycle: 'open',
      activeStepIndex: 2,
      logs: [
        {
          id: `${poOpen}-1`,
          poNumber: poOpen,
          stepId: 'origin-port',
          timestamp: new Date(now - 10 * 86400000).toISOString(),
          message: `Order for ${companyName} gated out at origin.`,
        },
        {
          id: `${poOpen}-2`,
          poNumber: poOpen,
          stepId: 'ocean-transit',
          timestamp: new Date(now - 7 * 86400000).toISOString(),
          message: 'Ocean transit underway — ETA Djibouti confirmed.',
        },
        {
          id: `${poOpen}-3`,
          poNumber: poOpen,
          stepId: 'djibouti-customs',
          timestamp: new Date(now - 1 * 86400000).toISOString(),
          message: 'Cargo at Djibouti Customs. Discharge window allocated.',
        },
      ],
    },
    {
      poNumber: `PO-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
      accountId,
      productSummary: 'Sodium Hydroxide · 6 MT',
      chemicals: [
        { name: 'Sodium Hydroxide (Pellets)', casNumber: '1310-73-2', quantity: '6 MT' },
      ],
      lifecycle: 'open',
      activeStepIndex: 1,
      logs: [
        {
          id: `seed-naoh-1`,
          poNumber: '',
          stepId: 'origin-port',
          timestamp: new Date(now - 5 * 86400000).toISOString(),
          message: 'Second concurrent order sealed at origin warehouse.',
        },
        {
          id: `seed-naoh-2`,
          poNumber: '',
          stepId: 'ocean-transit',
          timestamp: new Date(now - 2 * 86400000).toISOString(),
          message: 'Vessel departed. Tracking for your NaOH line is live.',
        },
      ],
    },
  ]
  // Fix log poNumbers on second order
  const second = orders[1]!
  second.logs = second.logs.map((l, i) => ({
    ...l,
    id: `${second.poNumber}-${i + 1}`,
    poNumber: second.poNumber,
  }))

  map[accountId] = orders
  writeOrderMap(map)
}

export function getRegisteredOrders(accountId: string): CorridorPurchaseOrder[] {
  if (!accountId) return []
  return readOrderMap()[accountId] ?? []
}

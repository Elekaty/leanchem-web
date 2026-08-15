import { DEMO_BUYER_ACCOUNT_ID } from './corridorTracker'

/** Front-engine → Communication Engine: account manager assigned to a buyer. */
export interface AccountManager {
  id: string
  accountId: string
  fullName: string
  title: string
  email: string
  phone: string
  phoneDisplay: string
  whatsapp: string
  languages: string[]
  availability: string
  photoInitials: string
}

export interface UploadedInvoice {
  id: string
  accountId: string
  poNumber: string
  fileName: string
  uploadedAt: string
  status: 'received' | 'under_review' | 'accepted'
}

export interface CommsThreadMessage {
  id: string
  accountId: string
  direction: 'buyer' | 'manager'
  body: string
  createdAt: string
}

export const ACCOUNT_MANAGERS: AccountManager[] = [
  {
    id: 'am-sara',
    accountId: DEMO_BUYER_ACCOUNT_ID,
    fullName: 'Sara Haile',
    title: 'Key Account Manager',
    email: 'sara.haile@leanchems.com',
    phone: '+251911234567',
    phoneDisplay: '+251 911 234 567',
    whatsapp: 'https://wa.me/251911234567',
    languages: ['English', 'Amharic'],
    availability: 'Mon–Fri · 08:30–17:30 EAT',
    photoInitials: 'SH',
  },
]

export function accountManagerFor(accountId: string): AccountManager | null {
  if (!accountId) return null
  return (
    ACCOUNT_MANAGERS.find((m) => m.accountId === accountId) ?? {
      ...ACCOUNT_MANAGERS[0]!,
      accountId,
    }
  )
}

export const SEED_COMMS_MESSAGES: CommsThreadMessage[] = [
  {
    id: 'msg-1',
    accountId: DEMO_BUYER_ACCOUNT_ID,
    direction: 'manager',
    body: 'Welcome to your Tracker workspace. I will update you as each PO clears customs and Modjo.',
    createdAt: '2026-08-01T07:00:00.000Z',
  },
  {
    id: 'msg-2',
    accountId: DEMO_BUYER_ACCOUNT_ID,
    direction: 'manager',
    body: 'PO-2026-1142 is in Customs Clearance — please upload the commercial invoice when ready.',
    createdAt: '2026-08-05T10:20:00.000Z',
  },
]

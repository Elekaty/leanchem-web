import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  accountManagerFor,
  SEED_COMMS_MESSAGES,
  type AccountManager,
  type CommsThreadMessage,
  type UploadedInvoice,
} from '../data/communicationEngine'
import { useAuth } from './AuthContext'

const INVOICE_KEY = 'leanchem.comms.invoices.v1'
const MSG_KEY = 'leanchem.comms.messages.v1'

interface CommunicationContextValue {
  accountManager: AccountManager | null
  invoices: UploadedInvoice[]
  messages: CommsThreadMessage[]
  uploadInvoice: (poNumber: string, file: File) => void
  sendMessage: (body: string) => void
}

const CommunicationContext = createContext<CommunicationContextValue | null>(null)

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

/**
 * Communication Engine foundation — wires Front Engine buyer identity
 * to account-manager contact, invoice intake, and a simple message thread.
 */
export function CommunicationProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const accountId = session.isLoggedIn ? session.accountId : ''
  const [invoices, setInvoices] = useState<UploadedInvoice[]>([])
  const [messages, setMessages] = useState<CommsThreadMessage[]>(SEED_COMMS_MESSAGES)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setInvoices(loadJson(INVOICE_KEY, []))
    const stored = loadJson<CommsThreadMessage[] | null>(MSG_KEY, null)
    setMessages(stored?.length ? stored : SEED_COMMS_MESSAGES)
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    window.localStorage.setItem(INVOICE_KEY, JSON.stringify(invoices))
  }, [invoices, hydrated])

  useEffect(() => {
    if (!hydrated) return
    window.localStorage.setItem(MSG_KEY, JSON.stringify(messages))
  }, [messages, hydrated])

  const accountManager = useMemo(
    () => (accountId ? accountManagerFor(accountId) : null),
    [accountId],
  )

  const scopedInvoices = useMemo(
    () => invoices.filter((i) => i.accountId === accountId),
    [invoices, accountId],
  )

  const scopedMessages = useMemo(
    () =>
      messages
        .filter((m) => m.accountId === accountId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [messages, accountId],
  )

  const uploadInvoice = useCallback(
    (poNumber: string, file: File) => {
      if (!accountId) return
      const next: UploadedInvoice = {
        id: `inv-${Date.now()}`,
        accountId,
        poNumber,
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        status: 'received',
      }
      setInvoices((prev) => [next, ...prev])
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-up-${Date.now()}`,
          accountId,
          direction: 'buyer',
          body: `Uploaded invoice “${file.name}” for ${poNumber}.`,
          createdAt: new Date().toISOString(),
        },
      ])
    },
    [accountId],
  )

  const sendMessage = useCallback(
    (body: string) => {
      if (!accountId || !body.trim()) return
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          accountId,
          direction: 'buyer',
          body: body.trim(),
          createdAt: new Date().toISOString(),
        },
      ])
    },
    [accountId],
  )

  const value = useMemo(
    () => ({
      accountManager,
      invoices: scopedInvoices,
      messages: scopedMessages,
      uploadInvoice,
      sendMessage,
    }),
    [accountManager, scopedInvoices, scopedMessages, uploadInvoice, sendMessage],
  )

  return (
    <CommunicationContext.Provider value={value}>{children}</CommunicationContext.Provider>
  )
}

export function useCommunication() {
  const ctx = useContext(CommunicationContext)
  if (!ctx) throw new Error('useCommunication must be used within CommunicationProvider')
  return ctx
}

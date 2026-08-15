import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Product, RfqLineItem } from '../types/catalog'

const STORAGE_KEY = 'leanchem.rfq.v1'

interface RfqContextValue {
  items: RfqLineItem[]
  itemCount: number
  drawerOpen: boolean
  checkoutOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void
  openCheckout: () => void
  closeCheckout: () => void
  addProduct: (
    product: Product,
    opts?: { packaging?: string; quantity?: string; openDrawer?: boolean },
  ) => void
  updateItem: (
    productId: string,
    patch: Partial<Pick<RfqLineItem, 'quantity' | 'notes' | 'packaging'>>,
  ) => void
  removeItem: (productId: string) => void
  clear: () => void
  hasProduct: (productId: string) => boolean
}

const RfqContext = createContext<RfqContextValue | null>(null)

function loadItems(): RfqLineItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as RfqLineItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function RfqProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<RfqLineItem[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setItems(loadItems())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items, hydrated])

  const closeDrawer = useCallback(() => setDrawerOpen(false), [])
  const openDrawer = useCallback(() => {
    setCheckoutOpen(false)
    setDrawerOpen(true)
  }, [])
  const closeCheckout = useCallback(() => setCheckoutOpen(false), [])
  const openCheckout = useCallback(() => {
    setDrawerOpen(false)
    setCheckoutOpen(true)
  }, [])

  const addProduct = useCallback(
    (
      product: Product,
      opts?: { packaging?: string; quantity?: string; openDrawer?: boolean },
    ) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === product.id)
        if (existing) {
          return prev.map((i) =>
            i.productId === product.id
              ? {
                  ...i,
                  packaging: opts?.packaging ?? i.packaging,
                  quantity: opts?.quantity ?? i.quantity,
                }
              : i,
          )
        }
        return [
          ...prev,
          {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            casNumber: product.casNumber,
            quantity: opts?.quantity ?? product.moq,
            notes: '',
            packaging: opts?.packaging ?? product.packagingOptions[0] ?? product.packaging,
          },
        ]
      })
      if (opts?.openDrawer === true) {
        setCheckoutOpen(false)
        setDrawerOpen(true)
      }
    },
    [],
  )

  const updateItem = useCallback(
    (productId: string, patch: Partial<Pick<RfqLineItem, 'quantity' | 'notes' | 'packaging'>>) => {
      setItems((prev) =>
        prev.map((i) => (i.productId === productId ? { ...i, ...patch } : i)),
      )
    },
    [],
  )

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const value = useMemo<RfqContextValue>(
    () => ({
      items,
      itemCount: items.length,
      drawerOpen,
      checkoutOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer: () => setDrawerOpen((v) => !v),
      openCheckout,
      closeCheckout,
      addProduct,
      updateItem,
      removeItem,
      clear,
      hasProduct: (productId: string) => items.some((i) => i.productId === productId),
    }),
    [
      items,
      drawerOpen,
      checkoutOpen,
      openDrawer,
      closeDrawer,
      openCheckout,
      closeCheckout,
      addProduct,
      updateItem,
      removeItem,
      clear,
    ],
  )

  return <RfqContext.Provider value={value}>{children}</RfqContext.Provider>
}

export function useRfq() {
  const ctx = useContext(RfqContext)
  if (!ctx) throw new Error('useRfq must be used within RfqProvider')
  return ctx
}

export function generateRfqReference(): string {
  const d = new Date()
  const y = d.getFullYear().toString().slice(2)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `LC-RFQ-${y}${m}${day}-${rand}`
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { MOCK_PRODUCTS } from '../data/mockProducts'
import { loadCatalogProducts } from '../lib/chemicalCatalog'
import type { Product } from '../types/catalog'

interface CatalogDataValue {
  products: Product[]
  loading: boolean
  source: 'supabase' | 'mock'
  refresh: () => Promise<void>
}

const CatalogDataContext = createContext<CatalogDataValue | null>(null)

function detectSource(list: Product[]): 'supabase' | 'mock' {
  if (list.length === 0) return 'mock'
  if (list.length === MOCK_PRODUCTS.length && list.every((p, i) => p.slug === MOCK_PRODUCTS[i]?.slug)) {
    return 'mock'
  }
  return 'supabase'
}

export function CatalogDataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS)
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<'supabase' | 'mock'>('mock')

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const list = await loadCatalogProducts({ force: true })
      setProducts(list)
      setSource(detectSource(list))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const list = await loadCatalogProducts()
        if (cancelled) return
        setProducts(list)
        setSource(detectSource(list))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(
    () => ({ products, loading, source, refresh }),
    [products, loading, source, refresh],
  )

  return (
    <CatalogDataContext.Provider value={value}>{children}</CatalogDataContext.Provider>
  )
}

export function useCatalogData() {
  const ctx = useContext(CatalogDataContext)
  if (!ctx) {
    return {
      products: MOCK_PRODUCTS,
      loading: false,
      source: 'mock' as const,
      refresh: async () => {},
    }
  }
  return ctx
}

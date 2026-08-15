import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

interface LiveRegionContextValue {
  announce: (message: string) => void
}

const LiveRegionContext = createContext<LiveRegionContextValue | null>(null)

export function LiveRegionProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  const announce = useCallback((next: string) => {
    setMessage('')
    window.requestAnimationFrame(() => setMessage(next))
    setToast(next)
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 2400)
    return () => window.clearTimeout(t)
  }, [toast])

  const value = useMemo(() => ({ announce }), [announce])

  return (
    <LiveRegionContext.Provider value={value}>
      {children}
      <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
        {message}
      </div>
      {toast ? (
        <div
          className="pointer-events-none fixed bottom-24 left-1/2 z-[70] w-[min(92vw,22rem)] -translate-x-1/2 md:bottom-8"
          role="status"
          aria-live="polite"
        >
          <p className="rounded border border-white/10 bg-velvet/95 px-4 py-2.5 text-center text-sm font-semibold tracking-tight text-white shadow-[0_8px_24px_rgba(34,34,53,0.28)] backdrop-blur-sm">
            {toast}
          </p>
        </div>
      ) : null}
    </LiveRegionContext.Provider>
  )
}

export function useLiveRegion() {
  const ctx = useContext(LiveRegionContext)
  if (!ctx) throw new Error('useLiveRegion must be used within LiveRegionProvider')
  return ctx
}

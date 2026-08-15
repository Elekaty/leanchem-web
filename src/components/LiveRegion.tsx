import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

interface LiveRegionContextValue {
  announce: (message: string) => void
}

const LiveRegionContext = createContext<LiveRegionContextValue | null>(null)

export function LiveRegionProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('')

  const announce = useCallback((next: string) => {
    setMessage('')
    window.requestAnimationFrame(() => setMessage(next))
  }, [])

  const value = useMemo(() => ({ announce }), [announce])

  return (
    <LiveRegionContext.Provider value={value}>
      {children}
      <div className="sr-only" aria-live="assertive" aria-atomic="true" role="status">
        {message}
      </div>
    </LiveRegionContext.Provider>
  )
}

export function useLiveRegion() {
  const ctx = useContext(LiveRegionContext)
  if (!ctx) throw new Error('useLiveRegion must be used within LiveRegionProvider')
  return ctx
}

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export interface FacetOption {
  value: string
  count: number
}

interface ShellContextValue {
  railOpen: boolean
  setRailOpen: (open: boolean) => void
  toggleRail: () => void
  families: FacetOption[]
  purities: FacetOption[]
  states: FacetOption[]
  selectedFamily: string | null
  selectedPurity: string | null
  selectedState: string | null
  setFamilies: (v: FacetOption[]) => void
  setPurities: (v: FacetOption[]) => void
  setStates: (v: FacetOption[]) => void
  setSelectedFamily: (v: string | null) => void
  setSelectedPurity: (v: string | null) => void
  setSelectedState: (v: string | null) => void
}

const ShellContext = createContext<ShellContextValue | null>(null)

export function ShellProvider({ children }: { children: ReactNode }) {
  const [railOpen, setRailOpen] = useState(false)
  const [families, setFamilies] = useState<FacetOption[]>([])
  const [purities, setPurities] = useState<FacetOption[]>([])
  const [states, setStates] = useState<FacetOption[]>([])
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null)
  const [selectedPurity, setSelectedPurity] = useState<string | null>(null)
  const [selectedState, setSelectedState] = useState<string | null>(null)

  const value = useMemo(
    () => ({
      railOpen,
      setRailOpen,
      toggleRail: () => setRailOpen((v) => !v),
      families,
      purities,
      states,
      selectedFamily,
      selectedPurity,
      selectedState,
      setFamilies,
      setPurities,
      setStates,
      setSelectedFamily,
      setSelectedPurity,
      setSelectedState,
    }),
    [
      railOpen,
      families,
      purities,
      states,
      selectedFamily,
      selectedPurity,
      selectedState,
    ],
  )
  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>
}

export function useShell() {
  const ctx = useContext(ShellContext)
  if (!ctx) throw new Error('useShell must be used within ShellProvider')
  return ctx
}

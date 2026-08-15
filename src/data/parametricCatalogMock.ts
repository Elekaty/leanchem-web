/** Demo chemicals for parametric catalog filtering (pre-Supabase wiring). */

export const MARKET_APPLICATIONS = [
  'Paints & Coatings',
  'Construction',
  'Plastics',
  'Water Treatment',
] as const

export const CHEMICAL_GRADES = ['Industrial', 'Technical', 'Food'] as const

export type MarketApplication = (typeof MARKET_APPLICATIONS)[number]
export type ChemicalGrade = (typeof CHEMICAL_GRADES)[number]

export interface ParametricChemical {
  id: string
  name: string
  casNumber: string
  markets: MarketApplication[]
  grade: ChemicalGrade
  sdsUrl: string
  tdsUrl: string
  slug: string
  /** Optional structure image; cards fall back to a placeholder glyph. */
  structureImageUrl?: string
}

export const PARAMETRIC_CATALOG_MOCK: ParametricChemical[] = [
  {
    id: 'mock-001',
    name: 'Titanium Dioxide (Rutile)',
    casNumber: '13463-67-7',
    markets: ['Paints & Coatings', 'Plastics'],
    grade: 'Industrial',
    sdsUrl: '/docs/sds-placeholder.pdf',
    tdsUrl: '/docs/tds-placeholder.pdf',
    slug: 'titanium-dioxide-rutile',
  },
  {
    id: 'mock-002',
    name: 'Sodium Hydroxide (Pellets)',
    casNumber: '1310-73-2',
    markets: ['Water Treatment', 'Construction'],
    grade: 'Technical',
    sdsUrl: '/docs/sds-placeholder.pdf',
    tdsUrl: '/docs/tds-placeholder.pdf',
    slug: 'sodium-hydroxide-pellets',
  },
  {
    id: 'mock-003',
    name: 'Isopropyl Alcohol',
    casNumber: '67-63-0',
    markets: ['Paints & Coatings', 'Plastics'],
    grade: 'Technical',
    sdsUrl: '/docs/sds-placeholder.pdf',
    tdsUrl: '/docs/tds-placeholder.pdf',
    slug: 'isopropyl-alcohol',
  },
  {
    id: 'mock-004',
    name: 'Calcium Chloride Anhydrous',
    casNumber: '10043-52-4',
    markets: ['Construction', 'Water Treatment'],
    grade: 'Industrial',
    sdsUrl: '/docs/sds-placeholder.pdf',
    tdsUrl: '/docs/tds-placeholder.pdf',
    slug: 'calcium-chloride-anhydrous',
  },
  {
    id: 'mock-005',
    name: 'Citric Acid Monohydrate',
    casNumber: '5949-29-1',
    markets: ['Water Treatment'],
    grade: 'Food',
    sdsUrl: '/docs/sds-placeholder.pdf',
    tdsUrl: '/docs/tds-placeholder.pdf',
    slug: 'citric-acid-monohydrate',
  },
  {
    id: 'mock-006',
    name: 'Toluene',
    casNumber: '108-88-3',
    markets: ['Paints & Coatings', 'Plastics'],
    grade: 'Industrial',
    sdsUrl: '/docs/sds-placeholder.pdf',
    tdsUrl: '/docs/tds-placeholder.pdf',
    slug: 'toluene',
  },
]

export function filterParametricCatalog(
  items: ParametricChemical[],
  opts: {
    query: string
    markets: MarketApplication[]
    grades: ChemicalGrade[]
  },
): ParametricChemical[] {
  const q = opts.query.trim().toLowerCase()

  return items.filter((item) => {
    const matchesQuery =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.casNumber.toLowerCase().includes(q)

    const matchesMarket =
      opts.markets.length === 0 ||
      opts.markets.some((m) => item.markets.includes(m))

    const matchesGrade =
      opts.grades.length === 0 || opts.grades.includes(item.grade)

    return matchesQuery && matchesMarket && matchesGrade
  })
}

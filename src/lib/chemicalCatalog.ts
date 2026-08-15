import type { ChemicalMasterDataRow } from '../types/chemical-master-data'
import type { HazardPictogram, Product } from '../types/catalog'
import { MOCK_PRODUCTS } from '../data/mockProducts'
import { getSupabaseBrowser, isSupabaseConfigured } from './supabase'

const TABLE = 'Chemical_Master_Data'

export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export function chemicalSlug(name: string, rowNo: number): string {
  const base = slugify(name) || 'product'
  return `${base}-${rowNo}`
}

function packs(packaging: string | null | undefined): string[] {
  if (!packaging?.trim()) return ['Contact for packaging']
  return packaging
    .split(/[/|,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function hsChapter(hs: string | null | undefined): string {
  if (!hs?.trim()) return '38'
  const digits = hs.replace(/\D/g, '')
  return digits.slice(0, 2) || '38'
}

function industryToMarketTags(industry: string | null, sector: string | null): string {
  const blob = `${industry ?? ''} ${sector ?? ''}`.toLowerCase()
  const tags: string[] = []
  if (/paint|coating/.test(blob)) tags.push('paints-coatings')
  if (/dry mix|concrete|construction|mortar|admixture/.test(blob)) tags.push('construction')
  if (/plastic|foam/.test(blob)) tags.push('plastics')
  if (/detergent|personal|cleaning|food|pharma|water/.test(blob)) tags.push('water-treatment')
  return tags.length ? [...new Set(tags)].join(',') : 'construction'
}

function inferHazards(row: ChemicalMasterDataRow): HazardPictogram[] {
  const blob = [
    row.Product_Name,
    row.Generic_Name,
    row.Category,
    row.Sub_Category,
    row.Industry,
    row.Product_Description,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  const hazards: HazardPictogram[] = []
  if (/acetone|solvent|toluene|methanol|alcohol|ipa|flammable|ketone/.test(blob)) {
    hazards.push('flammable')
  }
  if (/acid|hydroxide|caustic|corrosive|peroxide|chlorine/.test(blob)) {
    hazards.push('corrosive')
  }
  if (/methanol|toxic|phenol|cyanide/.test(blob)) hazards.push('toxic')
  if (/toluene|benzene|health|carcin/.test(blob)) hazards.push('health')
  if (/irritant|fiber|dust|chloride/.test(blob)) hazards.push('irritant')
  if (hazards.length === 0) hazards.push('irritant')
  return [...new Set(hazards)]
}

function handlingFor(industry: string | null): string {
  const i = (industry ?? '').toLowerCase()
  if (i.includes('paint') || i.includes('coating')) {
    return 'Store sealed, cool, and away from ignition sources. Use local exhaust when open-handling solvents. Ground and bond containers during transfer. Follow SDS PPE requirements.'
  }
  if (i.includes('concrete') || i.includes('dry mix') || i.includes('mortar')) {
    return 'Keep bags dry and sealed. Control dust during emptying. Use gloves and eye protection. Store off the floor on pallets away from moisture.'
  }
  if (i.includes('foam') || i.includes('plastic')) {
    return 'Store in original packaging away from heat and oxidizers. Avoid dust accumulation. Follow SDS for inhalation and skin protection.'
  }
  return 'Store in original packaging per SDS. Use appropriate PPE. Keep containers closed when not in use. Follow LeanChem corridor handling guidance for inland transfer.'
}

export function mapChemicalRowToProduct(row: ChemicalMasterDataRow): Product {
  const name = row.Product_Name?.trim() || row.Generic_Name?.trim() || `Product ${row.Row_No}`
  const rowNo = row.Row_No
  const slug = chemicalSlug(name, rowNo)
  const packaging = row.Packaging?.trim() || 'Contact for packaging'
  const packagingOptions = packs(packaging)
  const hazards = inferHazards(row)
  const category = row.Category?.trim() || row.Industry?.trim() || row.Sector?.trim() || 'Industrial'
  const description =
    row.Product_Description?.trim() ||
    `${name}${row.Generic_Name ? ` (${row.Generic_Name})` : ''} for Ethiopian industrial procurement via LeanChem.`
  const applications =
    row.Typical_Application?.trim() ||
    `Typical use in ${row.Industry ?? row.Sector ?? 'industrial'} formulations and plant offtake.`
  const hs = hsChapter(row.HS_Code)
  const grade =
    row.Sub_Category?.trim() ||
    row.Generic_Name?.trim() ||
    row.Industry?.trim() ||
    'Industrial grade'

  const properties: Array<{ key: string; value: string }> = [
    { key: 'Industry', value: row.Industry?.trim() || '—' },
    { key: 'Sector', value: row.Sector?.trim() || '—' },
    { key: 'Category', value: category },
    { key: 'Sub-category', value: row.Sub_Category?.trim() || '—' },
    { key: 'Generic name', value: row.Generic_Name?.trim() || '—' },
    { key: 'Packaging', value: packaging },
    { key: 'HS code', value: row.HS_Code?.trim() || hs },
    { key: 'Country of origin', value: row.Country_of_Origin?.trim() || '—' },
    { key: 'Ref #', value: String(rowNo) },
  ]

  return {
    id: row.uuid_id || `row-${rowNo}`,
    name,
    casNumber: row.Generic_Name?.trim() || `REF-${rowNo}`,
    purity: grade,
    moq: packagingOptions[0] ?? packaging,
    physicalState: /drum|l |liter|liquid|ibc|tote|jerrican/i.test(packaging)
      ? 'Liquid / packaged'
      : 'Solid / packaged',
    packaging,
    packagingOptions,
    leadTime: 'Quote-based lead time',
    estimatedPrice: null,
    hazard: hazards[0]!,
    hazards,
    sdsUrl: `#sds-${slug}`,
    tdsUrl: `#tds-${slug}`,
    coaUrl: `#coa-${slug}`,
    sdsUpdatedAt: 'On request',
    category,
    slug,
    inStock: true,
    hsChapter: hs,
    industryTags: industryToMarketTags(row.Industry, row.Sector),
    description,
    applications,
    handlingNotes: handlingFor(row.Industry),
    seoTitle: `${name} Supplier in Ethiopia | LeanChem`,
    seoDescription: `${name}${row.Generic_Name ? ` (${row.Generic_Name})` : ''}. Specs, packaging, stock pathway, TDS/SDS, and RFQ via LeanChem Ethiopia.`,
    properties,
  }
}

type Cache = {
  products: Product[]
  fetchedAt: number
}

let cache: Cache | null = null
const CACHE_MS = 60_000

async function fetchChemicalRows(): Promise<ChemicalMasterDataRow[]> {
  const supabase = getSupabaseBrowser()
  if (!supabase) return []

  const pageSize = 1000
  const rows: ChemicalMasterDataRow[] = []
  let from = 0

  for (;;) {
    const to = from + pageSize - 1
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('Row_No', { ascending: true })
      .range(from, to)

    if (error) {
      console.error('[catalog] Chemical_Master_Data fetch failed', error.message)
      break
    }
    const batch = (data ?? []) as unknown as ChemicalMasterDataRow[]
    rows.push(...batch)
    if (batch.length < pageSize) break
    from += pageSize
  }

  return rows.filter((r) => Boolean(r.Product_Name?.trim() || r.Generic_Name?.trim()))
}

async function fetchChemicalByRowNo(rowNo: number): Promise<ChemicalMasterDataRow | null> {
  const supabase = getSupabaseBrowser()
  if (!supabase) return null
  const { data, error } = await supabase.from(TABLE).select('*').eq('Row_No', rowNo).maybeSingle()
  if (error) {
    console.error('[catalog] Row_No lookup failed', error.message)
    return null
  }
  return (data as ChemicalMasterDataRow | null) ?? null
}

export async function loadCatalogProducts(opts?: { force?: boolean }): Promise<Product[]> {
  if (!opts?.force && cache && Date.now() - cache.fetchedAt < CACHE_MS) {
    return cache.products
  }

  if (isSupabaseConfigured()) {
    const rows = await fetchChemicalRows()
    if (rows.length > 0) {
      const fromDb = rows.map(mapChemicalRowToProduct)
      // Keep demo grades available alongside live Chemical Master Data.
      const demoExtras = MOCK_PRODUCTS.filter(
        (m) => !fromDb.some((p) => p.slug === m.slug || p.id === m.id),
      )
      const products = [...demoExtras, ...fromDb]
      cache = { products, fetchedAt: Date.now() }
      return products
    }
  }

  cache = { products: MOCK_PRODUCTS, fetchedAt: Date.now() }
  return MOCK_PRODUCTS
}

export async function getProductBySlugAsync(slug: string): Promise<Product | undefined> {
  const decoded = decodeURIComponent(slug).trim()
  if (!decoded) return undefined

  // Demo products always resolve (even when live catalog is loaded).
  const mockHit = MOCK_PRODUCTS.find((p) => p.slug === decoded)
  if (mockHit) return mockHit

  // Fast path: Chemical Master Ref # in slug suffix (e.g. accurate-5010n-1001).
  const rowNo = parseRowNoFromSlug(decoded)
  if (rowNo != null) {
    const row = await fetchChemicalByRowNo(rowNo)
    if (row) return mapChemicalRowToProduct(row)
  }

  const products = await loadCatalogProducts()
  const exact = products.find((p) => p.slug === decoded)
  if (exact) return exact

  if (rowNo != null) {
    return products.find(
      (p) =>
        p.slug.endsWith(`-${rowNo}`) ||
        p.properties.some((x) => x.key === 'Ref #' && x.value === String(rowNo)),
    )
  }

  // Soft match: slug without trailing id, or name slugify match
  const loose = products.find(
    (p) =>
      p.slug === decoded ||
      slugify(p.name) === decoded ||
      p.slug.startsWith(`${decoded}-`),
  )
  return loose
}

export async function getRelatedProducts(
  product: Product,
  limit = 3,
): Promise<Product[]> {
  const products = await loadCatalogProducts()
  return products
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.category === product.category ||
          p.industryTags.split(',').some((t) => product.industryTags.split(',').includes(t))),
    )
    .slice(0, limit)
}

export function parseRowNoFromSlug(slug: string): number | null {
  const m = slug.match(/-(\d+)$/)
  return m ? Number(m[1]) : null
}

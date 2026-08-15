import type { Product } from '../types/catalog'
import { MOCK_PRODUCTS } from '../data/mockProducts'

export type CatalogSort =
  | 'name_asc'
  | 'name_desc'
  | 'purity_desc'
  | 'stock_first'

export type MatchField = 'name' | 'cas' | 'grade'

export interface RankedHit {
  product: Product
  score: number
  field: MatchField
  matchedText: string
}

function packagingSizes(product: Product): string[] {
  return product.packaging
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function getCatalogFacets() {
  const hs = new Map<string, number>()
  const purity = new Map<string, number>()
  const packaging = new Map<string, number>()

  for (const p of MOCK_PRODUCTS) {
    hs.set(p.hsChapter, (hs.get(p.hsChapter) ?? 0) + 1)
    purity.set(p.purity, (purity.get(p.purity) ?? 0) + 1)
    for (const size of packagingSizes(p)) {
      packaging.set(size, (packaging.get(size) ?? 0) + 1)
    }
  }

  const toOptions = (map: Map<string, number>) =>
    Array.from(map.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => a.value.localeCompare(b.value))

  return {
    hsChapters: toOptions(hs),
    purities: toOptions(purity),
    packagingSizes: toOptions(packaging),
  }
}

function scoreField(text: string, query: string): number {
  const t = text.toLowerCase()
  const q = query.toLowerCase()
  if (t === q) return 100
  if (t.startsWith(q)) return 80
  const idx = t.indexOf(q)
  if (idx >= 0) return 60 - Math.min(idx, 40)
  return 0
}

/** Ranked typeahead fetch — only call when query length ≥ 3. */
export function searchProductsTypeahead(query: string, limit = 8): RankedHit[] {
  const q = query.trim()
  if (q.length < 3) return []

  const hits: RankedHit[] = []

  for (const product of MOCK_PRODUCTS) {
    const nameScore = scoreField(product.name, q)
    const casScore = scoreField(product.casNumber, q)
    const gradeScore = scoreField(product.purity, q)

    const best = [
      { field: 'name' as const, score: nameScore, matchedText: product.name },
      { field: 'cas' as const, score: casScore, matchedText: product.casNumber },
      { field: 'grade' as const, score: gradeScore, matchedText: product.purity },
    ].sort((a, b) => b.score - a.score)[0]

    if (best && best.score > 0) {
      hits.push({ product, score: best.score, field: best.field, matchedText: best.matchedText })
    }
  }

  return hits.sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name)).slice(0, limit)
}

export function highlightMatch(text: string, query: string): Array<{ text: string; match: boolean }> {
  const q = query.trim()
  if (!q) return [{ text, match: false }]
  const lower = text.toLowerCase()
  const idx = lower.indexOf(q.toLowerCase())
  if (idx < 0) return [{ text, match: false }]
  return [
    { text: text.slice(0, idx), match: false },
    { text: text.slice(idx, idx + q.length), match: true },
    { text: text.slice(idx + q.length), match: false },
  ].filter((p) => p.text.length > 0)
}

export function discoverProducts(opts: {
  q?: string
  market?: string
  hsChapters?: string[]
  purities?: string[]
  packagingSizes?: string[]
  inStockOnly?: boolean
  sort?: CatalogSort
}): Product[] {
  const q = opts.q?.trim().toLowerCase()
  let list = MOCK_PRODUCTS.filter((p) => {
    if (opts.market && !p.industryTags.split(',').includes(opts.market)) return false
    if (opts.hsChapters?.length && !opts.hsChapters.includes(p.hsChapter)) return false
    if (opts.purities?.length && !opts.purities.includes(p.purity)) return false
    if (opts.packagingSizes?.length) {
      const sizes = packagingSizes(p)
      if (!opts.packagingSizes.some((s) => sizes.includes(s))) return false
    }
    if (opts.inStockOnly && !p.inStock) return false
    if (!q) return true
    return (
      p.name.toLowerCase().includes(q) ||
      p.casNumber.toLowerCase().includes(q) ||
      p.purity.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    )
  })

  const sort = opts.sort ?? 'name_asc'
  list = [...list].sort((a, b) => {
    switch (sort) {
      case 'name_desc':
        return b.name.localeCompare(a.name)
      case 'purity_desc':
        return b.purity.localeCompare(a.purity)
      case 'stock_first':
        return Number(b.inStock) - Number(a.inStock) || a.name.localeCompare(b.name)
      case 'name_asc':
      default:
        return a.name.localeCompare(b.name)
    }
  })

  return list
}

import type { Product } from '../types/catalog'
import type { CatalogSort, MatchField, RankedHit } from './catalogDiscovery'

function packagingSizes(product: Product): string[] {
  return product.packagingOptions.length
    ? product.packagingOptions
    : product.packaging
        .split('/')
        .map((s) => s.trim())
        .filter(Boolean)
}

export function getCatalogFacetsFrom(products: Product[]) {
  const hs = new Map<string, number>()
  const purity = new Map<string, number>()
  const packaging = new Map<string, number>()

  for (const p of products) {
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
    purities: toOptions(purity).slice(0, 40),
    packagingSizes: toOptions(packaging).slice(0, 40),
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

export function searchProductsTypeaheadFrom(
  products: Product[],
  query: string,
  limit = 8,
): RankedHit[] {
  const q = query.trim()
  if (q.length < 3) return []

  const hits: RankedHit[] = []

  for (const product of products) {
    const nameScore = scoreField(product.name, q)
    const casScore = scoreField(product.casNumber, q)
    const gradeScore = scoreField(product.purity, q)

    const best = [
      { field: 'name' as MatchField, score: nameScore, matchedText: product.name },
      { field: 'cas' as MatchField, score: casScore, matchedText: product.casNumber },
      { field: 'grade' as MatchField, score: gradeScore, matchedText: product.purity },
    ].sort((a, b) => b.score - a.score)[0]

    if (best && best.score > 0) {
      hits.push({ product, score: best.score, field: best.field, matchedText: best.matchedText })
    }
  }

  return hits
    .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name))
    .slice(0, limit)
}

export function discoverProductsFrom(
  products: Product[],
  opts: {
    q?: string
    market?: string
    hsChapters?: string[]
    purities?: string[]
    packagingSizes?: string[]
    inStockOnly?: boolean
    sort?: CatalogSort
  },
): Product[] {
  const q = opts.q?.trim().toLowerCase()
  let list = products.filter((p) => {
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
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
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

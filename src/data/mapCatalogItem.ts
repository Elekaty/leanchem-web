import type { CatalogItem } from '../api/leanchem'
import { hsChapterForCategory } from './marketing'
import type { HazardPictogram, Product } from '../types'
import { productSlug } from '../utils/slug'

export function mapCatalogItem(item: CatalogItem): Product {
  const physicalState = item.physical_state ?? '—'
  const category =
    item.category ?? (physicalState.toLowerCase().includes('solid') ? 'Inorganics' : 'Solvents')
  const packaging =
    item.packaging_options ?? item.packaging ?? inferPackaging(item.moq_unit)
  return {
    id: item.id,
    name: item.name,
    casNumber: item.cas_number,
    purity: item.purity_grade,
    moq: `${item.moq} ${item.moq_unit}`,
    physicalState,
    packaging,
    leadTime: item.lead_time_days != null ? `${item.lead_time_days} business days` : '—',
    estimatedPrice: typeof item.estimated_price === 'number' ? item.estimated_price : null,
    hazard: (item.hazard as HazardPictogram) ?? 'irritant',
    sdsUrl: '#',
    sdsUpdatedAt: '—',
    category,
    slug: item.slug || productSlug({ id: item.id, name: item.name }),
    inStock: item.in_stock !== false,
    hsChapter: item.hs_chapter || hsChapterForCategory(category),
    industryTags: item.industry_tags ?? '',
    seoDescription: item.seo_description,
  }
}

function inferPackaging(unit: string): string {
  const u = unit.toLowerCase()
  if (u.includes('l') && !u.includes('kg')) return '200 L drum'
  if (u.includes('kg')) return '25 kg drum'
  return 'IBC tote'
}

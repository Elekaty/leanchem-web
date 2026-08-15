import type { Product } from '../types/catalog'
import type { ParametricChemical } from '../data/parametricCatalogMock'

/** Map a parametric mock chemical into the shared Product shape for RFQ / PDP links. */
export function parametricToProduct(chemical: ParametricChemical): Product {
  return {
    id: chemical.id,
    name: chemical.name,
    casNumber: chemical.casNumber,
    purity: `${chemical.grade} grade`,
    moq: 'On request',
    physicalState: 'Solid / liquid — see TDS',
    packaging: 'Standard industrial packaging',
    packagingOptions: ['25 kg bag', '200 L drum', 'IBC'],
    leadTime: '2–4 weeks',
    estimatedPrice: null,
    hazard: 'irritant',
    hazards: ['irritant'],
    sdsUrl: chemical.sdsUrl,
    tdsUrl: chemical.tdsUrl,
    coaUrl: '/docs/coa-placeholder.pdf',
    sdsUpdatedAt: '2026-01-15',
    category: chemical.markets[0] ?? 'Industrial',
    slug: chemical.slug,
    inStock: true,
    hsChapter: '28',
    industryTags: chemical.markets.join(', '),
    description: `${chemical.name} (${chemical.casNumber}) — ${chemical.grade} grade for ${chemical.markets.join(', ')}.`,
    applications: chemical.markets.join('; '),
    handlingNotes: 'Follow SDS. Use appropriate PPE. Store sealed in original packaging.',
    properties: [
      { key: 'Grade', value: chemical.grade },
      { key: 'Markets', value: chemical.markets.join(', ') },
    ],
  }
}

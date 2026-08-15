import type { Product } from '../types/catalog'
import type { ParametricChemical } from '../data/parametricCatalogMock'

/** Map a parametric mock chemical into the shared Product shape for RFQ / PDP links. */
export function parametricToProduct(chemical: ParametricChemical): Product {
  const hazard = chemical.hazards[0] ?? 'irritant'
  return {
    id: chemical.id,
    name: chemical.name,
    casNumber: chemical.casNumber,
    purity: chemical.purity,
    moq: 'On request',
    physicalState: chemical.physicalState,
    packaging: chemical.packaging,
    packagingOptions: [chemical.packaging, 'IBC', 'Bulk'],
    leadTime: chemical.inStock ? '1–2 weeks' : '3–5 weeks',
    estimatedPrice: null,
    hazard,
    hazards: chemical.hazards,
    sdsUrl: chemical.sdsUrl,
    tdsUrl: chemical.tdsUrl,
    coaUrl: '/docs/coa-placeholder.pdf',
    sdsUpdatedAt: '2026-01-15',
    category: chemical.markets[0] ?? 'Industrial',
    slug: chemical.slug,
    inStock: chemical.inStock,
    hsChapter: '28',
    industryTags: chemical.markets.join(', '),
    description: chemical.description,
    applications: chemical.markets.join('; '),
    handlingNotes: 'Follow SDS. Use appropriate PPE. Store sealed in original packaging.',
    properties: [
      { key: 'Grade', value: chemical.grade },
      { key: 'Purity', value: chemical.purity },
      { key: 'Packaging', value: chemical.packaging },
      { key: 'Markets', value: chemical.markets.join(', ') },
    ],
  }
}

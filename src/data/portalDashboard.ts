import type { Product } from '../types/catalog'

export type PortalOrderStatus = 'Draft' | 'Quoted' | 'Processing' | 'Shipped'

export interface PortalOrderLine {
  productId: string
  slug: string
  name: string
  casNumber: string
  quantity: string
  packaging: string
}

export interface PortalPurchaseOrder {
  poNumber: string
  date: string
  items: PortalOrderLine[]
  totalVolume: string
  status: PortalOrderStatus
}

export interface PortalMetric {
  id: string
  label: string
  value: string
  hint: string
}

export interface ComplianceDocument {
  id: string
  chemicalName: string
  casNumber: string
  lastPurchasePo: string
  lastPurchaseDate: string
  coaUrl: string
  sdsUrl: string
  sdsUpdatedAt: string
}

export const PORTAL_METRICS: PortalMetric[] = [
  {
    id: 'active-rfqs',
    label: 'Active RFQs',
    value: '4',
    hint: 'Awaiting commercial response',
  },
  {
    id: 'in-transit',
    label: 'Orders in Transit',
    value: '2',
    hint: 'Djibouti → Addis corridor',
  },
  {
    id: 'invoices',
    label: 'Outstanding Invoices',
    value: '3',
    hint: 'USD 48,220 open balance',
  },
]

export const PORTAL_PURCHASE_ORDERS: PortalPurchaseOrder[] = [
  {
    poNumber: 'PO-2026-1142',
    date: '2026-08-02',
    totalVolume: '18 MT',
    status: 'Processing',
    items: [
      {
        productId: 'portal-ipa',
        slug: 'isopropyl-alcohol',
        name: 'Isopropyl Alcohol',
        casNumber: '67-63-0',
        quantity: '8 MT',
        packaging: '200L Drums',
      },
      {
        productId: 'portal-toluene',
        slug: 'toluene',
        name: 'Toluene',
        casNumber: '108-88-3',
        quantity: '10 MT',
        packaging: 'IBC Totes',
      },
    ],
  },
  {
    poNumber: 'PO-2026-1098',
    date: '2026-07-18',
    totalVolume: '12 MT',
    status: 'Shipped',
    items: [
      {
        productId: 'portal-naoh',
        slug: 'sodium-hydroxide-pellets',
        name: 'Sodium Hydroxide (Pellets)',
        casNumber: '1310-73-2',
        quantity: '12 MT',
        packaging: '25kg Bags',
      },
    ],
  },
  {
    poNumber: 'PO-2026-1071',
    date: '2026-07-05',
    totalVolume: '6 MT',
    status: 'Quoted',
    items: [
      {
        productId: 'portal-tio2',
        slug: 'titanium-dioxide-rutile',
        name: 'Titanium Dioxide (Rutile)',
        casNumber: '13463-67-7',
        quantity: '6 MT',
        packaging: '25kg Bags',
      },
    ],
  },
  {
    poNumber: 'PO-2026-1020',
    date: '2026-06-22',
    totalVolume: '24 MT',
    status: 'Draft',
    items: [
      {
        productId: 'portal-cacl2',
        slug: 'calcium-chloride-anhydrous',
        name: 'Calcium Chloride Anhydrous',
        casNumber: '10043-52-4',
        quantity: '16 MT',
        packaging: 'Bulk Tanker',
      },
      {
        productId: 'portal-citric',
        slug: 'citric-acid-monohydrate',
        name: 'Citric Acid Monohydrate',
        casNumber: '5949-29-1',
        quantity: '8 MT',
        packaging: '25kg Bags',
      },
    ],
  },
  {
    poNumber: 'PO-2026-0988',
    date: '2026-06-08',
    totalVolume: '5 MT',
    status: 'Shipped',
    items: [
      {
        productId: 'portal-ipa',
        slug: 'isopropyl-alcohol',
        name: 'Isopropyl Alcohol',
        casNumber: '67-63-0',
        quantity: '5 MT',
        packaging: '200L Drums',
      },
    ],
  },
]

export const PORTAL_COMPLIANCE_DOCS: ComplianceDocument[] = [
  {
    id: 'comp-ipa',
    chemicalName: 'Isopropyl Alcohol',
    casNumber: '67-63-0',
    lastPurchasePo: 'PO-2026-1142',
    lastPurchaseDate: '2026-08-02',
    coaUrl: '/docs/coa-placeholder.pdf',
    sdsUrl: '/docs/sds-placeholder.pdf',
    sdsUpdatedAt: '2026-07-20',
  },
  {
    id: 'comp-naoh',
    chemicalName: 'Sodium Hydroxide (Pellets)',
    casNumber: '1310-73-2',
    lastPurchasePo: 'PO-2026-1098',
    lastPurchaseDate: '2026-07-18',
    coaUrl: '/docs/coa-placeholder.pdf',
    sdsUrl: '/docs/sds-placeholder.pdf',
    sdsUpdatedAt: '2026-06-12',
  },
  {
    id: 'comp-tio2',
    chemicalName: 'Titanium Dioxide (Rutile)',
    casNumber: '13463-67-7',
    lastPurchasePo: 'PO-2026-1071',
    lastPurchaseDate: '2026-07-05',
    coaUrl: '/docs/coa-placeholder.pdf',
    sdsUrl: '/docs/sds-placeholder.pdf',
    sdsUpdatedAt: '2026-05-30',
  },
  {
    id: 'comp-cacl2',
    chemicalName: 'Calcium Chloride Anhydrous',
    casNumber: '10043-52-4',
    lastPurchasePo: 'PO-2026-1020',
    lastPurchaseDate: '2026-06-22',
    coaUrl: '/docs/coa-placeholder.pdf',
    sdsUrl: '/docs/sds-placeholder.pdf',
    sdsUpdatedAt: '2026-04-18',
  },
  {
    id: 'comp-citric',
    chemicalName: 'Citric Acid Monohydrate',
    casNumber: '5949-29-1',
    lastPurchasePo: 'PO-2026-1020',
    lastPurchaseDate: '2026-06-22',
    coaUrl: '/docs/coa-placeholder.pdf',
    sdsUrl: '/docs/sds-placeholder.pdf',
    sdsUpdatedAt: '2026-05-02',
  },
]

/** Map a past PO line into a Product so it can enter the RFQ cart. */
export function portalLineToProduct(line: PortalOrderLine): Product {
  return {
    id: line.productId,
    name: line.name,
    casNumber: line.casNumber,
    purity: 'Industrial grade',
    moq: line.quantity,
    physicalState: 'See SDS',
    packaging: line.packaging,
    packagingOptions: [line.packaging, '200L Drums', 'IBC Totes', '25kg Bags'],
    leadTime: '2–4 weeks',
    estimatedPrice: null,
    hazard: 'irritant',
    hazards: ['irritant'],
    sdsUrl: '/docs/sds-placeholder.pdf',
    tdsUrl: '/docs/tds-placeholder.pdf',
    coaUrl: '/docs/coa-placeholder.pdf',
    sdsUpdatedAt: '2026-07-01',
    category: 'Industrial',
    slug: line.slug,
    inStock: true,
    hsChapter: '28',
    industryTags: 'Portal reorder',
    description: `${line.name} (CAS ${line.casNumber}) — reorder from portal purchase history.`,
    applications: 'Per prior approved use.',
    handlingNotes: 'Follow current SDS. Use appropriate PPE.',
    properties: [],
  }
}

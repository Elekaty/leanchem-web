export const SITE = {
  brand: 'LeanChem',
  taglineLine1: 'Chemicals You Trust,',
  taglineLine2: 'Values You Deserve',
  valueProp:
    'Enterprise chemical procurement for Ethiopian industry — verified sourcing, technical support, and corridor-aware logistics.',
  location: 'Addis Ababa · Serving Ethiopia',
  stats: [
    { value: '500+', label: 'SKUs sourced' },
    { value: '40+', label: 'Tier-1 suppliers' },
    { value: '10+', label: 'Years in market' },
  ],
  emails: {
    commercial: 'commercial@leanchem.et',
    compliance: 'compliance@leanchem.et',
  },
  chat: {
    whatsapp: 'https://wa.me/251900000000',
    telegram: 'https://t.me/leanchem',
  },
} as const

export const TRUST_ITEMS = [
  { title: '10+ years', body: 'Serving industrial buyers across Ethiopia' },
  { title: 'Tier-1 sourcing', body: 'Qualified global manufacturers and packers' },
  { title: 'ISO pending', body: 'Quality systems advancing toward certification' },
] as const

export const WHY_ITEMS = [
  {
    title: 'Verified supply chain',
    body: 'Traceable grades, documentation packs, and controlled handling from origin to site.',
  },
  {
    title: 'Technical application lab',
    body: 'Formulation guidance for coatings, construction chemistry, plastics, and water treatment.',
  },
  {
    title: 'RFQ that speaks procurement',
    body: 'Company, volume, Incoterms, and delivery windows — built for buyer workflows.',
  },
  {
    title: 'Corridor logistics',
    body: 'Live status on Djibouti–Addis lanes and inland handoffs so planning stays grounded.',
  },
] as const

export const INDUSTRIES = [
  {
    slug: 'paints-coatings',
    title: 'Paints & Coatings',
    body: 'Solvents, binders, pigments, and additives for industrial and decorative systems.',
  },
  {
    slug: 'construction',
    title: 'Construction',
    body: 'Cement additives, waterproofing chemistry, and site-ready packaging formats.',
  },
  {
    slug: 'plastics',
    title: 'Plastics',
    body: 'Polymer additives, process aids, and specialty intermediates for converters.',
  },
  {
    slug: 'water-treatment',
    title: 'Water Treatment',
    body: 'Coagulants, disinfectants, and process chemicals for municipal and industrial plants.',
  },
] as const

export const TESTIMONIALS = [
  {
    quote:
      'LeanChem shortened our RFQ cycle and kept SDS/TDS packs aligned with each grade we approved.',
    name: 'Procurement Lead',
    org: 'National coatings manufacturer',
  },
  {
    quote:
      'Corridor updates and clear packaging options helped us plan inbound without guessing lead times.',
    name: 'Plant Materials Manager',
    org: 'Construction chemicals producer',
  },
  {
    quote:
      'Technical lab feedback on substitution grades saved a line stoppage during a supply disruption.',
    name: 'Process Engineer',
    org: 'Plastics converter',
  },
] as const

export const CLIENT_LOGOS = [
  'Horizon Coatings',
  'Rift Polymers',
  'Blue Nile Water',
  'Addis Build Chem',
  'Eastgate Plastics',
  'Valley Infrastructure',
] as const

export const LOGISTICS_UPDATES = [
  {
    id: 'log-1',
    corridor: 'Djibouti → Modjo',
    status: 'In Transit',
    timestamp: '15 Aug 2026 · 08:42 EAT',
    summary: 'Container dwell within SLA; inland transfer windows holding.',
    articleSlug: 'modjo-corridor-update-q3',
  },
  {
    id: 'log-2',
    corridor: 'Modjo dry port → Customs',
    status: 'Customs Cleared',
    timestamp: '15 Aug 2026 · 07:15 EAT',
    summary: 'Bonded release complete for verified chemical consignments.',
    articleSlug: 'modjo-corridor-update-q3',
  },
  {
    id: 'log-3',
    corridor: 'Modjo → Addis industrial parks',
    status: 'Watch',
    timestamp: '14 Aug 2026 · 16:20 EAT',
    summary: 'Peak inbound volume; book delivery slots 48 hours ahead.',
    articleSlug: 'addis-delivery-slots',
  },
  {
    id: 'log-4',
    corridor: 'Bulk tanker lane',
    status: 'Clear',
    timestamp: '14 Aug 2026 · 11:05 EAT',
    summary: 'Acid and solvent tanker capacity available for verified buyers.',
    articleSlug: 'bulk-tanker-capacity',
  },
] as const

export const NEWS_ARTICLES = [
  {
    slug: 'modjo-corridor-update-q3',
    title: 'Modjo corridor update: Q3 dwell and transfer windows',
    date: '2026-07-18',
    excerpt: 'What procurement teams should expect on Djibouti–Modjo handoffs this quarter.',
    body: [
      'Inbound containers on the Djibouti–Modjo corridor are clearing within agreed service levels for most lanes. Teams planning chemical inbound should still lock delivery slots early when volume spikes coincide with public holidays.',
      'LeanChem logistics will continue publishing corridor status on the homepage dashboard and in buyer notifications for verified accounts.',
    ],
  },
  {
    slug: 'addis-delivery-slots',
    title: 'Addis industrial park delivery slots: how to book ahead',
    date: '2026-06-02',
    excerpt: 'Practical guidance for buyers coordinating last-mile chemical deliveries.',
    body: [
      'Industrial park receiving windows tighten when Modjo releases cluster. Booking 48 hours ahead reduces demurrage risk and keeps SDS-controlled unloading orderly.',
      'Include packaging format and hazard class on your RFQ so routing and PPE requirements are confirmed before dispatch.',
    ],
  },
  {
    slug: 'bulk-tanker-capacity',
    title: 'Bulk tanker capacity for acids and solvents',
    date: '2026-05-14',
    excerpt: 'Verified buyers can reserve tanker slots for high-volume liquid grades.',
    body: [
      'Tanker capacity for selected acids and solvents is currently open for verified Tier-3 buyers. Share volume, destination, and preferred Incoterms on the RFQ form to reserve a window.',
      'Technical data sheets and SDS must be acknowledged before dispatch for controlled grades.',
    ],
  },
] as const

export const ABOUT = {
  mission:
    'LeanChem connects Ethiopian industry to trusted chemical supply — with documentation, technical application support, and logistics clarity from port to plant.',
  pillars: [
    { title: 'Trust', body: 'Qualified sources, transparent grades, and compliance-ready document packs.' },
    { title: 'Technical depth', body: 'Application lab support for formulation and substitution decisions.' },
    { title: 'Delivery discipline', body: 'Corridor-aware planning so MOQ and lead time mean something on the ground.' },
  ],
  leadership: [
    { name: 'Executive leadership', role: 'Chief Executive Officer', bio: 'Steering LeanChem’s industrial procurement platform and supplier partnerships across Ethiopia.' },
    { name: 'Commercial lead', role: 'Head of Sales', bio: 'Slot reserved — enterprise account coverage for coatings, construction, plastics, and water.' },
    { name: 'Technical lead', role: 'Applications Lab', bio: 'Slot reserved — grade selection, SDS/TDS stewardship, and customer trials.' },
    { name: 'Operations lead', role: 'Logistics & Compliance', bio: 'Slot reserved — corridor coordination and controlled-goods handling.' },
  ],
} as const

export const HS_CHAPTERS = [
  { code: '28', label: 'HS 28 — Inorganic chemicals' },
  { code: '29', label: 'HS 29 — Organic chemicals' },
  { code: '32', label: 'HS 32 — Tanning / dyeing extracts, pigments' },
  { code: '38', label: 'HS 38 — Miscellaneous chemical products' },
] as const

export const PACKAGING_OPTIONS = [
  '25 kg drum',
  '20 L jerrican',
  '200 L drum',
  'IBC tote',
  'Bulk tanker',
] as const

/** Lightweight HS mapping for catalog filters when API does not expose HS codes. */
export function hsChapterForCategory(category: string): string {
  const c = category.toLowerCase()
  if (c.includes('acid') || c.includes('inorganic')) return '28'
  if (c.includes('solvent') || c.includes('aromatic')) return '29'
  if (c.includes('coating') || c.includes('pigment')) return '32'
  return '38'
}

import type { Product } from '../types/catalog'

function packs(packaging: string): string[] {
  return packaging
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean)
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'c0000001-0000-4000-8000-000000000001',
    name: 'Sodium Hydroxide, Pellets, ACS Reagent Grade',
    casNumber: '1310-73-2',
    purity: '≥98%',
    moq: '25 kg',
    physicalState: 'Solid (pellets)',
    packaging: '25 kg drum / 500 kg IBC',
    packagingOptions: packs('25 kg drum / 500 kg IBC'),
    leadTime: '5–8 business days',
    estimatedPrice: 42.5,
    hazard: 'corrosive',
    hazards: ['corrosive', 'irritant'],
    sdsUrl: '#sds-naoh',
    tdsUrl: '#tds-naoh',
    coaUrl: '#coa-naoh',
    sdsUpdatedAt: '2026-03-12',
    category: 'Inorganics',
    slug: 'sodium-hydroxide-pellets',
    inStock: true,
    hsChapter: '28',
    industryTags: 'construction,water-treatment',
    description:
      'High-assay NaOH pellets for neutralization, scrubbing, and process chemistry. ACS reagent grade with controlled carbonate for Ethiopian industrial buyers.',
    applications:
      'Water treatment, construction chemicals, soap and detergent manufacture, and general alkali demand at plant scale.',
    handlingNotes:
      'Store in a cool, dry area away from acids and moisture. Use chemical-resistant gloves, goggles, and alkali-rated PPE. Keep containers tightly closed; hygroscopic.',
    seoTitle: 'Sodium Hydroxide Pellets ACS | CAS 1310-73-2 | LeanChem Ethiopia',
    seoDescription:
      'Sodium Hydroxide pellets ACS reagent grade (CAS 1310-73-2) for Ethiopian industrial procurement. Specs, packaging, SDS/TDS, and RFQ.',
    properties: [
      { key: 'Assay', value: '≥98%' },
      { key: 'Form', value: 'Pellets' },
      { key: 'Carbonate', value: '≤2%' },
      { key: 'Density', value: '≈2.13 g/cm³' },
      { key: 'HS Chapter', value: '28' },
    ],
  },
  {
    id: 'c0000001-0000-4000-8000-000000000002',
    name: 'Isopropyl Alcohol, Anhydrous, HPLC Grade',
    casNumber: '67-63-0',
    purity: '≥99.9%',
    moq: '20 L',
    physicalState: 'Liquid',
    packaging: '20 L jerrican / 200 L drum',
    packagingOptions: packs('20 L jerrican / 200 L drum'),
    leadTime: '3–5 business days',
    estimatedPrice: 18.75,
    hazard: 'flammable',
    hazards: ['flammable', 'irritant'],
    sdsUrl: '#sds-ipa',
    tdsUrl: '#tds-ipa',
    coaUrl: '#coa-ipa',
    sdsUpdatedAt: '2026-01-28',
    category: 'Solvents',
    slug: 'isopropyl-alcohol-hplc',
    inStock: true,
    hsChapter: '29',
    industryTags: 'paints-coatings,plastics',
    description:
      'Anhydrous IPA for coatings, electronics wipe-down, and HPLC workflows. Low water content with corridor-ready packaging.',
    applications:
      'Paints and coatings thinning, plastics processing, laboratory HPLC, and precision cleaning.',
    handlingNotes:
      'Keep away from ignition sources. Store in flammable liquids cabinet or bonded area. Ground containers during transfer. Use in well-ventilated spaces.',
    seoTitle: 'Isopropyl Alcohol HPLC Grade | CAS 67-63-0 | LeanChem',
    seoDescription:
      'Isopropyl Alcohol anhydrous HPLC grade (CAS 67-63-0) available via LeanChem Ethiopia.',
    properties: [
      { key: 'Assay', value: '≥99.9%' },
      { key: 'Water', value: '≤0.05%' },
      { key: 'Boiling point', value: '82.5 °C' },
      { key: 'Flash point', value: '12 °C' },
      { key: 'HS Chapter', value: '29' },
    ],
  },
  {
    id: 'c0000001-0000-4000-8000-000000000003',
    name: 'Acetone, ACS Reagent, Low Water Content',
    casNumber: '67-64-1',
    purity: '≥99.5%',
    moq: '200 L',
    physicalState: 'Liquid',
    packaging: '200 L drum / ISO tank',
    packagingOptions: packs('200 L drum / ISO tank'),
    leadTime: '7–10 business days',
    estimatedPrice: null,
    hazard: 'flammable',
    hazards: ['flammable', 'irritant'],
    sdsUrl: '#sds-acetone',
    tdsUrl: '#tds-acetone',
    coaUrl: '#coa-acetone',
    sdsUpdatedAt: '2025-11-04',
    category: 'Solvents',
    slug: 'acetone-acs-reagent',
    inStock: false,
    hsChapter: '29',
    industryTags: 'paints-coatings',
    description:
      'ACS acetone for resin systems and degreasing. Made-to-order drum and ISO tank options for qualified buyers.',
    applications: 'Coatings formulation, adhesives, and industrial degreasing lines.',
    handlingNotes:
      'Highly flammable. Control static discharge. Store sealed and cool. Avoid prolonged vapor exposure; use local exhaust when open-handling.',
    seoTitle: 'Acetone ACS Reagent | CAS 67-64-1 | LeanChem Ethiopia',
    seoDescription: 'Acetone ACS reagent (CAS 67-64-1) — RFQ via LeanChem catalog.',
    properties: [
      { key: 'Assay', value: '≥99.5%' },
      { key: 'Water', value: '≤0.3%' },
      { key: 'Flash point', value: '−20 °C' },
      { key: 'HS Chapter', value: '29' },
    ],
  },
  {
    id: 'c0000001-0000-4000-8000-000000000004',
    name: 'Hydrochloric Acid, 37% Technical Grade',
    casNumber: '7647-01-0',
    purity: '36–38%',
    moq: '1,000 L',
    physicalState: 'Liquid',
    packaging: 'IBC tote / bulk tanker',
    packagingOptions: packs('IBC tote / bulk tanker'),
    leadTime: '10–14 business days',
    estimatedPrice: 0.85,
    hazard: 'corrosive',
    hazards: ['corrosive', 'toxic'],
    sdsUrl: '#sds-hcl',
    tdsUrl: '#tds-hcl',
    coaUrl: '#coa-hcl',
    sdsUpdatedAt: '2026-02-19',
    category: 'Acids',
    slug: 'hydrochloric-acid-37',
    inStock: true,
    hsChapter: '28',
    industryTags: 'water-treatment,construction',
    description:
      'Technical HCl for pH control, pickling, and water treatment. Bulk tanker and IBC programs for verified accounts.',
    applications: 'Municipal and industrial water treatment, construction chemistry, metal finishing.',
    handlingNotes:
      'Corrosive acid vapors. Use acid-rated PPE and scrubbers where required. Never dilute by adding water to concentrated acid. Compatible materials only for transfer lines.',
    seoTitle: 'Hydrochloric Acid 37% Technical | CAS 7647-01-0 | LeanChem',
    seoDescription: 'Hydrochloric Acid 37% technical (CAS 7647-01-0) for Ethiopian procurement.',
    properties: [
      { key: 'Concentration', value: '36–38%' },
      { key: 'Form', value: 'Aqueous liquid' },
      { key: 'Appearance', value: 'Clear to pale yellow' },
      { key: 'HS Chapter', value: '28' },
    ],
  },
  {
    id: 'c0000001-0000-4000-8000-000000000005',
    name: 'Toluene, Industrial Grade for Coatings & Adhesives',
    casNumber: '108-88-3',
    purity: '≥99%',
    moq: '200 L',
    physicalState: 'Liquid',
    packaging: '200 L drum',
    packagingOptions: packs('200 L drum'),
    leadTime: '4–6 business days',
    estimatedPrice: 22.1,
    hazard: 'health',
    hazards: ['flammable', 'health', 'irritant'],
    sdsUrl: '#sds-toluene',
    tdsUrl: '#tds-toluene',
    coaUrl: '#coa-toluene',
    sdsUpdatedAt: '2026-04-01',
    category: 'Aromatics',
    slug: 'toluene-industrial',
    inStock: true,
    hsChapter: '29',
    industryTags: 'paints-coatings,plastics',
    description:
      'Industrial toluene for coatings and adhesives with SDS/TDS packs aligned to buyer workflows.',
    applications: 'Solvent systems for paints, adhesives, and polymer processing.',
    handlingNotes:
      'Flammable aromatic solvent with health hazard classification. Limit inhalation exposure; monitor workplace air. Bond and ground during transfer.',
    seoTitle: 'Toluene Industrial Grade | CAS 108-88-3 | LeanChem Ethiopia',
    seoDescription: 'Toluene industrial grade (CAS 108-88-3) — LeanChem Ethiopia catalog.',
    properties: [
      { key: 'Assay', value: '≥99%' },
      { key: 'Boiling point', value: '110.6 °C' },
      { key: 'HS Chapter', value: '29' },
    ],
  },
  {
    id: 'c0000001-0000-4000-8000-000000000006',
    name: 'Hydrogen Peroxide, 35% Stabilized',
    casNumber: '7722-84-1',
    purity: '35%',
    moq: '30 L',
    physicalState: 'Liquid',
    packaging: '30 L HDPE drum',
    packagingOptions: packs('30 L HDPE drum'),
    leadTime: '6–9 business days',
    estimatedPrice: 31.4,
    hazard: 'corrosive',
    hazards: ['corrosive', 'irritant'],
    sdsUrl: '#sds-h2o2',
    tdsUrl: '#tds-h2o2',
    coaUrl: '#coa-h2o2',
    sdsUpdatedAt: '2025-12-15',
    category: 'Oxidizers',
    slug: 'hydrogen-peroxide-35',
    inStock: true,
    hsChapter: '28',
    industryTags: 'water-treatment',
    description:
      'Stabilized 35% H₂O₂ for bleaching and disinfection with controlled packaging for inland transfer.',
    applications: 'Water treatment oxidation, bleaching, and process disinfection.',
    handlingNotes:
      'Oxidizer — keep away from organics and reducers. Vent containers; avoid contamination. Cool storage preferred. Spill control with water dilution and compatible absorbents.',
    seoTitle: 'Hydrogen Peroxide 35% Stabilized | CAS 7722-84-1 | LeanChem',
    seoDescription: 'Hydrogen Peroxide 35% stabilized (CAS 7722-84-1) via LeanChem.',
    properties: [
      { key: 'Concentration', value: '35%' },
      { key: 'Stabilized', value: 'Yes' },
      { key: 'HS Chapter', value: '28' },
    ],
  },
  {
    id: 'c0000001-0000-4000-8000-000000000007',
    name: 'Methanol, Absolute, ACS Spectrophotometric Grade',
    casNumber: '67-56-1',
    purity: '≥99.8%',
    moq: '20 L',
    physicalState: 'Liquid',
    packaging: '20 L jerrican / 200 L drum',
    packagingOptions: packs('20 L jerrican / 200 L drum'),
    leadTime: '3–5 business days',
    estimatedPrice: 14.2,
    hazard: 'toxic',
    hazards: ['flammable', 'toxic', 'health'],
    sdsUrl: '#sds-meoh',
    tdsUrl: '#tds-meoh',
    coaUrl: '#coa-meoh',
    sdsUpdatedAt: '2026-05-22',
    category: 'Solvents',
    slug: 'methanol-absolute',
    inStock: true,
    hsChapter: '29',
    industryTags: 'paints-coatings,plastics',
    description:
      'Absolute methanol for spectrophotometric and process use. Dual packaging for lab and plant offtake.',
    applications: 'Coatings solvents, plastics intermediates, and analytical workflows.',
    handlingNotes:
      'Toxic if swallowed or inhaled. Flammable. Use closed systems where practical. Emergency eyewash and SDS protocols required on site.',
    seoTitle: 'Methanol Absolute ACS | CAS 67-56-1 | LeanChem Ethiopia',
    seoDescription: 'Methanol absolute ACS grade (CAS 67-56-1) — LeanChem procurement.',
    properties: [
      { key: 'Assay', value: '≥99.8%' },
      { key: 'Water', value: '≤0.05%' },
      { key: 'HS Chapter', value: '29' },
    ],
  },
  {
    id: 'c0000001-0000-4000-8000-000000000008',
    name: 'Calcium Chloride Anhydrous, Food Processing Grade',
    casNumber: '10043-52-4',
    purity: '≥94%',
    moq: '50 kg',
    physicalState: 'Solid (flakes)',
    packaging: '25 kg bag / 1,000 kg bulk bag',
    packagingOptions: packs('25 kg bag / 1,000 kg bulk bag'),
    leadTime: '8–12 business days',
    estimatedPrice: 9.6,
    hazard: 'irritant',
    hazards: ['irritant'],
    sdsUrl: '#sds-cacl2',
    tdsUrl: '#tds-cacl2',
    coaUrl: '#coa-cacl2',
    sdsUpdatedAt: '2026-02-08',
    category: 'Inorganics',
    slug: 'calcium-chloride-anhydrous',
    inStock: true,
    hsChapter: '28',
    industryTags: 'construction,water-treatment',
    description:
      'Anhydrous CaCl₂ flakes for drying, dust control, and process chemistry with bag and bulk-bag options.',
    applications: 'Construction chemistry, water treatment, and food-process adjacent grades.',
    handlingNotes:
      'Hygroscopic — keep bags sealed. Dust may irritate eyes and respiratory tract. Use dust mask when emptying bulk bags.',
    seoTitle: 'Calcium Chloride Anhydrous | CAS 10043-52-4 | LeanChem',
    seoDescription: 'Calcium Chloride anhydrous (CAS 10043-52-4) from LeanChem Ethiopia.',
    properties: [
      { key: 'Assay', value: '≥94%' },
      { key: 'Form', value: 'Flakes' },
      { key: 'HS Chapter', value: '28' },
    ],
  },
]

export function getProductBySlug(slug: string): Product | undefined {
  return MOCK_PRODUCTS.find((p) => p.slug === slug)
}

export function filterProducts(opts: {
  q?: string
  market?: string
  category?: string
  purity?: string
  physicalState?: string
}): Product[] {
  const q = opts.q?.trim().toLowerCase()
  return MOCK_PRODUCTS.filter((p) => {
    if (opts.category && p.category !== opts.category) return false
    if (opts.purity && p.purity !== opts.purity) return false
    if (opts.physicalState && p.physicalState !== opts.physicalState) return false
    if (opts.market && !p.industryTags.split(',').includes(opts.market)) return false
    if (!q) return true
    return (
      p.name.toLowerCase().includes(q) ||
      p.casNumber.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    )
  })
}

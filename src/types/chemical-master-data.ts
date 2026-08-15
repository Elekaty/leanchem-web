/**
 * Chemical Master Data — API shape (ChemicalFullData) + DB column map.
 *
 * DB table: public."Chemical_Master_Data"
 * PK / Ref #: Row_No → id
 * Canonical product ID: uuid_id (Sales, TDS, Stock, CRM, Trade & Transit)
 */

/** Fixed Sector options (UI + business rules). */
export const CHEMICAL_SECTORS = [
  'Construction',
  'Paint and Coating',
  'Personal and Cleaning',
  'Plastic and Foam',
  'Food and Pharmaceutical',
] as const

export type ChemicalSector = (typeof CHEMICAL_SECTORS)[number]

/** Fixed Industry options — exactly these 8. */
export const CHEMICAL_INDUSTRIES = [
  'Dry Mix mortar',
  'Concrete admixture',
  'Paint and Coating',
  'Plastic',
  'Foam',
  'Detergent',
  'Food',
  'Pharmaceutical',
] as const

export type ChemicalIndustry = (typeof CHEMICAL_INDUSTRIES)[number]

/** API / app shape (snake_case). */
export interface ChemicalFullData {
  id: number
  uuid_id: string
  vendor: string
  sector: string | null
  industry: string | null
  product_category: string | null
  sub_category: string | null
  product_name: string
  generic_name: string | null
  product_type: string | null
  packing: string | null
  hs_code: string | null
  country_of_origin: string | null
  typical_application: string | null
  product_description: string | null
  price: number | null
  current_price: number | null
  current_price_currency: string | null
  current_cost: number | null
  current_cost_currency: string | null
  partner_id: string | null
  /** API-only enrichment from TDS module (not a DB column). */
  tds_document?: string | null
}

/** Row as returned from Postgres (PascalCase / quoted columns). */
export interface ChemicalMasterDataRow {
  Row_No: number
  uuid_id: string
  Supplier_Name: string | null
  Sector: string | null
  Category: string | null
  Sub_Category: string | null
  Product_Name: string | null
  Generic_Name: string | null
  Product_Type: string | null
  Packaging: string | null
  HS_Code: string | null
  Country_of_Origin: string | null
  Industry: string | null
  Price: number | string | null
  Typical_Application: string | null
  Product_Description: string | null
  Partner_ID: string | null
  Current_Price: number | string | null
  Current_Price_Currency: string | null
  Current_Cost: number | string | null
  Current_Cost_Currency: string | null
}

/** Required fields for create (UI + business rules). */
export interface ChemicalFullDataCreateInput {
  vendor: string
  product_name: string
  industry: ChemicalIndustry
  sector?: ChemicalSector | string | null
  product_category?: string | null
  sub_category?: string | null
  generic_name?: string | null
  product_type?: string | null
  packing?: string | null
  hs_code?: string | null
  country_of_origin?: string | null
  typical_application?: string | null
  product_description?: string | null
  partner_id?: string | null
  price?: number | null
}

/** Editable on update — uuid_id and id (Row_No) are never rewritten. */
export type ChemicalFullDataUpdateInput = Partial<
  Omit<ChemicalFullDataCreateInput, never>
>

function num(v: number | string | null | undefined): number | null {
  if (v == null || v === '') return null
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : null
}

/** Map DB row → ChemicalFullData API. */
export function mapChemicalMasterRow(row: ChemicalMasterDataRow): ChemicalFullData {
  return {
    id: row.Row_No,
    uuid_id: row.uuid_id,
    vendor: row.Supplier_Name ?? '',
    sector: row.Sector,
    industry: row.Industry,
    product_category: row.Category,
    sub_category: row.Sub_Category,
    product_name: row.Product_Name ?? '',
    generic_name: row.Generic_Name,
    product_type: row.Product_Type,
    packing: row.Packaging,
    hs_code: row.HS_Code,
    country_of_origin: row.Country_of_Origin,
    typical_application: row.Typical_Application,
    product_description: row.Product_Description,
    price: num(row.Price),
    current_price: num(row.Current_Price),
    current_price_currency: row.Current_Price_Currency,
    current_cost: num(row.Current_Cost),
    current_cost_currency: row.Current_Cost_Currency,
    partner_id: row.Partner_ID,
  }
}

/** Validate create payload (app rules). */
export function validateChemicalCreate(input: ChemicalFullDataCreateInput): string[] {
  const errors: string[] = []
  if (!input.vendor?.trim()) errors.push('vendor is required')
  if (!input.product_name?.trim()) errors.push('product_name is required')
  if (!input.industry?.trim()) {
    errors.push('industry is required')
  } else if (!(CHEMICAL_INDUSTRIES as readonly string[]).includes(input.industry)) {
    errors.push(`industry must be one of: ${CHEMICAL_INDUSTRIES.join(', ')}`)
  }
  if (
    input.sector &&
    !(CHEMICAL_SECTORS as readonly string[]).includes(input.sector)
  ) {
    errors.push(`sector must be one of: ${CHEMICAL_SECTORS.join(', ')}`)
  }
  return errors
}

/**
 * Assign next Row_No: lowest unused positive integer.
 * Pass existing Row_No values from DB.
 */
export function nextChemicalRowNo(existing: Iterable<number>): number {
  const used = new Set(existing)
  let n = 1
  while (used.has(n)) n += 1
  return n
}

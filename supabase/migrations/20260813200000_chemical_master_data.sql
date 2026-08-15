-- Chemical Master Data — full replica matching LeanChem / PMS ChemicalFullData
-- Table identity: public."Chemical_Master_Data"
-- PK: "Row_No" (app Ref #) | Cross-system key: uuid_id (canonical product ID)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public."Chemical_Master_Data" (
  -- Identity
  "Row_No"                 integer PRIMARY KEY,
  uuid_id                  uuid UNIQUE DEFAULT gen_random_uuid(),

  -- Core catalog
  "Supplier_Name"          text,
  "Sector"                 text,
  "Category"               text,
  "Sub_Category"           text,
  "Product_Name"           text,
  "Generic_Name"           text,
  "Product_Type"           text,
  "Packaging"              text,
  "HS_Code"                text,
  "Country_of_Origin"      text,

  -- Extended (docs/0005 + 0010d)
  "Industry"               text,
  "Price"                  numeric,
  "Typical_Application"    text,
  "Product_Description"    text,
  "Partner_ID"             uuid,
  "Current_Price"          numeric,
  "Current_Price_Currency" text,
  "Current_Cost"           numeric,
  "Current_Cost_Currency"  text
);

CREATE UNIQUE INDEX IF NOT EXISTS chemical_master_data_uuid_id_idx
  ON public."Chemical_Master_Data" (uuid_id)
  WHERE uuid_id IS NOT NULL;

COMMENT ON COLUMN public."Chemical_Master_Data"."Current_Price" IS
  'Latest active sell price from PMS Pricing & Costing.';
COMMENT ON COLUMN public."Chemical_Master_Data"."Current_Cost" IS
  'Latest active cost from PMS Pricing & Costing.';
COMMENT ON COLUMN public."Chemical_Master_Data"."Row_No" IS
  'Human Ref # in PMS UI. App-assigned unique integer; never client-assigned on create.';
COMMENT ON COLUMN public."Chemical_Master_Data".uuid_id IS
  'Canonical product ID for Sales, TDS, Stock, CRM, Trade & Transit.';

-- Grants (docs/0005b)
GRANT SELECT ON public."Chemical_Master_Data" TO authenticated;
GRANT SELECT ON public."Chemical_Master_Data" TO anon;
GRANT ALL    ON public."Chemical_Master_Data" TO service_role;

-- Backfill any null uuids
UPDATE public."Chemical_Master_Data"
SET uuid_id = gen_random_uuid()
WHERE uuid_id IS NULL;

-- Optional RLS (read for anon/authenticated; writes via service_role)
ALTER TABLE public."Chemical_Master_Data" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS chemical_master_data_select_anon ON public."Chemical_Master_Data";
CREATE POLICY chemical_master_data_select_anon
  ON public."Chemical_Master_Data"
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- No DB-level CHECK for industry/sector — validation is in app code.

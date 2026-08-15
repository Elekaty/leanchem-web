-- Optional demo rows for Chemical_Master_Data (safe re-run)
-- Uses fixed Row_No values that will not collide with typical PMS ranges if you later import production.

INSERT INTO public."Chemical_Master_Data" (
  "Row_No", uuid_id,
  "Supplier_Name", "Sector", "Industry", "Category", "Sub_Category",
  "Product_Name", "Generic_Name", "Product_Type", "Packaging", "HS_Code",
  "Country_of_Origin", "Typical_Application", "Product_Description"
) VALUES
(
  1, 'a1000001-0000-4000-8000-000000000001',
  'Acme Chemicals', 'Construction', 'Dry Mix mortar', 'Polymers', 'RDP',
  'Redispersible Polymer Powder', 'VAE RDP', 'Dry Mix mortar', '25 kg bag', '3905.12',
  'China', 'Tile adhesive', 'Industrial RDP for cementitious dry mix systems.'
),
(
  2, 'a1000001-0000-4000-8000-000000000002',
  'Horizon Coatings Supply', 'Paint and Coating', 'Paint and Coating', 'Solvents', 'Ketones',
  'Acetone Industrial Grade', 'Acetone', 'Paint and Coating', '200 L drum', '2914.11',
  'Korea', 'Coatings thinner', 'Low-water acetone for industrial coatings.'
),
(
  3, 'a1000001-0000-4000-8000-000000000003',
  'Blue Nile Water Chem', 'Construction', 'Concrete admixture', 'Admixtures', 'Plasticizers',
  'Polycarboxylate Superplasticizer', 'PCE', 'Concrete admixture', 'IBC tote', '3824.40',
  'Germany', 'Ready-mix concrete', 'High-range water reducer for concrete.'
)
ON CONFLICT ("Row_No") DO UPDATE SET
  "Supplier_Name" = EXCLUDED."Supplier_Name",
  "Product_Name" = EXCLUDED."Product_Name",
  "Industry" = EXCLUDED."Industry",
  "Sector" = EXCLUDED."Sector",
  "Packaging" = EXCLUDED."Packaging",
  "HS_Code" = EXCLUDED."HS_Code";

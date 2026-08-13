-- Seed SEO / facet columns for demo catalog (run after 20260813190000)

UPDATE public.products SET
  slug = 'sodium-hydroxide-pellets',
  seo_description = 'Sodium Hydroxide pellets ACS reagent grade (CAS 1310-73-2) for Ethiopian industrial procurement. Specs, packaging, SDS/TDS, and RFQ.',
  hs_chapter = '28',
  packaging_options = '25 kg drum / 500 kg IBC',
  industry_tags = 'construction,water-treatment'
WHERE id = 'c0000001-0000-4000-8000-000000000001';

UPDATE public.products SET
  slug = 'isopropyl-alcohol-hplc',
  seo_description = 'Isopropyl Alcohol anhydrous HPLC grade (CAS 67-63-0). Packaging options, stock status, and RFQ via LeanChem.',
  hs_chapter = '29',
  packaging_options = '20 L jerrican / 200 L drum',
  industry_tags = 'paints-coatings,plastics'
WHERE id = 'c0000001-0000-4000-8000-000000000002';

UPDATE public.products SET
  slug = 'acetone-acs-reagent',
  seo_description = 'Acetone ACS reagent low water content (CAS 67-64-1) for precision cleaning and coatings.',
  hs_chapter = '29',
  packaging_options = '200 L drum / ISO tank',
  industry_tags = 'paints-coatings'
WHERE id = 'c0000001-0000-4000-8000-000000000003';

UPDATE public.products SET
  slug = 'hydrochloric-acid-37',
  seo_description = 'Hydrochloric Acid 37% technical grade (CAS 7647-01-0) for bulk industrial use in Ethiopia.',
  hs_chapter = '28',
  packaging_options = 'IBC tote / bulk tanker',
  industry_tags = 'water-treatment,construction'
WHERE id = 'c0000001-0000-4000-8000-000000000004';

UPDATE public.products SET
  slug = 'toluene-industrial',
  seo_description = 'Toluene industrial grade (CAS 108-88-3) for coatings and adhesives manufacturing.',
  hs_chapter = '29',
  packaging_options = '200 L drum',
  industry_tags = 'paints-coatings,plastics'
WHERE id = 'c0000001-0000-4000-8000-000000000005';

UPDATE public.products SET
  slug = 'hydrogen-peroxide-35',
  seo_description = 'Hydrogen Peroxide 35% stabilized (CAS 7722-84-1) for oxidation and water treatment.',
  hs_chapter = '28',
  packaging_options = '30 L HDPE drum',
  industry_tags = 'water-treatment'
WHERE id = 'c0000001-0000-4000-8000-000000000006';

UPDATE public.products SET
  slug = 'methanol-absolute',
  seo_description = 'Methanol absolute ACS spectrophotometric grade (CAS 67-56-1).',
  hs_chapter = '29',
  packaging_options = '20 L jerrican / 200 L drum',
  industry_tags = 'paints-coatings,plastics'
WHERE id = 'c0000001-0000-4000-8000-000000000007';

UPDATE public.products SET
  slug = 'calcium-chloride-anhydrous',
  seo_description = 'Calcium Chloride anhydrous food processing grade (CAS 10043-52-4).',
  hs_chapter = '28',
  packaging_options = '25 kg bag / 1,000 kg bulk bag',
  industry_tags = 'construction,water-treatment'
WHERE id = 'c0000001-0000-4000-8000-000000000008';

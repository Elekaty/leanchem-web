-- Phase 1.5: SEO + facet fields for public catalog / PDP hybrid
-- Safe to re-run on existing Phase 1 databases

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS slug VARCHAR(160),
  ADD COLUMN IF NOT EXISTS seo_description TEXT,
  ADD COLUMN IF NOT EXISTS hs_chapter VARCHAR(10),
  ADD COLUMN IF NOT EXISTS packaging_options VARCHAR(255),
  ADD COLUMN IF NOT EXISTS industry_tags VARCHAR(255);

-- Backfill slug from name + short id when missing
UPDATE public.products
SET slug = lower(
  regexp_replace(
    regexp_replace(trim(name), '[^a-zA-Z0-9]+', '-', 'g'),
    '(^-+|-+$)',
    '',
    'g'
  )
) || '-' || left(replace(id::text, '-', ''), 8)
WHERE slug IS NULL OR slug = '';

-- Prefer packaging_options; fall back to legacy packaging_volumes
UPDATE public.products
SET packaging_options = packaging_volumes
WHERE (packaging_options IS NULL OR packaging_options = '')
  AND packaging_volumes IS NOT NULL;

UPDATE public.products
SET hs_chapter = CASE
  WHEN physical_state ILIKE '%solid%' OR name ILIKE '%chloride%' OR name ILIKE '%hydroxide%' THEN '28'
  WHEN name ILIKE '%acid%' THEN '28'
  WHEN name ILIKE '%toluene%' OR name ILIKE '%alcohol%' OR name ILIKE '%acetone%' OR name ILIKE '%methanol%' THEN '29'
  ELSE '38'
END
WHERE hs_chapter IS NULL OR hs_chapter = '';

UPDATE public.products
SET seo_description = COALESCE(
  seo_description,
  left(
    name || ' (CAS ' || COALESCE(cas_number, 'n/a') || '). Specs, packaging, stock status, TDS/SDS, and RFQ via LeanChem Ethiopia.',
    300
  )
)
WHERE seo_description IS NULL OR seo_description = '';

UPDATE public.products
SET industry_tags = CASE
  WHEN name ILIKE '%toluene%' OR name ILIKE '%acetone%' THEN 'paints-coatings'
  WHEN name ILIKE '%chloride%' OR name ILIKE '%hydroxide%' THEN 'construction,water-treatment'
  WHEN name ILIKE '%peroxide%' THEN 'water-treatment'
  WHEN physical_state ILIKE '%liquid%' THEN 'plastics,paints-coatings'
  ELSE 'construction'
END
WHERE industry_tags IS NULL OR industry_tags = '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug_unique ON public.products (slug);
CREATE INDEX IF NOT EXISTS idx_products_hs_chapter ON public.products (hs_chapter);
CREATE INDEX IF NOT EXISTS idx_products_industry_tags ON public.products (industry_tags);

-- Public RFQ inbox (anonymous /contact submissions)
CREATE TABLE IF NOT EXISTS public.rfq_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_slug VARCHAR(160),
  product_name VARCHAR(255),
  cas_number VARCHAR(50),
  volume_text TEXT,
  delivery_terms VARCHAR(100),
  market VARCHAR(100),
  intent VARCHAR(50) DEFAULT 'quote',
  notes TEXT,
  status VARCHAR(50) DEFAULT 'request_submitted'
    CHECK (status IN ('draft', 'request_submitted', 'closed')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rfq_requests_created ON public.rfq_requests (created_at DESC);

ALTER TABLE public.rfq_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS insert_rfq_anon ON public.rfq_requests;
CREATE POLICY insert_rfq_anon ON public.rfq_requests
  FOR INSERT TO anon, authenticated, service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS read_rfq_service ON public.rfq_requests;
CREATE POLICY read_rfq_service ON public.rfq_requests
  FOR SELECT TO service_role
  USING (true);

GRANT INSERT ON public.rfq_requests TO anon, authenticated, service_role;
GRANT SELECT, UPDATE, DELETE ON public.rfq_requests TO service_role;

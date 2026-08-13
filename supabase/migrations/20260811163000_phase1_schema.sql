-- LeanChem Phase 1 — Supabase migration
-- Adapted for Supabase roles (anon / authenticated / service_role)
-- Compatible with Express API JWT claim sub and Supabase auth.uid()

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Module 1: Identity & Access
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_import_key VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  tin_number VARCHAR(100),
  verification_status VARCHAR(50) DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  role VARCHAR(50) DEFAULT 'super_admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.company_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL
    CHECK (document_type IN ('business_license', 'tin_certificate')),
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- Modules 2 & 3: Catalog
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_import_key VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  cas_number VARCHAR(50),
  chemical_formula VARCHAR(100),
  purity_grade VARCHAR(100),
  physical_state VARCHAR(50),
  primary_hazard_code VARCHAR(50),
  in_stock BOOLEAN DEFAULT false,
  moq INTEGER,
  moq_unit VARCHAR(50),
  lead_time_days INTEGER,
  estimated_price NUMERIC(10, 2),
  price_currency VARCHAR(10) DEFAULT 'USD',
  packaging_volumes VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_cas ON public.products(cas_number);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);

CREATE TABLE IF NOT EXISTS public.product_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  document_type VARCHAR(50) DEFAULT 'SDS',
  file_url TEXT NOT NULL,
  last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.sample_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'requested'
    CHECK (status IN ('requested', 'dispatched', 'delivered')),
  requested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_sample_per_user UNIQUE (product_id, user_id)
);

-- ---------------------------------------------------------------------------
-- Modules 4 & 5: Orders
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'canonical_order_status') THEN
    CREATE TYPE public.canonical_order_status AS ENUM (
      'draft',
      'request_submitted',
      'verified',
      'delivering',
      'fulfilled'
    );
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  requested_by UUID REFERENCES public.users(id),
  status public.canonical_order_status DEFAULT 'request_submitted',
  delivery_address TEXT NOT NULL,
  internal_notes TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

DROP TRIGGER IF EXISTS update_orders_modtime ON public.orders;
CREATE TRIGGER update_orders_modtime
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  requested_quantity INTEGER NOT NULL,
  packaging_preference VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS public.order_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES public.users(id),
  document_type VARCHAR(50) NOT NULL
    CHECK (document_type IN ('payment_receipt', 'final_invoice')),
  file_url TEXT NOT NULL,
  file_size_bytes INTEGER,
  uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Resolve current user id from custom API JWT claim or Supabase Auth
-- Must be created AFTER public.users exists.
CREATE OR REPLACE FUNCTION public.current_app_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    NULLIF(auth.jwt() ->> 'sub', '')::uuid,
    auth.uid(),
    NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid
  );
$$;

CREATE OR REPLACE FUNCTION public.current_app_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id
  FROM public.users
  WHERE id = public.current_app_user_id()
  LIMIT 1;
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sample_requests ENABLE ROW LEVEL SECURITY;

-- Companies / users: members can read own company context
DROP POLICY IF EXISTS view_own_company ON public.companies;
CREATE POLICY view_own_company ON public.companies FOR SELECT
  USING (id = public.current_app_company_id());

DROP POLICY IF EXISTS view_own_user ON public.users;
CREATE POLICY view_own_user ON public.users FOR SELECT
  USING (
    id = public.current_app_user_id()
    OR company_id = public.current_app_company_id()
  );

-- Products: public catalog read (price stripping remains API responsibility)
DROP POLICY IF EXISTS read_all_products ON public.products;
CREATE POLICY read_all_products ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS read_all_product_docs ON public.product_documents;
CREATE POLICY read_all_product_docs ON public.product_documents FOR SELECT USING (true);

DROP POLICY IF EXISTS view_own_company_docs ON public.company_documents;
CREATE POLICY view_own_company_docs ON public.company_documents FOR SELECT
  USING (company_id = public.current_app_company_id());

DROP POLICY IF EXISTS insert_own_company_docs ON public.company_documents;
CREATE POLICY insert_own_company_docs ON public.company_documents FOR INSERT
  WITH CHECK (company_id = public.current_app_company_id());

DROP POLICY IF EXISTS view_own_orders ON public.orders;
CREATE POLICY view_own_orders ON public.orders FOR SELECT
  USING (company_id = public.current_app_company_id());

DROP POLICY IF EXISTS insert_own_orders ON public.orders;
CREATE POLICY insert_own_orders ON public.orders FOR INSERT
  WITH CHECK (company_id = public.current_app_company_id());

DROP POLICY IF EXISTS view_own_order_items ON public.order_items;
CREATE POLICY view_own_order_items ON public.order_items FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM public.orders WHERE company_id = public.current_app_company_id()
    )
  );

DROP POLICY IF EXISTS insert_own_order_items ON public.order_items;
CREATE POLICY insert_own_order_items ON public.order_items FOR INSERT
  WITH CHECK (
    order_id IN (
      SELECT id FROM public.orders WHERE company_id = public.current_app_company_id()
    )
  );

DROP POLICY IF EXISTS view_own_order_docs ON public.order_documents;
CREATE POLICY view_own_order_docs ON public.order_documents FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM public.orders WHERE company_id = public.current_app_company_id()
    )
  );

DROP POLICY IF EXISTS insert_own_order_docs ON public.order_documents;
CREATE POLICY insert_own_order_docs ON public.order_documents FOR INSERT
  WITH CHECK (
    order_id IN (
      SELECT id FROM public.orders WHERE company_id = public.current_app_company_id()
    )
  );

DROP POLICY IF EXISTS view_own_samples ON public.sample_requests;
CREATE POLICY view_own_samples ON public.sample_requests FOR SELECT
  USING (user_id = public.current_app_user_id());

DROP POLICY IF EXISTS insert_own_samples ON public.sample_requests;
CREATE POLICY insert_own_samples ON public.sample_requests FOR INSERT
  WITH CHECK (user_id = public.current_app_user_id());

-- Grants for Supabase roles (service_role bypasses RLS by default)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT ON public.products, public.product_documents TO anon, authenticated, service_role;

GRANT SELECT ON public.companies, public.users TO authenticated, service_role;

GRANT SELECT, INSERT ON public.company_documents, public.orders, public.order_items,
  public.order_documents, public.sample_requests TO authenticated, service_role;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

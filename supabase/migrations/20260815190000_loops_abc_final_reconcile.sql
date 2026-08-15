-- =============================================================================
-- LeanChem Loops A/B/C — FINAL schema reconcile (safe to re-run)
-- Paste this ENTIRE file into Supabase SQL Editor and click Run.
-- Do not remove the leading "--" from comment lines.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) RFQS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rfqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS reference TEXT;
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS volume NUMERIC;
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'MT';
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS packaging TEXT;
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS incoterms TEXT;
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS target_delivery_date DATE;
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS buyer_name TEXT;
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS buyer_company TEXT;
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS buyer_email TEXT;
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS buyer_phone TEXT;
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS total_volume NUMERIC;
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS volume_unit TEXT DEFAULT 'MT';

UPDATE public.rfqs SET
  contact_name = COALESCE(contact_name, buyer_name),
  company_name = COALESCE(company_name, buyer_company),
  email = COALESCE(email, buyer_email),
  phone = COALESCE(phone, buyer_phone),
  volume = COALESCE(volume, total_volume),
  unit = COALESCE(unit, volume_unit, 'MT');

CREATE INDEX IF NOT EXISTS idx_rfqs_created ON public.rfqs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rfqs_status ON public.rfqs (status);
CREATE INDEX IF NOT EXISTS idx_rfqs_email ON public.rfqs (email);

ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS insert_rfqs_anon ON public.rfqs;
CREATE POLICY insert_rfqs_anon ON public.rfqs
  FOR INSERT TO anon, authenticated, service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS select_rfqs_anon ON public.rfqs;
CREATE POLICY select_rfqs_anon ON public.rfqs
  FOR SELECT TO anon, authenticated, service_role
  USING (true);

DROP POLICY IF EXISTS update_rfqs_anon ON public.rfqs;
CREATE POLICY update_rfqs_anon ON public.rfqs
  FOR UPDATE TO anon, authenticated, service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public RFQ insert" ON public.rfqs;
DROP POLICY IF EXISTS "Allow full access for authenticated staff" ON public.rfqs;

GRANT INSERT, SELECT, UPDATE ON public.rfqs TO anon, authenticated, service_role;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.rfqs;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

-- -----------------------------------------------------------------------------
-- 2) SUPPLIERS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS categories_supplied TEXT[];
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

DO $$
BEGIN
  BEGIN
    ALTER TABLE public.suppliers ALTER COLUMN company_name DROP NOT NULL;
  EXCEPTION WHEN others THEN NULL;
  END;
  BEGIN
    ALTER TABLE public.suppliers ALTER COLUMN contact_email DROP NOT NULL;
  EXCEPTION WHEN others THEN NULL;
  END;
END $$;

UPDATE public.suppliers SET
  name = COALESCE(name, company_name),
  email = COALESCE(email, contact_email),
  company_name = COALESCE(company_name, name),
  contact_email = COALESCE(contact_email, email),
  active = COALESCE(active, true);

CREATE UNIQUE INDEX IF NOT EXISTS suppliers_email_unique
  ON public.suppliers (email)
  WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_suppliers_active
  ON public.suppliers (active)
  WHERE active = true;

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS select_suppliers_service ON public.suppliers;
CREATE POLICY select_suppliers_service ON public.suppliers
  FOR SELECT TO anon, authenticated, service_role
  USING (COALESCE(active, true) = true);

GRANT SELECT ON public.suppliers TO anon, authenticated, service_role;
GRANT ALL ON public.suppliers TO service_role;

INSERT INTO public.suppliers (company_name, contact_email, name, email, active)
SELECT v.company_name, v.contact_email, v.name, v.email, v.active
FROM (
  VALUES
    (
      'Demo Supplier Asia',
      'sourcing-demo-asia@leanchems.com',
      'Demo Supplier Asia',
      'sourcing-demo-asia@leanchems.com',
      true
    ),
    (
      'Demo Supplier EU',
      'sourcing-demo-eu@leanchems.com',
      'Demo Supplier EU',
      'sourcing-demo-eu@leanchems.com',
      true
    )
) AS v(company_name, contact_email, name, email, active)
WHERE NOT EXISTS (
  SELECT 1 FROM public.suppliers s
  WHERE s.email = v.email OR s.contact_email = v.contact_email
);

-- -----------------------------------------------------------------------------
-- 3) PURCHASE ORDERS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS po_number TEXT;
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS rfq_id UUID;
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS buyer_email TEXT;
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS current_stage TEXT DEFAULT 'Origin Port';
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS last_updated TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'purchase_orders_rfq_id_fkey'
  ) THEN
    BEGIN
      ALTER TABLE public.purchase_orders
        ADD CONSTRAINT purchase_orders_rfq_id_fkey
        FOREIGN KEY (rfq_id) REFERENCES public.rfqs (id) ON DELETE SET NULL;
    EXCEPTION WHEN others THEN NULL;
    END;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS purchase_orders_po_number_key
  ON public.purchase_orders (po_number)
  WHERE po_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_purchase_orders_last_updated
  ON public.purchase_orders (last_updated DESC);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_buyer_email
  ON public.purchase_orders (buyer_email);

ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS select_purchase_orders_anon ON public.purchase_orders;
CREATE POLICY select_purchase_orders_anon ON public.purchase_orders
  FOR SELECT TO anon, authenticated, service_role
  USING (true);

DROP POLICY IF EXISTS update_purchase_orders_service ON public.purchase_orders;
CREATE POLICY update_purchase_orders_service ON public.purchase_orders
  FOR UPDATE TO service_role
  USING (true)
  WITH CHECK (true);

GRANT SELECT ON public.purchase_orders TO anon, authenticated, service_role;
GRANT ALL ON public.purchase_orders TO service_role;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.purchase_orders;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

INSERT INTO public.purchase_orders (po_number, buyer_email, current_stage)
SELECT v.po_number, v.buyer_email, v.current_stage
FROM (
  VALUES
    ('PO-2026-001', 'buyer@example.com', 'Ocean Transit'),
    ('PO-2026-002', 'buyer@example.com', 'Djibouti Customs')
) AS v(po_number, buyer_email, current_stage)
WHERE NOT EXISTS (
  SELECT 1 FROM public.purchase_orders p WHERE p.po_number = v.po_number
);

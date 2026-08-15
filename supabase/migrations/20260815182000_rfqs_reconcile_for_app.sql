-- Reconcile public.rfqs for LeanChem Loops A–C
-- Safe to re-run. Does NOT require buyer_* columns to exist.

-- 1) Ensure app columns exist
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS volume NUMERIC;
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'MT';
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS reference TEXT;
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS packaging TEXT;
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS incoterms TEXT;
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS target_delivery_date DATE;
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- 2) Backfill ONLY if your older buyer_* / total_volume columns exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'rfqs' AND column_name = 'buyer_name'
  ) THEN
    EXECUTE $sql$
      UPDATE public.rfqs
      SET contact_name = COALESCE(contact_name, buyer_name)
      WHERE contact_name IS NULL
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'rfqs' AND column_name = 'buyer_company'
  ) THEN
    EXECUTE $sql$
      UPDATE public.rfqs
      SET company_name = COALESCE(company_name, buyer_company)
      WHERE company_name IS NULL
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'rfqs' AND column_name = 'buyer_email'
  ) THEN
    EXECUTE $sql$
      UPDATE public.rfqs
      SET email = COALESCE(email, buyer_email)
      WHERE email IS NULL
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'rfqs' AND column_name = 'buyer_phone'
  ) THEN
    EXECUTE $sql$
      UPDATE public.rfqs
      SET phone = COALESCE(phone, buyer_phone)
      WHERE phone IS NULL
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'rfqs' AND column_name = 'total_volume'
  ) THEN
    EXECUTE $sql$
      UPDATE public.rfqs
      SET volume = COALESCE(volume, total_volume)
      WHERE volume IS NULL
    $sql$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'rfqs' AND column_name = 'volume_unit'
  ) THEN
    EXECUTE $sql$
      UPDATE public.rfqs
      SET unit = COALESCE(unit, volume_unit, 'MT')
      WHERE unit IS NULL
    $sql$;
  END IF;
END $$;

-- 3) Indexes (only after email exists)
CREATE INDEX IF NOT EXISTS idx_rfqs_created ON public.rfqs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rfqs_status ON public.rfqs (status);
CREATE INDEX IF NOT EXISTS idx_rfqs_email ON public.rfqs (email);

-- 4) RLS + grants for public site + admin anon key
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

GRANT INSERT, SELECT, UPDATE ON public.rfqs TO anon, authenticated, service_role;

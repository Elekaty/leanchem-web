-- Loop A: multi-line public RFQ inbox (cart checkout)
CREATE TABLE IF NOT EXISTS public.rfqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT UNIQUE,
  contact_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  volume NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  packaging TEXT NOT NULL,
  incoterms TEXT NOT NULL,
  target_delivery_date DATE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rfqs_created ON public.rfqs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rfqs_status ON public.rfqs (status);
CREATE INDEX IF NOT EXISTS idx_rfqs_email ON public.rfqs (email);

ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS insert_rfqs_anon ON public.rfqs;
CREATE POLICY insert_rfqs_anon ON public.rfqs
  FOR INSERT TO anon, authenticated, service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS read_rfqs_service ON public.rfqs;
CREATE POLICY read_rfqs_service ON public.rfqs
  FOR SELECT TO service_role
  USING (true);

GRANT INSERT ON public.rfqs TO anon, authenticated, service_role;
GRANT SELECT, UPDATE, DELETE ON public.rfqs TO service_role;

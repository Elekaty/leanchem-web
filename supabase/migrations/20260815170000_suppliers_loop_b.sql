-- Loop B: supplier email directory for anonymous sourcing blasts
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_active ON public.suppliers (active)
  WHERE active = true;

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS select_suppliers_service ON public.suppliers;
CREATE POLICY select_suppliers_service ON public.suppliers
  FOR SELECT TO anon, authenticated, service_role
  USING (active = true);

GRANT SELECT ON public.suppliers TO anon, authenticated, service_role;
GRANT ALL ON public.suppliers TO service_role;

-- Seed placeholders (replace with real supplier emails in production)
INSERT INTO public.suppliers (name, email, active)
VALUES
  ('Demo Supplier Asia', 'sourcing-demo-asia@leanchems.com', true),
  ('Demo Supplier EU', 'sourcing-demo-eu@leanchems.com', true)
ON CONFLICT (email) DO NOTHING;

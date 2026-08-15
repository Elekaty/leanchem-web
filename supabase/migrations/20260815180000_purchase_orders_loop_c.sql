-- Loop C: logistics tracking purchase orders (Djibouti–Modjo–Addis corridor)
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number TEXT UNIQUE,
  rfq_id UUID REFERENCES public.rfqs (id) ON DELETE SET NULL,
  buyer_email TEXT NOT NULL,
  current_stage TEXT NOT NULL DEFAULT 'Origin Port'
    CHECK (
      current_stage IN (
        'Origin Port',
        'Ocean Transit',
        'Djibouti Customs',
        'Modjo Dry Port',
        'Addis Delivery'
      )
    ),
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_last_updated
  ON public.purchase_orders (last_updated DESC);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_buyer_email
  ON public.purchase_orders (buyer_email);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_rfq_id
  ON public.purchase_orders (rfq_id);

ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS select_purchase_orders_service ON public.purchase_orders;
CREATE POLICY select_purchase_orders_service ON public.purchase_orders
  FOR SELECT TO anon, authenticated, service_role
  USING (true);

DROP POLICY IF EXISTS update_purchase_orders_service ON public.purchase_orders;
CREATE POLICY update_purchase_orders_service ON public.purchase_orders
  FOR UPDATE TO service_role
  USING (true)
  WITH CHECK (true);

GRANT SELECT ON public.purchase_orders TO anon, authenticated, service_role;
GRANT ALL ON public.purchase_orders TO service_role;

-- Demo rows for admin logistics UI + portal demo login
INSERT INTO public.purchase_orders (po_number, buyer_email, current_stage)
VALUES
  ('PO-2026-001', 'buyer@example.com', 'Ocean Transit'),
  ('PO-2026-002', 'buyer@example.com', 'Djibouti Customs')
ON CONFLICT (po_number) DO NOTHING;

-- Loop C portal tracker: Realtime UPDATEs on purchase_orders
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.purchase_orders;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
  WHEN undefined_object THEN
    RAISE NOTICE 'supabase_realtime publication not found — enable Realtime in the dashboard.';
END $$;

-- Align demo POs with the portal demo login (buyer@example.com / demo123)
INSERT INTO public.purchase_orders (po_number, buyer_email, current_stage)
VALUES
  ('PO-2026-001', 'buyer@example.com', 'Ocean Transit'),
  ('PO-2026-002', 'buyer@example.com', 'Djibouti Customs')
ON CONFLICT (po_number) DO UPDATE
  SET buyer_email = EXCLUDED.buyer_email;

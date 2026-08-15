-- Loop A admin dashboard: allow shared anon key to read/update + realtime
-- Run on the public-site Supabase project (same as leanchemweb RFQ submit).

ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS select_rfqs_anon ON public.rfqs;
CREATE POLICY select_rfqs_anon ON public.rfqs
  FOR SELECT TO anon, authenticated, service_role
  USING (true);

DROP POLICY IF EXISTS update_rfqs_anon ON public.rfqs;
CREATE POLICY update_rfqs_anon ON public.rfqs
  FOR UPDATE TO anon, authenticated, service_role
  USING (true)
  WITH CHECK (true);

GRANT SELECT, UPDATE ON public.rfqs TO anon, authenticated;

-- Enable Realtime for live inbox sync
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.rfqs;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
  WHEN undefined_object THEN
    RAISE NOTICE 'supabase_realtime publication not found — enable Realtime in the dashboard.';
END $$;


-- 1) car_blocked_dates: hide PII columns from anon/authenticated via column-level privileges
REVOKE SELECT ON public.car_blocked_dates FROM anon, authenticated;
GRANT SELECT (id, car_id, blocked_date, reservation_type, created_at) ON public.car_blocked_dates TO anon, authenticated;

-- 2) contract_signatures: restrict to admins only
DROP POLICY IF EXISTS "Admins can view all contract signatures" ON public.contract_signatures;
DROP POLICY IF EXISTS "Admins can create contract signatures" ON public.contract_signatures;

CREATE POLICY "Admins can view contract signatures"
ON public.contract_signatures
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can insert contract signatures"
ON public.contract_signatures
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 3) Remove reservations from realtime publication (prevents broadcasting customer PII)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'reservations'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.reservations';
  END IF;
END $$;

-- 4) Revoke EXECUTE on internal SECURITY DEFINER functions from anon/authenticated
-- Keep RPC-callable ones (create_reservation, create_or_get_customer) accessible.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_current_user_admin() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_user_is_admin(text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.calculate_cancellation_deadline() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_rate_limits() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.get_next_invoice_number(text) FROM anon, authenticated;

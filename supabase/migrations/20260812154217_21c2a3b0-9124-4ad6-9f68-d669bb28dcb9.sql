DROP POLICY IF EXISTS "Admins can view all newsletter subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can view all newsletter subscribers"
ON public.newsletter_subscribers FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Anyone can create customers" ON public.customers;
DROP POLICY IF EXISTS "Public can create reservations" ON public.reservations;

CREATE POLICY "Admins can create customers"
ON public.customers FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can create reservations"
ON public.reservations FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

REVOKE EXECUTE ON FUNCTION public.check_user_is_admin(text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_next_invoice_number(text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_current_user_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_next_invoice_number(text) TO service_role;
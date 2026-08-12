REVOKE EXECUTE ON FUNCTION public.check_user_is_admin(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_next_invoice_number(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_current_user_admin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_car_availability(text, date, date) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_reservation(uuid, text, date, date, time without time zone, time without time zone, text, text[], text, numeric, text, text, text, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_or_get_customer(text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_or_get_customer(text, text, text, text, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_next_invoice_number(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.check_car_availability(text, date, date) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_reservation(uuid, text, date, date, time without time zone, time without time zone, text, text[], text, numeric, text, text, text, text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_or_get_customer(text, text, text, text, text) TO anon, authenticated, service_role;
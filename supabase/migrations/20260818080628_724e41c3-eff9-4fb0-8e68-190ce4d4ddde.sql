-- Trigger-only / maintenance helpers: not callable via API at all
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.calculate_cancellation_deadline() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_rate_limits() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_user_is_admin(text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_next_invoice_number(text) FROM anon, authenticated;

-- Role helpers: only signed-in users may evaluate their own role
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_current_user_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_manage_reservations() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_my_admin_role() FROM anon;
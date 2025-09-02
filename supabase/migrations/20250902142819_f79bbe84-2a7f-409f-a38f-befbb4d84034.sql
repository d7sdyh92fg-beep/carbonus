-- ==========================================
-- CRITICAL SECURITY FIXES
-- ==========================================

-- 1. Remove dangerous public SELECT policies that expose PII
DROP POLICY IF EXISTS "Public can view customers" ON public.customers;
DROP POLICY IF EXISTS "Public can view reservations" ON public.reservations;

-- 2. Create a safe public availability view (minimal data, no PII)
CREATE OR REPLACE VIEW public.reservation_availability AS
SELECT 
  car_id,
  start_date,
  end_date
FROM public.reservations 
WHERE status IN ('requested', 'pending', 'confirmed');

-- Grant public access only to the safe availability view
GRANT SELECT ON public.reservation_availability TO anon;

-- 3. Create secure RPC for customer creation without public SELECT access
CREATE OR REPLACE FUNCTION public.create_or_get_customer(
  p_email text,
  p_first_name text,
  p_last_name text,
  p_phone text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  customer_id uuid;
BEGIN
  -- Validate inputs
  IF p_email IS NULL OR trim(p_email) = '' THEN
    RAISE EXCEPTION 'Email is required';
  END IF;
  
  IF p_first_name IS NULL OR trim(p_first_name) = '' THEN
    RAISE EXCEPTION 'First name is required';
  END IF;
  
  IF p_last_name IS NULL OR trim(p_last_name) = '' THEN
    RAISE EXCEPTION 'Last name is required';
  END IF;
  
  IF p_phone IS NULL OR trim(p_phone) = '' THEN
    RAISE EXCEPTION 'Phone is required';
  END IF;

  -- Try to find existing customer
  SELECT id INTO customer_id
  FROM public.customers 
  WHERE email = p_email;
  
  -- If not found, create new customer
  IF customer_id IS NULL THEN
    INSERT INTO public.customers (first_name, last_name, email, phone)
    VALUES (trim(p_first_name), trim(p_last_name), trim(p_email), trim(p_phone))
    RETURNING id INTO customer_id;
  END IF;
  
  RETURN customer_id;
END;
$$;

-- Grant execute permission to anonymous users for booking flow
GRANT EXECUTE ON FUNCTION public.create_or_get_customer TO anon;

-- 4. Add missing data integrity triggers
CREATE TRIGGER calculate_cancellation_deadline_trigger
  BEFORE INSERT OR UPDATE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.calculate_cancellation_deadline();

CREATE TRIGGER update_reservations_updated_at_trigger
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Create rate limiting table for edge function protection
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL, -- IP address or email
  endpoint text NOT NULL,
  request_count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Index for efficient rate limit lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_endpoint ON public.rate_limits(identifier, endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON public.rate_limits(window_start);

-- Enable RLS on rate limits (only edge functions can access)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow service role (edge functions) to manage rate limits
CREATE POLICY "Service role can manage rate limits" ON public.rate_limits
  FOR ALL USING (auth.role() = 'service_role');

-- 6. Create function to clean up old rate limit entries
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.rate_limits 
  WHERE window_start < now() - interval '1 hour';
$$;
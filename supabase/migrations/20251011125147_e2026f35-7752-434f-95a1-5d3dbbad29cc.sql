-- Add address column to customers table
ALTER TABLE public.customers 
ADD COLUMN address TEXT;

COMMENT ON COLUMN public.customers.address IS 'Kliento gyvenamasis adresas';

-- Update create_or_get_customer function to include address
CREATE OR REPLACE FUNCTION public.create_or_get_customer(
  p_email text,
  p_first_name text,
  p_last_name text,
  p_phone text,
  p_address text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    INSERT INTO public.customers (first_name, last_name, email, phone, address)
    VALUES (trim(p_first_name), trim(p_last_name), trim(p_email), trim(p_phone), trim(p_address))
    RETURNING id INTO customer_id;
  ELSE
    -- Update existing customer's address if provided
    IF p_address IS NOT NULL AND trim(p_address) != '' THEN
      UPDATE public.customers
      SET 
        first_name = trim(p_first_name),
        last_name = trim(p_last_name),
        phone = trim(p_phone),
        address = trim(p_address)
      WHERE id = customer_id;
    END IF;
  END IF;
  
  RETURN customer_id;
END;
$function$;
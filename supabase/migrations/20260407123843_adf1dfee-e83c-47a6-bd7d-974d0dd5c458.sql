
-- Create invoices table
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text NOT NULL UNIQUE,
  invoice_prefix text NOT NULL DEFAULT 'CARW',
  sequence_number integer NOT NULL,
  year integer NOT NULL DEFAULT EXTRACT(YEAR FROM now()),
  reservation_id uuid REFERENCES public.reservations(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  pdf_url text,
  notes text,
  sent_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Unique constraint: one prefix+sequence+year combo
ALTER TABLE public.invoices ADD CONSTRAINT invoices_prefix_seq_year_unique UNIQUE (invoice_prefix, sequence_number, year);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Admin-only access
CREATE POLICY "Admins can manage invoices"
ON public.invoices
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Auto-update updated_at
CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get next invoice number
CREATE OR REPLACE FUNCTION public.get_next_invoice_number(p_prefix text DEFAULT 'CARW')
RETURNS TABLE(invoice_number text, sequence_number integer, year integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_year integer := EXTRACT(YEAR FROM now());
  v_year_short integer := v_year % 100;
  v_next_seq integer;
BEGIN
  -- Get max sequence for this prefix and year
  SELECT COALESCE(MAX(i.sequence_number), 0) + 1
  INTO v_next_seq
  FROM public.invoices i
  WHERE i.invoice_prefix = p_prefix AND i.year = v_year;

  RETURN QUERY SELECT 
    p_prefix || ' ' || v_year_short::text || '/' || LPAD(v_next_seq::text, 3, '0'),
    v_next_seq,
    v_year;
END;
$$;

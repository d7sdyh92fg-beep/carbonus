UPDATE public.invoices SET invoice_prefix = 'CAR' WHERE invoice_prefix = 'CARW';

ALTER TABLE public.invoices ALTER COLUMN invoice_prefix SET DEFAULT 'CAR';

CREATE OR REPLACE FUNCTION public.get_next_invoice_number(p_prefix text DEFAULT 'CAR')
RETURNS TABLE(invoice_number text, sequence_number integer, year integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_year integer := EXTRACT(YEAR FROM now())::int;
  v_seq integer;
BEGIN
  SELECT COALESCE(MAX(i.sequence_number), 0) + 1 INTO v_seq
  FROM public.invoices i
  WHERE i.invoice_prefix = p_prefix AND i.year = v_year;

  RETURN QUERY SELECT
    p_prefix || ' ' || RIGHT(v_year::text, 2) || '/' || LPAD((v_seq + 5)::text, 3, '0'),
    v_seq,
    v_year;
END;
$$;
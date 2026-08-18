CREATE OR REPLACE FUNCTION public.get_next_invoice_number(p_prefix text DEFAULT 'CAR'::text)
 RETURNS TABLE(invoice_number text, sequence_number integer, year integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_year integer := EXTRACT(YEAR FROM now())::int;
  v_seq integer;
  v_display integer;
  v_number text;
BEGIN
  SELECT COALESCE(MAX(i.sequence_number), 0) + 1 INTO v_seq
  FROM public.invoices i
  WHERE i.invoice_prefix = p_prefix AND i.year = v_year;

  v_display := v_seq + 5;

  LOOP
    v_number := p_prefix || ' ' || RIGHT(v_year::text, 2) || '/' || LPAD(v_display::text, 3, '0');
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.invoices i WHERE i.invoice_number = v_number
    );
    v_display := v_display + 1;
  END LOOP;

  RETURN QUERY SELECT v_number, v_seq, v_year;
END;
$function$;
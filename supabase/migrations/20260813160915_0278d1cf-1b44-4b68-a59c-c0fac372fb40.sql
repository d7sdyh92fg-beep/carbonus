CREATE TABLE public.promo_code_claims (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL DEFAULT 'ACIU10',
  rating integer,
  action text NOT NULL DEFAULT 'revealed',
  source text NOT NULL DEFAULT 'review_page',
  name text,
  email text,
  phone text,
  language text NOT NULL DEFAULT 'lt',
  redeemed boolean NOT NULL DEFAULT false,
  redeemed_at timestamp with time zone,
  redeemed_reservation_id uuid REFERENCES public.reservations(id) ON DELETE SET NULL,
  admin_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT INSERT ON public.promo_code_claims TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promo_code_claims TO authenticated;
GRANT ALL ON public.promo_code_claims TO service_role;

ALTER TABLE public.promo_code_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log a promo claim"
  ON public.promo_code_claims FOR INSERT TO anon, authenticated
  WITH CHECK (
    code = 'ACIU10'
    AND source = 'review_page'
    AND action IN ('revealed','google_click','feedback_sent')
    AND (rating IS NULL OR (rating >= 1 AND rating <= 5))
    AND redeemed = false
    AND redeemed_at IS NULL
    AND redeemed_reservation_id IS NULL
    AND admin_notes IS NULL
    AND coalesce(length(name), 0) <= 120
    AND coalesce(length(email), 0) <= 200
    AND coalesce(length(phone), 0) <= 40
  );

CREATE POLICY "Admins can view promo claims"
  ON public.promo_code_claims FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update promo claims"
  ON public.promo_code_claims FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete promo claims"
  ON public.promo_code_claims FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_promo_code_claims_created_at ON public.promo_code_claims (created_at DESC);

CREATE TRIGGER update_promo_code_claims_updated_at
  BEFORE UPDATE ON public.promo_code_claims
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
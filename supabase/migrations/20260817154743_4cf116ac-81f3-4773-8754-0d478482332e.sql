ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS return_stage text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS return_reminder_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS admin_return_alert_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS inspection_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS deposit_status text NOT NULL DEFAULT 'held';

CREATE TABLE IF NOT EXISTS public.reservation_inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  checklist jsonb NOT NULL DEFAULT '{}'::jsonb,
  mileage_end integer,
  fuel_level text,
  photos text[] NOT NULL DEFAULT ARRAY[]::text[],
  notes text,
  issues text[] NOT NULL DEFAULT ARRAY[]::text[],
  extra_charge numeric NOT NULL DEFAULT 0,
  admin_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reservation_inspections TO authenticated;
GRANT ALL ON public.reservation_inspections TO service_role;

ALTER TABLE public.reservation_inspections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage inspections"
ON public.reservation_inspections FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_reservation_inspections_updated_at
BEFORE UPDATE ON public.reservation_inspections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_reservation_inspections_reservation
  ON public.reservation_inspections(reservation_id);

CREATE INDEX IF NOT EXISTS idx_reservations_return_watch
  ON public.reservations(status, return_date) WHERE deleted_at IS NULL;
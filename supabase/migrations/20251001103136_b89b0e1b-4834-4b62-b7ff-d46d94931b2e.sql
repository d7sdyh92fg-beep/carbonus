-- Add 'failed' status to reservations check constraint
ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS reservations_status_check;

ALTER TABLE public.reservations ADD CONSTRAINT reservations_status_check 
  CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'requested', 'denied', 'awaiting_payment', 'failed'));
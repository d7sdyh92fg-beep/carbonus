-- Update the status check constraint to allow 'awaiting_payment'
-- First, drop the existing constraint
ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS reservations_status_check;

-- Add the updated constraint with 'awaiting_payment' included
ALTER TABLE public.reservations ADD CONSTRAINT reservations_status_check 
  CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'requested', 'denied', 'awaiting_payment'));
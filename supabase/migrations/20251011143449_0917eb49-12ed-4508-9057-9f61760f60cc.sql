-- First, drop the old status check constraint
ALTER TABLE public.reservations 
DROP CONSTRAINT IF EXISTS reservations_status_check;

-- Update existing reservations from 'confirmed' to 'paid' status
UPDATE public.reservations 
SET status = 'paid' 
WHERE status = 'confirmed' 
AND deleted_at IS NULL;

-- Create new status check constraint with all valid statuses including 'paid' and 'picked_up'
ALTER TABLE public.reservations 
ADD CONSTRAINT reservations_status_check 
CHECK (status IN (
  'pending',
  'requested', 
  'awaiting_payment',
  'paid',
  'picked_up',
  'completed',
  'cancelled',
  'denied',
  'partial_payment'
));
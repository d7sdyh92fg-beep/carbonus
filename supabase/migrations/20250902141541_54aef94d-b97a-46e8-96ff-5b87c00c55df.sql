-- Remove the existing status check constraint and create a new one that includes 'requested'
ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS reservations_status_check;

-- Add new status check constraint that includes all our statuses
ALTER TABLE public.reservations ADD CONSTRAINT reservations_status_check 
CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'requested', 'denied'));
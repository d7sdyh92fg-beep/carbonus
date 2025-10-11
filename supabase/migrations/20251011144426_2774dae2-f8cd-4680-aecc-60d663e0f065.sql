-- Add pickup and return time fields to reservations table
ALTER TABLE public.reservations
ADD COLUMN pickup_date date,
ADD COLUMN pickup_time time,
ADD COLUMN return_date date,
ADD COLUMN return_time time;

-- Populate existing reservations with default times
UPDATE public.reservations
SET 
  pickup_date = start_date,
  pickup_time = '10:00:00',
  return_date = end_date,
  return_time = '10:00:00'
WHERE deleted_at IS NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.reservations.pickup_date IS 'Actual date when customer picks up the car';
COMMENT ON COLUMN public.reservations.pickup_time IS 'Actual time when customer picks up the car';
COMMENT ON COLUMN public.reservations.return_date IS 'Actual date when customer returns the car';
COMMENT ON COLUMN public.reservations.return_time IS 'Actual time when customer returns the car';
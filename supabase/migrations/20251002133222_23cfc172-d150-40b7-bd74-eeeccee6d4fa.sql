-- Add return inspection columns to reservations table
ALTER TABLE public.reservations
ADD COLUMN fuel_level_pickup text,
ADD COLUMN fuel_level_return text,
ADD COLUMN condition_pickup text,
ADD COLUMN condition_return text,
ADD COLUMN return_notes text,
ADD COLUMN returned_at timestamp with time zone;
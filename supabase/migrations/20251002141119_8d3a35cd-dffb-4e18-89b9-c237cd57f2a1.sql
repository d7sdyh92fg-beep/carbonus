-- Add additional_services column to reservations table
ALTER TABLE public.reservations 
ADD COLUMN IF NOT EXISTS additional_services jsonb DEFAULT '[]'::jsonb;
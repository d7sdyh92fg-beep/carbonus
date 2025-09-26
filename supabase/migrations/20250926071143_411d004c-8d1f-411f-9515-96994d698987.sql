-- Add support for both sides of driver's license
ALTER TABLE public.reservations 
ADD COLUMN driver_license_back_url TEXT;
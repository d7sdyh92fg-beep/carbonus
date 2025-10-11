-- Add second driver license columns to reservations table
ALTER TABLE public.reservations 
ADD COLUMN second_driver_license_url TEXT,
ADD COLUMN second_driver_license_back_url TEXT;

COMMENT ON COLUMN public.reservations.second_driver_license_url IS 'Antro vairuotojo pažymėjimo priekis';
COMMENT ON COLUMN public.reservations.second_driver_license_back_url IS 'Antro vairuotojo pažymėjimo galas';
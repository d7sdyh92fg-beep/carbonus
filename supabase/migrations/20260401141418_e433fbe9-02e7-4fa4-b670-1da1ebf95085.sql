ALTER TABLE public.car_blocked_dates 
ADD COLUMN reservation_type text NOT NULL DEFAULT 'block',
ADD COLUMN contact_name text,
ADD COLUMN contact_phone text;
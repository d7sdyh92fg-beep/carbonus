ALTER TABLE public.cars
  ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS price_tier1 numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS price_tier2 numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS price_tier3 numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS price_weekend numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS price_package_romantic text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS price_package_wedding text DEFAULT NULL;
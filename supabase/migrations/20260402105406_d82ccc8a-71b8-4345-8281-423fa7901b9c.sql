-- Add deposit_amount column to cars table
ALTER TABLE public.cars ADD COLUMN deposit_amount numeric NOT NULL DEFAULT 200;

-- Set premium car deposits to 400
UPDATE public.cars SET deposit_amount = 400 WHERE id IN ('6', '7');

-- Mark Citroën SpaceTourer as premium
UPDATE public.cars SET is_premium = true WHERE id = '7';
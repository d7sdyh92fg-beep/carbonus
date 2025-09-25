-- Update reservations table to support multiple payment providers
-- Rename stripe_payment_intent_id to payment_transaction_id
ALTER TABLE public.reservations 
RENAME COLUMN stripe_payment_intent_id TO payment_transaction_id;

-- Add payment_provider column
ALTER TABLE public.reservations 
ADD COLUMN payment_provider text DEFAULT 'stripe' CHECK (payment_provider IN ('stripe', 'paysera'));

-- Update existing records to have correct provider value
UPDATE public.reservations 
SET payment_provider = 'stripe' 
WHERE payment_transaction_id IS NOT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.reservations.payment_transaction_id IS 'Transaction ID from payment provider (Stripe Payment Intent ID or Paysera Order ID)';
COMMENT ON COLUMN public.reservations.payment_provider IS 'Payment provider used: stripe or paysera';
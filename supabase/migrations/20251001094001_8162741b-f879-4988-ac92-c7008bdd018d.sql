-- Update the payment_method check constraint to allow 'pay_now' and 'pay_at_counter'
-- First, drop the existing constraint
ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS reservations_payment_method_check;

-- Add the updated constraint with the correct values
ALTER TABLE public.reservations ADD CONSTRAINT reservations_payment_method_check 
  CHECK (payment_method IN ('pay_now', 'pay_at_counter', 'online', 'cash', 'bank_transfer'));
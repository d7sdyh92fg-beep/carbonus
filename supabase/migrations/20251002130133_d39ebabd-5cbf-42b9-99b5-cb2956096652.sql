-- Add column to store deposit pre-authorization payment intent
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS deposit_payment_intent_id text;
-- Add special pricing override fields to reservations
ALTER TABLE public.reservations
ADD COLUMN IF NOT EXISTS custom_rental_price numeric,
ADD COLUMN IF NOT EXISTS custom_deposit_amount numeric,
ADD COLUMN IF NOT EXISTS pricing_notes text;

-- Add corporate customer fields to customers table
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS is_corporate boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS company_code text,
ADD COLUMN IF NOT EXISTS vat_code text,
ADD COLUMN IF NOT EXISTS representative_name text,
ADD COLUMN IF NOT EXISTS representative_phone text,
ADD COLUMN IF NOT EXISTS representative_email text,
ADD COLUMN IF NOT EXISTS refund_account_number text;

-- Add soft delete for reservations (recycle bin feature)
ALTER TABLE public.reservations
ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES auth.users(id);

-- Create index for soft deleted reservations
CREATE INDEX IF NOT EXISTS idx_reservations_deleted_at ON public.reservations(deleted_at);

COMMENT ON COLUMN public.reservations.custom_rental_price IS 'Admin override for rental price (excludes deposit)';
COMMENT ON COLUMN public.reservations.custom_deposit_amount IS 'Admin override for deposit amount';
COMMENT ON COLUMN public.reservations.pricing_notes IS 'Notes about special pricing (discount reason, VIP, etc.)';
COMMENT ON COLUMN public.reservations.deleted_at IS 'Soft delete timestamp for recycle bin feature';
COMMENT ON COLUMN public.customers.refund_account_number IS 'Bank account number for deposit refunds';
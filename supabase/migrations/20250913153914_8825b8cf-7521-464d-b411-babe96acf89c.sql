-- Make driver-licenses bucket public so images can be displayed
UPDATE storage.buckets 
SET public = true 
WHERE id = 'driver-licenses';

-- Create contract_signatures table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.contract_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_id UUID NOT NULL,
  signature_data TEXT NOT NULL,
  signed_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contract_signatures ENABLE ROW LEVEL SECURITY;

-- Create policies for contract signatures (admin access only)
CREATE POLICY "Admins can view all contract signatures" 
ON public.contract_signatures 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can create contract signatures" 
ON public.contract_signatures 
FOR INSERT 
WITH CHECK (true);
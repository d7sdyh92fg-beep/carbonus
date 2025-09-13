-- Add new fields to reservations table for in-person transactions
ALTER TABLE public.reservations 
ADD COLUMN driver_license_url TEXT,
ADD COLUMN contract_signed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN contract_pdf_url TEXT,
ADD COLUMN payment_method TEXT DEFAULT 'online' CHECK (payment_method IN ('online', 'cash', 'card_reader')),
ADD COLUMN payment_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN notes TEXT;

-- Create contract_signatures table
CREATE TABLE public.contract_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_id UUID NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  signature_data TEXT NOT NULL,
  signed_by TEXT NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on contract_signatures table
ALTER TABLE public.contract_signatures ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contract_signatures
CREATE POLICY "Admin full access to contract signatures" 
ON public.contract_signatures 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage buckets for documents and photos
INSERT INTO storage.buckets (id, name, public) VALUES 
('driver-licenses', 'driver-licenses', false),
('contracts', 'contracts', false);

-- Create storage policies for driver licenses
CREATE POLICY "Admin can view driver licenses" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'driver-licenses' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can upload driver licenses" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'driver-licenses' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can update driver licenses" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'driver-licenses' AND has_role(auth.uid(), 'admin'::app_role));

-- Create storage policies for contracts
CREATE POLICY "Admin can view contracts" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'contracts' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can upload contracts" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'contracts' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can update contracts" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'contracts' AND has_role(auth.uid(), 'admin'::app_role));
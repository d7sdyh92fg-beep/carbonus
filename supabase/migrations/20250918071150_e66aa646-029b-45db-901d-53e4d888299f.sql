-- Create table for blocked availability dates
CREATE TABLE public.car_blocked_dates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id TEXT NOT NULL,
  blocked_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(car_id, blocked_date)
);

-- Enable Row Level Security
ALTER TABLE public.car_blocked_dates ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admin can manage blocked dates" 
ON public.car_blocked_dates 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for better performance
CREATE INDEX idx_car_blocked_dates_car_id ON public.car_blocked_dates(car_id);
CREATE INDEX idx_car_blocked_dates_date ON public.car_blocked_dates(blocked_date);
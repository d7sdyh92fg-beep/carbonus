-- Create customers table for reservation details
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reservations table
CREATE TABLE public.reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) NOT NULL,
  car_id TEXT NOT NULL,
  car_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  rental_days INTEGER NOT NULL,
  daily_rate DECIMAL(10,2) NOT NULL,
  total_rental_cost DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2) NOT NULL DEFAULT 300.00,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  stripe_payment_intent_id TEXT,
  cancellation_deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create function to calculate cancellation deadline
CREATE OR REPLACE FUNCTION calculate_cancellation_deadline()
RETURNS TRIGGER AS $$
BEGIN
  NEW.cancellation_deadline = NEW.start_date - INTERVAL '3 days';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for cancellation deadline
CREATE TRIGGER set_cancellation_deadline
  BEFORE INSERT OR UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION calculate_cancellation_deadline();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates on reservations
CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a booking system)
CREATE POLICY "Anyone can insert customers" ON public.customers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view customers" ON public.customers
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert reservations" ON public.reservations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view reservations" ON public.reservations
  FOR SELECT USING (true);

CREATE POLICY "Anyone can update reservations" ON public.reservations
  FOR UPDATE USING (true);
-- Create cars table for comprehensive car management
CREATE TABLE public.cars (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price_per_day DECIMAL NOT NULL,
  year INTEGER NOT NULL,
  passengers INTEGER NOT NULL,
  fuel TEXT NOT NULL,
  transmission TEXT NOT NULL,
  image_url TEXT,
  current_mileage INTEGER DEFAULT 0,
  health_status TEXT DEFAULT 'excellent' CHECK (health_status IN ('excellent', 'good', 'fair', 'needs_attention', 'maintenance_required')),
  last_service_date DATE,
  next_service_date DATE,
  service_interval_km INTEGER DEFAULT 10000,
  notes TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Cars are viewable by everyone" 
ON public.cars 
FOR SELECT 
USING (true);

CREATE POLICY "Admin full access to cars" 
ON public.cars 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create service records table
CREATE TABLE public.car_service_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id TEXT NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  service_date DATE NOT NULL,
  mileage_at_service INTEGER NOT NULL,
  service_type TEXT NOT NULL,
  description TEXT,
  cost DECIMAL,
  next_service_due_date DATE,
  next_service_due_mileage INTEGER,
  performed_by TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for service records
ALTER TABLE public.car_service_records ENABLE ROW LEVEL SECURITY;

-- Create policies for service records
CREATE POLICY "Admin can manage service records" 
ON public.car_service_records 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updating updated_at column
CREATE TRIGGER update_cars_updated_at
BEFORE UPDATE ON public.cars
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_car_service_records_updated_at
BEFORE UPDATE ON public.car_service_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial car data
INSERT INTO public.cars (id, name, category, price_per_day, year, passengers, fuel, transmission, current_mileage, health_status, last_service_date, next_service_date) VALUES
('1', 'BMW 3 series', 'Sedanas', 30, 2017, 5, 'Benzinas', 'Automatinė', 45000, 'good', '2024-01-15', '2024-07-15'),
('2', 'Chrysler Town & Country', 'Minivenas', 35, 2016, 7, 'Benzinas', 'Automatinė', 78000, 'fair', '2024-02-10', '2024-08-10'),
('3', 'VW Passat', 'Sedanas', 32, 2018, 5, 'Dyzelinas', 'Automatinė', 32000, 'excellent', '2024-03-05', '2024-09-05'),
('4', 'Kia Ceed SW', 'Universalas', 28, 2020, 5, 'Benzinas', 'Mechaninė', 25000, 'excellent', '2024-01-20', '2024-07-20'),
('5', 'Kia Ceed', 'Hečbekas', 26, 2019, 5, 'Benzinas', 'Mechaninė', 38000, 'good', '2024-02-28', '2024-08-28');
-- Insert existing car data into the cars table
INSERT INTO public.cars (
  id, name, category, price_per_day, year, passengers, fuel, transmission, 
  image_url, health_status, is_available, current_mileage, service_interval_km
) VALUES 
-- BMW 3 Series
('bmw-3-2017', 'BMW 3 series', 'Sedanas', 30.00, 2017, 5, 'Benzinas', 'Automatinė', 
 '/src/assets/bmw-3-clean.png', 'excellent', true, 85000, 10000),

-- Chrysler Town & Country
('chrysler-town-country', 'Chrysler Town & Country', 'Miniautobusas', 30.00, 2014, 7, 'Benzinas', 'Automatinė',
 '/src/assets/chrysler-town-country-side.png', 'good', true, 120000, 10000),

-- Volkswagen Passat
('vw-passat-2012', 'Volkswagen Passat', 'Sedanas', 30.00, 2012, 5, 'Dyzelinas', 'Mechaninė',
 '/src/assets/vw-passat-side-clean.png', 'good', true, 180000, 15000),

-- KIA CEED Universalas
('kia-ceed-wagon', 'KIA CEED', 'Universalas', 30.00, 2013, 5, 'Benzinas', 'Mechaninė',
 '/src/assets/kia-ceed-wagon-side.png', 'excellent', true, 95000, 10000),

-- KIA CEED Hečbekas
('kia-ceed-hatchback', 'KIA CEED', 'Hečbekas', 30.00, 2020, 5, 'Dyzelinas', 'Mechaninė',
 '/src/assets/kia-ceed-hatchback-side-gray-brown.png', 'excellent', true, 45000, 10000),

-- Audi RS5
('audi-rs5', 'Audi RS5', 'Sportinis', 75.00, 2019, 4, 'Benzinas', 'Automatinė',
 '/src/assets/audi-rs5.png', 'excellent', true, 35000, 10000)

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price_per_day = EXCLUDED.price_per_day,
  year = EXCLUDED.year,
  passengers = EXCLUDED.passengers,
  fuel = EXCLUDED.fuel,
  transmission = EXCLUDED.transmission,
  image_url = EXCLUDED.image_url,
  health_status = EXCLUDED.health_status,
  is_available = EXCLUDED.is_available,
  current_mileage = EXCLUDED.current_mileage,
  service_interval_km = EXCLUDED.service_interval_km,
  updated_at = now();
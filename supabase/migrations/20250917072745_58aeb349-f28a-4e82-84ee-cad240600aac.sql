-- Clear existing cars and insert all 5 cars from the original fleet
DELETE FROM public.cars;

INSERT INTO public.cars (
  id, name, category, price_per_day, year, passengers, fuel, transmission, 
  image_url, health_status, is_available, current_mileage, service_interval_km
) VALUES 
-- BMW 3 Series
('1', 'BMW 3 series', 'Sedanas', 30.00, 2017, 5, 'Benzinas', 'Automatinė', 
 'bmw3Clean', 'excellent', true, 85000, 10000),

-- Chrysler Town & Country
('2', 'Chrysler Town & Country', 'Miniautobusas', 30.00, 2014, 7, 'Benzinas', 'Automatinė',
 'chryslerTownCountrySide', 'good', true, 120000, 10000),

-- Volkswagen Passat
('3', 'Volkswagen Passat', 'Sedanas', 30.00, 2012, 5, 'Dyzelinas', 'Mechaninė',
 'vwPassatSideClean', 'good', true, 180000, 15000),

-- KIA CEED Universalas
('4', 'KIA CEED', 'Universalas', 30.00, 2013, 5, 'Benzinas', 'Mechaninė',
 'kiaCeedSideDarkGray', 'excellent', true, 95000, 10000),

-- KIA CEED Hečbekas
('5', 'KIA CEED', 'Hečbekas', 30.00, 2020, 5, 'Dyzelinas', 'Mechaninė',
 'kiaCeedHatchbackSideGrayBrown', 'excellent', true, 45000, 10000);
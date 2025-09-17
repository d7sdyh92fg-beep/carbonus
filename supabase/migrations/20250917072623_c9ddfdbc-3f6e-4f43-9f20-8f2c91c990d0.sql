-- Clean up cars table to only include the actual fleet cars
DELETE FROM public.cars WHERE id NOT IN ('1', '2', '3');

-- Update the existing cars to match the fleet exactly
UPDATE public.cars SET
  id = 'bmw-3-2017',
  name = 'BMW 3 series',
  category = 'Sedanas',
  price_per_day = 30.00,
  year = 2017,
  passengers = 5,
  fuel = 'Benzinas',
  transmission = 'Automatinė',
  image_url = '/src/assets/bmw-3-clean.png',
  health_status = 'excellent',
  is_available = true,
  current_mileage = 85000,
  service_interval_km = 10000,
  updated_at = now()
WHERE id = '1';

UPDATE public.cars SET
  id = 'chrysler-town-country',
  name = 'Chrysler Town & Country',
  category = 'Miniautobusas',
  price_per_day = 30.00,
  year = 2014,
  passengers = 7,
  fuel = 'Benzinas',
  transmission = 'Automatinė',
  image_url = '/src/assets/chrysler-town-country-side.png',
  health_status = 'good',
  is_available = true,
  current_mileage = 120000,
  service_interval_km = 10000,
  updated_at = now()
WHERE id = '2';

UPDATE public.cars SET
  id = 'vw-passat-2012',
  name = 'Volkswagen Passat',
  category = 'Sedanas',
  price_per_day = 30.00,
  year = 2012,
  passengers = 5,
  fuel = 'Dyzelinas',
  transmission = 'Mechaninė',
  image_url = '/src/assets/vw-passat-side-clean.png',
  health_status = 'good',
  is_available = true,
  current_mileage = 180000,
  service_interval_km = 15000,
  updated_at = now()
WHERE id = '3';
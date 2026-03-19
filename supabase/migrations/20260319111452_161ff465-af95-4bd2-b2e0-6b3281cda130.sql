-- Insert Mercedes-Benz SLK if not exists
INSERT INTO public.cars (id, name, category, price_per_day, fuel, transmission, year, passengers, is_premium, price_tier1, price_tier2, price_tier3, price_weekend, price_package_romantic, price_package_wedding)
VALUES ('6', 'Mercedes-Benz SLK', 'Kabrioletas', 90, 'Benzinas', 'Automatinė', 2015, 2, true, 110, 100, 90, 120, '70-90', '150-200')
ON CONFLICT (id) DO UPDATE SET
  is_premium = true,
  price_tier1 = 110,
  price_tier2 = 100,
  price_tier3 = 90,
  price_weekend = 120,
  price_package_romantic = '70-90',
  price_package_wedding = '150-200';

-- Set default pricing tiers for other cars (1-3 days: 50, 3-7 days: 40, 7+ days: 30)
UPDATE public.cars SET price_tier1 = 50, price_tier2 = 40, price_tier3 = 30 WHERE id != '6' AND price_tier1 IS NULL;
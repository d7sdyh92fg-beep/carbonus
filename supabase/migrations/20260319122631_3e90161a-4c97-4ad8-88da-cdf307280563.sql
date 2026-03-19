-- Insert Citroën SpaceTourer car
INSERT INTO cars (id, name, category, fuel, transmission, passengers, year, price_per_day, price_tier1, price_tier2, price_tier3, is_available, is_premium)
VALUES ('7', 'Citroën SpaceTourer', 'Vienatūris', 'Dyzelinas', 'Automatinė', 9, 2025, 80, 80, 70, 60, true, false);

-- Block dates until May 1st 2025 (car is reserved until then)
INSERT INTO car_blocked_dates (car_id, blocked_date, reason)
SELECT '7', d::date, 'Užrezervuotas iki gegužės 1 d.'
FROM generate_series('2025-03-19'::date, '2025-04-30'::date, '1 day'::interval) d;
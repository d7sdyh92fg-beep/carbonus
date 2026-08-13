DELETE FROM public.reservations r
USING public.customers c
WHERE r.customer_id = c.id
  AND c.email LIKE 'sec-test-%@example.invalid';

DELETE FROM public.customers
WHERE email LIKE 'sec-test-%@example.invalid';
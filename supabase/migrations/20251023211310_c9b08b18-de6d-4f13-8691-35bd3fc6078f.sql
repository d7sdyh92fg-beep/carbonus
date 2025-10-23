-- Create RPC function to insert reservations (bypasses RLS SELECT restriction)
create or replace function public.create_reservation(
  p_customer_id uuid,
  p_car_name text,
  p_car_id text,
  p_start_date date,
  p_end_date date,
  p_pickup_date date,
  p_pickup_time time without time zone,
  p_return_date date,
  p_return_time time without time zone,
  p_rental_days integer,
  p_daily_rate numeric,
  p_total_rental_cost numeric,
  p_deposit_amount numeric,
  p_total_amount numeric,
  p_status text,
  p_payment_method text,
  p_payment_provider text,
  p_pricing_notes text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reservation_id uuid;
begin
  insert into public.reservations (
    customer_id, car_name, car_id,
    start_date, end_date, pickup_date, pickup_time, return_date, return_time,
    rental_days, daily_rate, total_rental_cost, deposit_amount, total_amount,
    status, payment_method, payment_provider, pricing_notes
  ) values (
    p_customer_id, p_car_name, p_car_id,
    p_start_date, p_end_date, p_pickup_date, p_pickup_time, p_return_date, p_return_time,
    p_rental_days, p_daily_rate, p_total_rental_cost, coalesce(p_deposit_amount, 0), p_total_amount,
    coalesce(p_status, 'pending'), coalesce(p_payment_method, 'online'), coalesce(p_payment_provider, 'stripe'), p_pricing_notes
  )
  returning id into v_reservation_id;
  
  return v_reservation_id;
end
$$;

-- Grant execute permission to anon and authenticated users
grant execute on function public.create_reservation(
  uuid, text, text, date, date, date, time without time zone, date, time without time zone,
  integer, numeric, numeric, numeric, numeric, text, text, text, text
) to anon, authenticated;
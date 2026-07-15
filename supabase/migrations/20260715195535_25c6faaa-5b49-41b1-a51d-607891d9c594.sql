CREATE OR REPLACE FUNCTION public.create_reservation(
  p_customer_id uuid, p_car_name text, p_car_id text,
  p_start_date date, p_end_date date,
  p_pickup_date date, p_pickup_time time without time zone,
  p_return_date date, p_return_time time without time zone,
  p_rental_days integer, p_daily_rate numeric,
  p_total_rental_cost numeric, p_deposit_amount numeric, p_total_amount numeric,
  p_status text, p_payment_method text, p_payment_provider text,
  p_pricing_notes text, p_language text DEFAULT 'lt'::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  v_reservation_id uuid;
  v_conflict_count integer;
  v_blocked_count integer;
begin
  if p_start_date is null or p_end_date is null or p_end_date < p_start_date then
    raise exception 'Invalid reservation dates' using errcode = '22023';
  end if;

  select count(*) into v_conflict_count
  from public.reservations
  where car_id = p_car_id
    and deleted_at is null
    and status in ('paid','pending','requested','picked_up','awaiting_payment')
    and daterange(start_date, end_date, '[]') && daterange(p_start_date, p_end_date, '[]');

  if v_conflict_count > 0 then
    raise exception 'DATE_CONFLICT: Selected dates overlap an existing reservation'
      using errcode = 'P0001';
  end if;

  select count(*) into v_blocked_count
  from public.car_blocked_dates
  where car_id = p_car_id
    and blocked_date between p_start_date and p_end_date;

  if v_blocked_count > 0 then
    raise exception 'DATE_BLOCKED: Selected dates are blocked by admin'
      using errcode = 'P0001';
  end if;

  insert into public.reservations (
    customer_id, car_name, car_id,
    start_date, end_date, pickup_date, pickup_time, return_date, return_time,
    rental_days, daily_rate, total_rental_cost, deposit_amount, total_amount,
    status, payment_method, payment_provider, pricing_notes, language
  ) values (
    p_customer_id, p_car_name, p_car_id,
    p_start_date, p_end_date, p_pickup_date, p_pickup_time, p_return_date, p_return_time,
    p_rental_days, p_daily_rate, p_total_rental_cost, coalesce(p_deposit_amount, 0), p_total_amount,
    coalesce(p_status, 'pending'), coalesce(p_payment_method, 'online'),
    coalesce(p_payment_provider, 'stripe'),
    p_pricing_notes, coalesce(p_language, 'lt')
  )
  returning id into v_reservation_id;

  return v_reservation_id;
end
$function$;

CREATE OR REPLACE FUNCTION public.create_reservation(
  p_customer_id uuid, p_car_name text, p_car_id text,
  p_start_date date, p_end_date date,
  p_pickup_date date, p_pickup_time time without time zone,
  p_return_date date, p_return_time time without time zone,
  p_rental_days integer, p_daily_rate numeric,
  p_total_rental_cost numeric, p_deposit_amount numeric, p_total_amount numeric,
  p_status text, p_payment_method text, p_payment_provider text,
  p_pricing_notes text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  v_reservation_id uuid;
  v_conflict_count integer;
  v_blocked_count integer;
begin
  if p_start_date is null or p_end_date is null or p_end_date < p_start_date then
    raise exception 'Invalid reservation dates' using errcode = '22023';
  end if;

  select count(*) into v_conflict_count
  from public.reservations
  where car_id = p_car_id
    and deleted_at is null
    and status in ('paid','pending','requested','picked_up','awaiting_payment')
    and daterange(start_date, end_date, '[]') && daterange(p_start_date, p_end_date, '[]');

  if v_conflict_count > 0 then
    raise exception 'DATE_CONFLICT: Selected dates overlap an existing reservation'
      using errcode = 'P0001';
  end if;

  select count(*) into v_blocked_count
  from public.car_blocked_dates
  where car_id = p_car_id
    and blocked_date between p_start_date and p_end_date;

  if v_blocked_count > 0 then
    raise exception 'DATE_BLOCKED: Selected dates are blocked by admin'
      using errcode = 'P0001';
  end if;

  insert into public.reservations (
    customer_id, car_name, car_id,
    start_date, end_date, pickup_date, pickup_time, return_date, return_time,
    rental_days, daily_rate, total_rental_cost, deposit_amount, total_amount,
    status, payment_method, payment_provider, pricing_notes
  ) values (
    p_customer_id, p_car_name, p_car_id,
    p_start_date, p_end_date, p_pickup_date, p_pickup_time, p_return_date, p_return_time,
    p_rental_days, p_daily_rate, p_total_rental_cost, coalesce(p_deposit_amount, 0), p_total_amount,
    coalesce(p_status, 'pending'), coalesce(p_payment_method, 'online'),
    coalesce(p_payment_provider, 'stripe'), p_pricing_notes
  )
  returning id into v_reservation_id;

  return v_reservation_id;
end
$function$;

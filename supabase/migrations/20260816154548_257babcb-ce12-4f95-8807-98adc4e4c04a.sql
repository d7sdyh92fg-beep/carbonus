ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS deleted_by uuid;

CREATE INDEX IF NOT EXISTS customers_deleted_at_idx ON public.customers (deleted_at);
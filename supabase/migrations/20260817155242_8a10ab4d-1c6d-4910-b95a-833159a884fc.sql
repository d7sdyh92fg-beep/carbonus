CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.cron_auth (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  token uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.cron_auth TO service_role;

ALTER TABLE public.cron_auth ENABLE ROW LEVEL SECURITY;

INSERT INTO public.cron_auth (name) VALUES ('return-watchdog')
ON CONFLICT (name) DO NOTHING;
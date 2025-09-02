-- Enable real-time updates for reservations table
ALTER TABLE public.reservations REPLICA IDENTITY FULL;

-- Add reservations table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
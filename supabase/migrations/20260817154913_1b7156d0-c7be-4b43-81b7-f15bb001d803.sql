CREATE POLICY "Admins can read inspection photos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'inspections' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can upload inspection photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'inspections' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update inspection photos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'inspections' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete inspection photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'inspections' AND public.has_role(auth.uid(), 'admin'::public.app_role));
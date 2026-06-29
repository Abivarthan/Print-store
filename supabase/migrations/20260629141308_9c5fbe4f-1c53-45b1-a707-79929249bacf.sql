
-- Prepress status enum
CREATE TYPE public.artwork_status AS ENUM ('uploading', 'analyzing', 'ready', 'failed', 'review_needed');

CREATE TABLE public.artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  content_type TEXT NOT NULL,
  product_slug TEXT,
  status public.artwork_status NOT NULL DEFAULT 'uploading',
  width_px INT,
  height_px INT,
  dpi_estimate INT,
  color_profile TEXT,
  bleed_ok BOOLEAN,
  prepress_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX artworks_user_id_idx ON public.artworks(user_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.artworks TO authenticated;
GRANT ALL ON public.artworks TO service_role;

ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own artworks"
  ON public.artworks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own artworks"
  ON public.artworks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own artworks"
  ON public.artworks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own artworks"
  ON public.artworks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER artworks_set_updated_at
  BEFORE UPDATE ON public.artworks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Storage policies: users may only touch files inside their own user_id folder
CREATE POLICY "Users can view their own artwork files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'artworks' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can upload their own artwork files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'artworks' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own artwork files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'artworks' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own artwork files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'artworks' AND (storage.foldername(name))[1] = auth.uid()::text);

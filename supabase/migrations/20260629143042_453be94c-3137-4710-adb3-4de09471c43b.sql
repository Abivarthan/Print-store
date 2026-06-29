
-- =========================================================
-- ADDRESSES
-- =========================================================
CREATE TABLE public.addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'Home',
  contact_name text NOT NULL,
  contact_phone text NOT NULL,
  line1 text NOT NULL,
  line2 text,
  city text NOT NULL,
  state text NOT NULL,
  pincode text NOT NULL,
  country text NOT NULL DEFAULT 'IN',
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX addresses_user_idx ON public.addresses(user_id);
CREATE UNIQUE INDEX addresses_one_default_per_user
  ON public.addresses(user_id) WHERE is_default = true;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.addresses TO authenticated;
GRANT ALL ON public.addresses TO service_role;

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "addresses_select_own" ON public.addresses
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "addresses_insert_own" ON public.addresses
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "addresses_update_own" ON public.addresses
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "addresses_delete_own" ON public.addresses
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER addresses_set_updated_at
  BEFORE UPDATE ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Ensure only one default address per user
CREATE OR REPLACE FUNCTION public.addresses_enforce_single_default()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_default THEN
    UPDATE public.addresses
       SET is_default = false
     WHERE user_id = NEW.user_id
       AND id <> NEW.id
       AND is_default = true;
  END IF;
  RETURN NEW;
END $$;

REVOKE EXECUTE ON FUNCTION public.addresses_enforce_single_default() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER addresses_default_guard
  AFTER INSERT OR UPDATE OF is_default ON public.addresses
  FOR EACH ROW WHEN (NEW.is_default = true)
  EXECUTE FUNCTION public.addresses_enforce_single_default();

-- =========================================================
-- ORDER CHANGE REQUESTS
-- =========================================================
CREATE TYPE public.change_request_kind AS ENUM ('cancel', 'edit_address', 'edit_items', 'other');
CREATE TYPE public.change_request_status AS ENUM ('pending', 'approved', 'rejected', 'applied');

CREATE TABLE public.order_change_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind public.change_request_kind NOT NULL,
  status public.change_request_status NOT NULL DEFAULT 'pending',
  message text,
  payload jsonb,
  staff_note text,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ocr_order_idx ON public.order_change_requests(order_id);
CREATE INDEX ocr_user_idx ON public.order_change_requests(user_id);
CREATE INDEX ocr_status_idx ON public.order_change_requests(status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_change_requests TO authenticated;
GRANT ALL ON public.order_change_requests TO service_role;

ALTER TABLE public.order_change_requests ENABLE ROW LEVEL SECURITY;

-- Helper: is the order in a modifiable state and owned by the caller?
CREATE OR REPLACE FUNCTION public.order_is_modifiable_for(_order_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
      FROM public.orders
     WHERE id = _order_id
       AND user_id = _user_id
       AND status IN ('pending_payment','paid','in_prepress')
  )
$$;

REVOKE EXECUTE ON FUNCTION public.order_is_modifiable_for(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.order_is_modifiable_for(uuid, uuid) TO authenticated, service_role;

-- Customers: read own requests
CREATE POLICY "ocr_select_own" ON public.order_change_requests
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_staff(auth.uid()));

-- Customers: create request only on own + modifiable orders
CREATE POLICY "ocr_insert_own_modifiable" ON public.order_change_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND public.order_is_modifiable_for(order_id, auth.uid())
  );

-- Customers: can cancel (delete) their own still-pending request
CREATE POLICY "ocr_delete_own_pending" ON public.order_change_requests
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id AND status = 'pending');

-- Staff: full update; customers: no direct update
CREATE POLICY "ocr_update_staff" ON public.order_change_requests
  FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE TRIGGER ocr_set_updated_at
  BEFORE UPDATE ON public.order_change_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Realtime
ALTER TABLE public.order_change_requests REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_change_requests;

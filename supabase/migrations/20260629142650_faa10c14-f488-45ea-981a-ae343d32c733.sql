ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_status_events;
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.order_status_events REPLICA IDENTITY FULL;
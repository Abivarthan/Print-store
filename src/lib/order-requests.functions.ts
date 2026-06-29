import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const AddressPayload = z.object({
  line1: z.string().trim().min(2).max(120),
  line2: z.string().trim().max(120).optional().nullable(),
  city: z.string().trim().min(2).max(60),
  state: z.string().trim().min(2).max(60),
  pincode: z.string().regex(/^\d{6}$/),
  contact_name: z.string().trim().min(2).max(80).optional(),
  contact_phone: z.string().trim().min(8).max(20).optional(),
});

const ChangeRequestInput = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("cancel"),
    orderId: z.string().uuid(),
    message: z.string().trim().max(500).optional(),
  }),
  z.object({
    kind: z.literal("edit_address"),
    orderId: z.string().uuid(),
    message: z.string().trim().max(500).optional(),
    address: AddressPayload,
  }),
  z.object({
    kind: z.literal("edit_items"),
    orderId: z.string().uuid(),
    message: z.string().trim().min(2).max(1000),
  }),
  z.object({
    kind: z.literal("other"),
    orderId: z.string().uuid(),
    message: z.string().trim().min(2).max(1000),
  }),
]);

export const createChangeRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ChangeRequestInput.parse(d))
  .handler(async ({ data, context }) => {
    // RLS WITH CHECK enforces ownership + modifiable status. We still
    // pre-check so the user gets a clean error message.
    const { data: modifiable } = await context.supabase.rpc(
      "order_is_modifiable_for",
      { _order_id: data.orderId, _user_id: context.userId },
    );
    if (!modifiable) {
      throw new Error("This order can no longer be modified.");
    }

    // Block duplicate open cancel requests
    if (data.kind === "cancel") {
      const { data: existing } = await context.supabase
        .from("order_change_requests")
        .select("id")
        .eq("order_id", data.orderId)
        .eq("kind", "cancel")
        .eq("status", "pending")
        .maybeSingle();
      if (existing) throw new Error("A cancellation request is already pending.");
    }

    const payload =
      data.kind === "edit_address" ? { address: data.address } : null;

    const { data: inserted, error } = await context.supabase
      .from("order_change_requests")
      .insert({
        order_id: data.orderId,
        user_id: context.userId,
        kind: data.kind,
        status: "pending",
        message: "message" in data ? data.message ?? null : null,
        payload,
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return inserted;
  });

export const listOrderChangeRequests = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ orderId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("order_change_requests")
      .select("id, kind, status, message, payload, staff_note, resolved_at, created_at, updated_at")
      .eq("order_id", data.orderId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const listMyChangeRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("order_change_requests")
      .select("id, kind, status, message, staff_note, resolved_at, created_at, updated_at, order_id, orders!inner(order_number, status)")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Array<{
      id: string;
      kind: string;
      status: string;
      message: string | null;
      staff_note: string | null;
      resolved_at: string | null;
      created_at: string;
      updated_at: string;
      order_id: string;
      orders: { order_number: string; status: string };
    }>;
  });


export const cancelChangeRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("order_change_requests")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .eq("status", "pending");
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

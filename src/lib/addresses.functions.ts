import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const AddressInput = z.object({
  label: z.string().trim().min(1).max(40),
  contactName: z.string().trim().min(2).max(80),
  contactPhone: z.string().trim().min(8).max(20),
  line1: z.string().trim().min(2).max(120),
  line2: z.string().trim().max(120).optional().nullable(),
  city: z.string().trim().min(2).max(60),
  state: z.string().trim().min(2).max(60),
  pincode: z.string().regex(/^\d{6}$/, "Indian pincode must be 6 digits"),
  country: z.string().trim().min(2).max(2).default("IN"),
  isDefault: z.boolean().default(false),
});

function toRow(input: z.infer<typeof AddressInput>, userId: string) {
  return {
    user_id: userId,
    label: input.label,
    contact_name: input.contactName,
    contact_phone: input.contactPhone,
    line1: input.line1,
    line2: input.line2 ?? null,
    city: input.city,
    state: input.state,
    pincode: input.pincode,
    country: input.country ?? "IN",
    is_default: input.isDefault,
  };
}

export const listAddresses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("addresses")
      .select("*")
      .eq("user_id", context.userId)
      .order("is_default", { ascending: false })
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createAddress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => AddressInput.parse(d))
  .handler(async ({ data, context }) => {
    // If this is the user's first address, force default = true.
    const { count } = await context.supabase
      .from("addresses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", context.userId);
    const row = toRow(data, context.userId);
    if ((count ?? 0) === 0) row.is_default = true;

    const { data: inserted, error } = await context.supabase
      .from("addresses")
      .insert(row)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return inserted;
  });

export const updateAddress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    AddressInput.extend({ id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { id, ...rest } = data;
    const row = toRow(rest, context.userId);
    const { data: updated, error } = await context.supabase
      .from("addresses")
      .update(row)
      .eq("id", id)
      .eq("user_id", context.userId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return updated;
  });

export const deleteAddress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("addresses")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const setDefaultAddress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("addresses")
      .update({ is_default: true })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

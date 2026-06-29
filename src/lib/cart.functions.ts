import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ConfigSchema = z.object({
  size: z.string(),
  paper: z.string(),
  finish: z.string(),
  qty: z.number().int().positive(),
});

const AddInput = z.object({
  productSlug: z.string(),
  productName: z.string(),
  config: ConfigSchema,
  unitPaise: z.number().int().nonnegative(),
  subtotalPaise: z.number().int().nonnegative(),
  gstPaise: z.number().int().nonnegative(),
  totalPaise: z.number().int().nonnegative(),
  artworkId: z.string().uuid().nullable().optional(),
});

export const addToServerCart = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => AddInput.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("cart_items").insert({
      user_id: context.userId,
      product_slug: data.productSlug,
      product_name: data.productName,
      config: data.config,
      qty: data.config.qty,
      unit_paise: data.unitPaise,
      subtotal_paise: data.subtotalPaise,
      gst_paise: data.gstPaise,
      total_paise: data.totalPaise,
      artwork_id: data.artworkId ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const getServerCart = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", context.userId)
      .order("added_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  });

const RemoveInput = z.object({ id: z.string().uuid() });
export const removeFromServerCart = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RemoveInput.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("cart_items")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const clearServerCart = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("cart_items")
      .delete()
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

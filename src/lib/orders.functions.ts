import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const AddressSchema = z.object({
  line1: z.string().min(2),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().regex(/^\d{6}$/),
});

const CreateOrderInput = z.object({
  contactEmail: z.string().email(),
  contactPhone: z.string().min(8),
  shippingAddress: AddressSchema,
  couponCode: z.string().optional(),
  notes: z.string().optional(),
});

const GST_BPS = 1800; // 18% in basis points
const SHIPPING_PAISE = 19900; // ₹199 flat

export const validateCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ code: z.string(), subtotalPaise: z.number().int().nonnegative() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const code = data.code.trim().toUpperCase();
    const { data: c } = await context.supabase
      .from("coupons")
      .select("*")
      .eq("code", code)
      .eq("active", true)
      .maybeSingle();
    if (!c) return { ok: false as const, reason: "Coupon not found." };
    const now = new Date();
    if (c.starts_at && new Date(c.starts_at) > now) return { ok: false as const, reason: "Not active yet." };
    if (c.expires_at && new Date(c.expires_at) < now) return { ok: false as const, reason: "Expired." };
    if (c.usage_limit && c.usage_count >= c.usage_limit) return { ok: false as const, reason: "Usage limit reached." };
    if (data.subtotalPaise < c.min_subtotal_paise)
      return { ok: false as const, reason: `Min subtotal ₹${(c.min_subtotal_paise / 100).toFixed(0)} required.` };
    let discount = 0;
    if (c.kind === "percent" && c.percent_bps) {
      discount = Math.floor((data.subtotalPaise * c.percent_bps) / 10000);
      if (c.max_discount_paise) discount = Math.min(discount, c.max_discount_paise);
    } else if (c.kind === "flat" && c.value_paise) {
      discount = Math.min(c.value_paise, data.subtotalPaise);
    }
    return { ok: true as const, discountPaise: discount, code: c.code };
  });

export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CreateOrderInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: cartItems, error: cartErr } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", userId);
    if (cartErr) throw new Error(cartErr.message);
    if (!cartItems || cartItems.length === 0) throw new Error("Your cart is empty.");

    const subtotalPaise = cartItems.reduce((s, i) => s + i.subtotal_paise, 0);

    let discountPaise = 0;
    let couponCode: string | null = null;
    if (data.couponCode) {
      const code = data.couponCode.trim().toUpperCase();
      const { data: c } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code)
        .eq("active", true)
        .maybeSingle();
      if (c) {
        const now = new Date();
        const dateOk = (!c.starts_at || new Date(c.starts_at) <= now) && (!c.expires_at || new Date(c.expires_at) >= now);
        const limitOk = !c.usage_limit || c.usage_count < c.usage_limit;
        const minOk = subtotalPaise >= c.min_subtotal_paise;
        if (dateOk && limitOk && minOk) {
          if (c.kind === "percent" && c.percent_bps) {
            discountPaise = Math.floor((subtotalPaise * c.percent_bps) / 10000);
            if (c.max_discount_paise) discountPaise = Math.min(discountPaise, c.max_discount_paise);
          } else if (c.kind === "flat" && c.value_paise) {
            discountPaise = Math.min(c.value_paise, subtotalPaise);
          }
          couponCode = c.code;
        }
      }
    }

    const taxable = Math.max(0, subtotalPaise - discountPaise);
    const gstPaise = Math.round((taxable * GST_BPS) / 10000);
    const shippingPaise = subtotalPaise > 500000 ? 0 : SHIPPING_PAISE;
    const totalPaise = taxable + gstPaise + shippingPaise;

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        order_number: "",
        status: "pending_payment",
        subtotal_paise: subtotalPaise,
        discount_paise: discountPaise,
        gst_paise: gstPaise,
        shipping_paise: shippingPaise,
        total_paise: totalPaise,
        coupon_code: couponCode,
        shipping_address: data.shippingAddress,
        contact_email: data.contactEmail,
        contact_phone: data.contactPhone,
        notes: data.notes ?? null,
      })
      .select("*")
      .single();
    if (orderErr || !order) throw new Error(orderErr?.message ?? "Could not create order");

    const items = cartItems.map((ci) => ({
      order_id: order.id,
      product_slug: ci.product_slug,
      product_name: ci.product_name,
      config: ci.config,
      qty: ci.qty,
      unit_paise: ci.unit_paise,
      line_total_paise: ci.subtotal_paise,
      artwork_id: ci.artwork_id,
    }));
    const { error: itemsErr } = await supabase.from("order_items").insert(items);
    if (itemsErr) throw new Error(itemsErr.message);

    await supabase.from("cart_items").delete().eq("user_id", userId);

    if (couponCode) {
      // best-effort usage bump using service role (users have no UPDATE on coupons)
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: cur } = await supabaseAdmin
        .from("coupons")
        .select("usage_count")
        .eq("code", couponCode)
        .single();
      if (cur) {
        await supabaseAdmin
          .from("coupons")
          .update({ usage_count: cur.usage_count + 1 })
          .eq("code", couponCode);
      }
    }

    return { ok: true as const, orderId: order.id, orderNumber: order.order_number };
  });

export const getMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("orders")
      .select("id, order_number, status, total_paise, placed_at")
      .eq("user_id", context.userId)
      .order("placed_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  });

export const getMyOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: order, error } = await context.supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .single();
    if (error) throw new Error(error.message);
    return order;
  });

export const getMyOrderEvents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ orderId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    // Confirm ownership first via RLS-scoped select
    const { data: owned } = await context.supabase
      .from("orders")
      .select("id")
      .eq("id", data.orderId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!owned) throw new Error("Not found");
    const { data: events, error } = await context.supabase
      .from("order_status_events")
      .select("id, status, note, created_at")
      .eq("order_id", data.orderId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return events ?? [];
  });


import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertStaff(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", ctx.userId);
  if (error) throw new Error(error.message);
  const roles = (data ?? []).map((r: { role: string }) => r.role);
  if (!roles.includes("admin") && !roles.includes("staff")) throw new Error("Forbidden");
  return roles as string[];
}

export const getMyRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
    return (data ?? []).map((r: { role: string }) => r.role) as string[];
  });

// ---------------- Dashboard stats ----------------
export const getAdminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const since = new Date(Date.now() - 30 * 86400_000).toISOString();

    const [ordersRes, statusRes, itemsRes, customersRes] = await Promise.all([
      context.supabase
        .from("orders")
        .select("placed_at, total_paise, status")
        .gte("placed_at", since)
        .order("placed_at", { ascending: true }),
      context.supabase.from("orders").select("status"),
      context.supabase.from("order_items").select("product_slug, product_name, qty, line_total_paise"),
      context.supabase.from("profiles").select("id", { count: "exact", head: true }),
    ]);

    const orders = ordersRes.data ?? [];
    const totalRevenue = orders.reduce((s: number, o: any) => s + o.total_paise, 0);
    const totalOrders = orders.length;

    // group revenue by day
    const dayMap = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400_000).toISOString().slice(0, 10);
      dayMap.set(d, 0);
    }
    for (const o of orders) {
      const d = String(o.placed_at).slice(0, 10);
      dayMap.set(d, (dayMap.get(d) ?? 0) + o.total_paise);
    }
    const revenueSeries = Array.from(dayMap, ([day, paise]) => ({ day, rupees: Math.round(paise / 100) }));

    // status histogram
    const statusCounts: Record<string, number> = {};
    for (const r of statusRes.data ?? []) statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1;
    const statusSeries = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

    // top products
    const prodMap = new Map<string, { name: string; qty: number; revenue: number }>();
    for (const it of itemsRes.data ?? []) {
      const cur = prodMap.get(it.product_slug) ?? { name: it.product_name, qty: 0, revenue: 0 };
      cur.qty += it.qty;
      cur.revenue += it.line_total_paise;
      prodMap.set(it.product_slug, cur);
    }
    const topProducts = Array.from(prodMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      totalRevenuePaise: totalRevenue,
      totalOrders,
      customers: customersRes.count ?? 0,
      revenueSeries,
      statusSeries,
      topProducts,
    };
  });

// ---------------- Products ----------------
const ProductInput = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2),
  tagline: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  hero: z.string().optional().nullable(),
  categorySlug: z.string().nullable(),
  basePricePaise: z.number().int().nonnegative(),
  minQty: z.number().int().positive(),
  active: z.boolean(),
  sortOrder: z.number().int().default(0),
});

export const adminListProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const { data, error } = await context.supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data;
  });

export const adminUpsertProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ProductInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { error } = await context.supabase.from("products").upsert({
      slug: data.slug,
      name: data.name,
      tagline: data.tagline ?? null,
      description: data.description ?? null,
      hero: data.hero ?? null,
      category_slug: data.categorySlug,
      base_price_paise: data.basePricePaise,
      min_qty: data.minQty,
      active: data.active,
      sort_order: data.sortOrder,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminDeleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { error } = await context.supabase.from("products").delete().eq("slug", data.slug);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// ---------------- Coupons ----------------
const CouponInput = z.object({
  id: z.string().uuid().optional(),
  code: z.string().min(3).transform((s) => s.toUpperCase()),
  kind: z.enum(["percent", "flat"]),
  percentBps: z.number().int().nullable().optional(),
  valuePaise: z.number().int().nullable().optional(),
  minSubtotalPaise: z.number().int().nonnegative().default(0),
  maxDiscountPaise: z.number().int().nullable().optional(),
  startsAt: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  usageLimit: z.number().int().nullable().optional(),
  active: z.boolean(),
});

export const adminListCoupons = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const { data, error } = await context.supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  });

export const adminUpsertCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CouponInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const row = {
      ...(data.id ? { id: data.id } : {}),
      code: data.code,
      kind: data.kind,
      percent_bps: data.percentBps ?? null,
      value_paise: data.valuePaise ?? null,
      min_subtotal_paise: data.minSubtotalPaise,
      max_discount_paise: data.maxDiscountPaise ?? null,
      starts_at: data.startsAt || null,
      expires_at: data.expiresAt || null,
      usage_limit: data.usageLimit ?? null,
      active: data.active,
    };
    const { error } = await context.supabase.from("coupons").upsert(row);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminDeleteCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { error } = await context.supabase.from("coupons").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// ---------------- Orders ----------------
export const adminListOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const { data, error } = await context.supabase
      .from("orders")
      .select("*")
      .order("placed_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data;
  });

const StatusUpdate = z.object({
  id: z.string().uuid(),
  status: z.enum([
    "pending_payment",
    "paid",
    "in_prepress",
    "printing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ]),
  note: z.string().optional(),
});

export const adminUpdateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => StatusUpdate.parse(d))
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { error } = await context.supabase.from("orders").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    await context.supabase.from("order_status_events").insert({
      order_id: data.id,
      status: data.status,
      note: data.note ?? null,
      actor_user_id: context.userId,
    });
    return { ok: true as const };
  });

// ---------------- Roles ----------------
export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const roles = await assertStaff(context);
    if (!roles.includes("admin")) throw new Error("Forbidden");
    const { data: profiles, error } = await context.supabase
      .from("profiles")
      .select("id, email, display_name, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const { data: ur } = await context.supabase.from("user_roles").select("user_id, role");
    const map = new Map<string, string[]>();
    for (const r of ur ?? []) {
      const arr = map.get(r.user_id) ?? [];
      arr.push(r.role);
      map.set(r.user_id, arr);
    }
    return (profiles ?? []).map((p) => ({ ...p, roles: map.get(p.id) ?? [] }));
  });

const RoleMutation = z.object({
  userId: z.string().uuid(),
  role: z.enum(["admin", "staff", "customer"]),
});

export const adminGrantRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RoleMutation.parse(d))
  .handler(async ({ data, context }) => {
    const roles = await assertStaff(context);
    if (!roles.includes("admin")) throw new Error("Forbidden");
    const { error } = await context.supabase
      .from("user_roles")
      .insert({ user_id: data.userId, role: data.role });
    if (error && !error.message.includes("duplicate")) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminRevokeRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RoleMutation.parse(d))
  .handler(async ({ data, context }) => {
    const roles = await assertStaff(context);
    if (!roles.includes("admin")) throw new Error("Forbidden");
    if (data.userId === context.userId && data.role === "admin")
      throw new Error("You cannot remove your own admin role.");
    const { error } = await context.supabase
      .from("user_roles")
      .delete()
      .eq("user_id", data.userId)
      .eq("role", data.role);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

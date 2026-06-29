import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { MapPin } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { cart, useCart } from "@/lib/cart-store";
import { fmtINR } from "@/lib/catalog";
import { addToServerCart } from "@/lib/cart.functions";
import { createOrder, validateCoupon } from "@/lib/orders.functions";
import { listAddresses, createAddress } from "@/lib/addresses.functions";
import { useSession } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/checkout")({
  component: CheckoutPage,
});


function CheckoutPage() {
  const items = useCart((s) => s.items);
  const { user } = useSession();
  const navigate = useNavigate();
  const syncItem = useServerFn(addToServerCart);
  const place = useServerFn(createOrder);
  const checkCoupon = useServerFn(validateCoupon);
  const loadAddresses = useServerFn(listAddresses);
  const saveAddress = useServerFn(createAddress);

  const subtotal = items.reduce((a, i) => a + i.subtotal, 0);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  type Addr = Awaited<ReturnType<typeof loadAddresses>>[number];
  const [addresses, setAddresses] = useState<Addr[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [saveForLater, setSaveForLater] = useState(true);

  const [form, setForm] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    notes: "",
  });

  // Hydrate saved addresses; auto-pick default
  useEffect(() => {
    loadAddresses()
      .then((rows) => {
        setAddresses(rows);
        const def = rows.find((a) => a.is_default) ?? rows[0];
        if (def) {
          setSelectedAddressId(def.id);
          setSaveForLater(false);
          setForm((f) => ({
            ...f,
            line1: def.line1,
            line2: def.line2 ?? "",
            city: def.city,
            state: def.state,
            pincode: def.pincode,
            phone: def.contact_phone,
          }));
        }
      })
      .catch(() => {
        /* non-blocking */
      });
  }, [loadAddresses]);

  function pickAddress(id: string) {
    setSelectedAddressId(id);
    if (id === "") {
      setSaveForLater(true);
      setForm((f) => ({ ...f, line1: "", line2: "", city: "", state: "", pincode: "", phone: "" }));
      return;
    }
    const a = addresses.find((x) => x.id === id);
    if (!a) return;
    setSaveForLater(false);
    setForm((f) => ({
      ...f,
      line1: a.line1,
      line2: a.line2 ?? "",
      city: a.city,
      state: a.state,
      pincode: a.pincode,
      phone: a.contact_phone,
    }));
  }

  const taxable = Math.max(0, subtotal - discount);
  const gst = Math.round(taxable * 0.18);
  const shipping = subtotal > 5000 ? 0 : 199;
  const total = taxable + gst + shipping;


  async function applyCoupon() {
    setCouponMsg(null);
    if (!coupon.trim()) return;
    const res = await checkCoupon({ data: { code: coupon, subtotalPaise: subtotal * 100 } });
    if (res.ok) {
      setDiscount(Math.round(res.discountPaise / 100));
      setCouponMsg(`✓ ${res.code} applied`);
    } else {
      setDiscount(0);
      setCouponMsg(res.reason);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Cart is empty.");
      return;
    }
    if (!user?.email) {
      toast.error("Missing account email.");
      return;
    }
    setSubmitting(true);
    try {
      // Sync local cart → server cart so createOrder sees it
      for (const it of items) {
        await syncItem({
          data: {
            productSlug: it.slug,
            productName: it.name,
            config: it.config,
            unitPaise: Math.round(it.unit * 100),
            subtotalPaise: Math.round(it.subtotal * 100),
            gstPaise: Math.round(it.gst * 100),
            totalPaise: Math.round(it.total * 100),
          },
        });
      }
      const shippingAddress = {
        line1: form.line1,
        line2: form.line2 || undefined,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
      };

      // If using a new address and user opted in, save it to the book
      if (!selectedAddressId && saveForLater) {
        try {
          await saveAddress({
            data: {
              label: "Shipping",
              contactName: user.email.split("@")[0],
              contactPhone: form.phone,
              line1: form.line1,
              line2: form.line2 || null,
              city: form.city,
              state: form.state,
              pincode: form.pincode,
              country: "IN",
              isDefault: addresses.length === 0,
            },
          });
        } catch {
          /* non-blocking */
        }
      }

      const res = await place({
        data: {
          contactEmail: user.email,
          contactPhone: form.phone,
          shippingAddress,
          couponCode: coupon || undefined,
          notes: form.notes || undefined,
        },
      });

      cart.clear();
      toast.success(`Order ${res.orderNumber} placed!`);
      navigate({ to: "/orders" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not place order");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SiteLayout>
      <section className="max-w-6xl mx-auto px-6 pt-32 pb-24 grid lg:grid-cols-[1.4fr_1fr] gap-12">
        <div>
          <div className="text-xs uppercase tracking-widest text-gold">Checkout</div>
          <h1 className="font-display text-5xl mt-2">Finalise the press run.</h1>
          <p className="text-muted-foreground mt-2">Tax-inclusive. INR. GST invoice on dispatch.</p>

          <form onSubmit={submit} className="mt-10 space-y-6">
            {addresses.length > 0 && (
              <div className="rounded-2xl border border-border bg-card/40 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 text-gold" /> Ship to
                  </div>
                  <Link to="/addresses" className="text-xs text-gold hover:underline">
                    Manage
                  </Link>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {addresses.map((a) => {
                    const active = selectedAddressId === a.id;
                    return (
                      <button
                        type="button"
                        key={a.id}
                        onClick={() => pickAddress(a.id)}
                        className={`text-left rounded-xl border px-3 py-2.5 transition-colors ${
                          active
                            ? "border-gold/60 bg-gold/10"
                            : "border-border hover:border-gold/30"
                        }`}
                      >
                        <div className="text-xs font-medium flex items-center gap-1.5">
                          {a.label}
                          {a.is_default && (
                            <span className="text-[9px] uppercase tracking-widest text-gold">· default</span>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                          {a.line1}, {a.city} {a.pincode}
                        </div>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => pickAddress("")}
                    className={`text-left rounded-xl border px-3 py-2.5 transition-colors ${
                      selectedAddressId === ""
                        ? "border-gold/60 bg-gold/10"
                        : "border-dashed border-border hover:border-gold/30"
                    }`}
                  >
                    <div className="text-xs font-medium">+ Use a new address</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Fill the form below
                    </div>
                  </button>
                </div>
              </div>
            )}

            <Field label="Address line 1" required value={form.line1} onChange={(v) => setForm({ ...form, line1: v })} />
            <Field label="Address line 2" value={form.line2} onChange={(v) => setForm({ ...form, line2: v })} />

            <div className="grid grid-cols-2 gap-4">
              <Field label="City" required value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
              <Field label="State" required value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="PIN code"
                required
                value={form.pincode}
                onChange={(v) => setForm({ ...form, pincode: v })}
                pattern="\d{6}"
              />
              <Field label="Phone" required value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            </div>
            <Field label="Production notes (optional)" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />

            {!selectedAddressId && (
              <label className="flex items-center gap-2 text-xs text-muted-foreground select-none">
                <input
                  type="checkbox"
                  checked={saveForLater}
                  onChange={(e) => setSaveForLater(e.target.checked)}
                  className="accent-gold"
                />
                Save this address to my book for next time
              </label>
            )}



            <motion.button
              disabled={submitting || items.length === 0}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-full bg-gold text-ink font-medium disabled:opacity-40"
            >
              {submitting ? "Placing order…" : `Place order · ${fmtINR(total)}`}
            </motion.button>
          </form>
        </div>

        <aside className="rounded-3xl border border-border bg-card/40 p-6 h-fit lg:sticky lg:top-24">
          <h3 className="font-display text-2xl">Order summary</h3>
          <div className="mt-4 space-y-3 max-h-72 overflow-y-auto">
            {items.map((i) => (
              <div key={i.id} className="flex items-start justify-between text-sm gap-3">
                <div>
                  <div className="font-medium">{i.name}</div>
                  <div className="text-xs text-muted-foreground">{i.config.qty} units</div>
                </div>
                <div className="text-right">{fmtINR(i.subtotal)}</div>
              </div>
            ))}
            {items.length === 0 && <div className="text-sm text-muted-foreground">Cart is empty.</div>}
          </div>

          <div className="mt-6 flex gap-2">
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value.toUpperCase())}
              placeholder="Coupon code"
              className="flex-1 bg-transparent border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-gold/50"
            />
            <button
              type="button"
              onClick={applyCoupon}
              className="px-4 py-2 rounded-full border border-gold/40 text-gold text-sm hover:bg-gold/10"
            >
              Apply
            </button>
          </div>
          {couponMsg && <div className="text-xs mt-2 text-muted-foreground">{couponMsg}</div>}

          <div className="mt-6 space-y-2 text-sm border-t border-border pt-6">
            <Row label="Subtotal" value={fmtINR(subtotal)} />
            {discount > 0 && <Row label="Discount" value={`− ${fmtINR(discount)}`} accent />}
            <Row label="GST (18%)" value={fmtINR(gst)} muted />
            <Row label="Shipping" value={shipping === 0 ? "Free" : fmtINR(shipping)} muted />
            <div className="h-px bg-border my-2" />
            <Row label="Total" value={fmtINR(total)} bold />
          </div>
        </aside>
      </section>
    </SiteLayout>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  pattern,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  pattern?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        pattern={pattern}
        className="mt-1 w-full bg-transparent border-b border-border focus:border-gold/60 py-2 outline-none"
      />
    </label>
  );
}

function Row({
  label,
  value,
  bold,
  muted,
  accent,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between ${bold ? "text-base" : "text-sm"} ${
        muted ? "text-muted-foreground" : ""
      } ${accent ? "text-gold" : ""}`}
    >
      <span>{label}</span>
      <span className={bold ? "font-display text-xl" : ""}>{value}</span>
    </div>
  );
}

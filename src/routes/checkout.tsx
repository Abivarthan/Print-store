import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Lock } from "lucide-react";
import { useCartTotals, useStore } from "@/lib/store";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Metier" }], links: [{ rel: "canonical", href: "/checkout" }] }),
  component: Checkout,
});

function Checkout() {
  const { items, subtotal, shipping, tax, total } = useCartTotals();
  const { clearCart } = useStore();
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<"card" | "paypal">("card");
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h1 className="font-display text-3xl font-bold text-burgundy">Nothing to check out.</h1>
        <Link to="/shop" className="mt-6 inline-flex bg-burgundy text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-wine">Shop now</Link>
      </div>
    );
  }

  const placeOrder = (e: React.FormEvent) => {
    e.preventDefault();
    clearCart();
    navigate({ to: "/order-success" });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <Breadcrumbs items={[{ label: "Cart", to: "/cart" }, { label: "Checkout" }]} />
      <h1 className="font-display text-4xl md:text-5xl font-bold text-burgundy mb-4">Checkout</h1>

      <div className="flex items-center gap-2 mb-10 text-sm">
        {["Contact", "Shipping", "Payment"].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`size-7 rounded-full grid place-items-center text-xs font-bold ${step > i ? "bg-gold text-white" : step === i + 1 ? "bg-burgundy text-white" : "bg-burgundy/10 text-burgundy"}`}>
              {step > i ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
            </div>
            <span className={step === i + 1 ? "font-bold text-burgundy" : "text-ink/50"}>{label}</span>
            {i < 2 && <div className="w-8 h-px bg-burgundy/10 mx-2" />}
          </div>
        ))}
      </div>

      <form onSubmit={placeOrder} className="grid lg:grid-cols-[1fr_360px] gap-10">
        <div className="space-y-6">
          <Section title="Contact">
            <Grid>
              <Field label="Email" type="email" required />
              <Field label="Phone" type="tel" required />
            </Grid>
          </Section>
          <Section title="Shipping address">
            <Grid>
              <Field label="First name" required />
              <Field label="Last name" required />
              <Field label="Address" required full />
              <Field label="Apartment, suite (optional)" full />
              <Field label="City" required />
              <Field label="Postal code" required />
              <Field label="Country" required />
              <Field label="State / Region" />
            </Grid>
          </Section>
          <Section title="Payment method">
            <div className="grid sm:grid-cols-2 gap-3 mb-5">
              {(["card", "paypal"] as const).map((m) => (
                <button key={m} type="button" onClick={() => setMethod(m)}
                  className={`p-4 rounded-xl border text-left transition-colors ${method === m ? "border-burgundy bg-burgundy/5" : "border-burgundy/10 hover:border-burgundy/40"}`}>
                  <div className="font-display font-bold text-burgundy capitalize">{m === "card" ? "Credit card" : "PayPal"}</div>
                  <div className="text-xs text-ink/50 mt-1">{m === "card" ? "Visa · Mastercard · Amex" : "Redirect on submit"}</div>
                </button>
              ))}
            </div>
            {method === "card" && (
              <Grid>
                <Field label="Card number" placeholder="4242 4242 4242 4242" required full />
                <Field label="Expiry" placeholder="MM / YY" required />
                <Field label="CVC" required />
                <Field label="Name on card" required full />
              </Grid>
            )}
          </Section>
        </div>

        <aside className="bg-white rounded-2xl p-6 border border-burgundy/5 h-fit sticky top-28 space-y-4">
          <h3 className="font-display text-lg font-bold text-burgundy">Order</h3>
          <div className="space-y-3 text-sm max-h-64 overflow-auto">
            {items.map(({ item, product }) => (
              <div key={item.slug} className="flex gap-3">
                <div className="size-14 rounded-lg overflow-hidden bg-cream shrink-0"><img src={product.image} alt="" className="w-full h-full object-cover" /></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-burgundy truncate">{product.name}</div>
                  <div className="text-xs text-ink/50">Qty {item.qty}</div>
                </div>
                <div className="text-sm font-bold text-burgundy">${(item.qty * product.price).toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div className="border-t border-burgundy/10 pt-3 space-y-2 text-sm">
            <Row label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
            <Row label="Shipping" value={shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`} />
            <Row label="Tax" value={`$${tax.toFixed(2)}`} />
            <div className="flex justify-between font-bold text-lg text-burgundy pt-2 border-t border-burgundy/10">
              <span>Total</span><span>${total.toFixed(2)}</span>
            </div>
          </div>
          <button
            type="submit"
            onClick={() => setStep(3)}
            className="w-full flex items-center justify-center gap-2 bg-burgundy text-white py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-wine transition-colors"
          >
            <Lock className="h-4 w-4" /> Place order
          </button>
          <p className="text-[11px] text-ink/40 text-center">Demo checkout — no payment is processed.</p>
        </aside>
      </form>
    </div>
  );
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl p-6 border border-burgundy/5">
    <h2 className="font-display text-lg font-bold text-burgundy mb-5">{title}</h2>
    {children}
  </div>
);

const Grid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid sm:grid-cols-2 gap-4">{children}</div>
);

const Field = ({ label, full, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; full?: boolean }) => (
  <label className={`block ${full ? "sm:col-span-2" : ""}`}>
    <span className="text-xs font-bold uppercase tracking-widest text-ink/50 block mb-1.5">{label}</span>
    <input {...rest} className="w-full px-4 py-3 rounded-lg bg-cream border border-burgundy/10 focus:outline-none focus:border-burgundy transition-colors" />
  </label>
);

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between text-ink/70"><span>{label}</span><span>{value}</span></div>
);

import { AnimatePresence, motion } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cart, useCart } from "@/lib/cart-store";
import { fmtINR } from "@/lib/catalog";

export function CartDrawer() {
  const open = useCart((s) => s.open);
  const items = useCart((s) => s.items);
  const subtotal = items.reduce((a, i) => a + i.subtotal, 0);
  const gst = items.reduce((a, i) => a + i.gst, 0);
  const total = items.reduce((a, i) => a + i.total, 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-ink/70 backdrop-blur-sm"
            onClick={() => cart.close()}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="fixed top-0 right-0 bottom-0 z-[70] w-full sm:w-[440px] glass flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <div className="text-xs uppercase tracking-widest text-gold">Your order</div>
                <div className="font-display text-2xl mt-1">Cart</div>
              </div>
              <button onClick={() => cart.close()} className="p-2 rounded-full hover:bg-white/5" aria-label="Close cart">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 && (
                <div className="text-center py-20">
                  <div className="font-display text-3xl text-muted-foreground">Empty.</div>
                  <p className="text-sm text-muted-foreground mt-2">Press something into existence.</p>
                </div>
              )}
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    className="rounded-2xl border border-border p-4 bg-card/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-display text-lg leading-tight">{item.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {item.config.qty} × {item.config.paper} · {item.config.finish}
                        </div>
                      </div>
                      <button
                        onClick={() => cart.remove(item.id)}
                        className="p-1.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-white/5"
                        aria-label="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{fmtINR(item.unit)} / unit</span>
                      <span className="font-medium">{fmtINR(item.total)}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {items.length > 0 && (
              <div className="border-t border-border p-6 space-y-3">
                <Row label="Subtotal" value={fmtINR(subtotal)} />
                <Row label="GST (18%)" value={fmtINR(gst)} muted />
                <Row label="Total" value={fmtINR(total)} bold />
                <Link
                  to="/checkout"
                  onClick={() => cart.close()}
                  className="mt-4 w-full block text-center py-3 rounded-full bg-gold text-ink font-medium hover:bg-gold-soft transition-colors"
                >
                  Checkout
                </Link>
                <p className="text-[11px] text-center text-muted-foreground">
                  Free shipping above ₹2,000 · Dispatched in 4–6 days
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Row({ label, value, bold, muted }: { label: string; value: string; bold?: boolean; muted?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "text-base" : "text-sm"} ${muted ? "text-muted-foreground" : ""}`}>
      <span>{label}</span>
      <span className={bold ? "font-display text-xl" : ""}>{value}</span>
    </div>
  );
}

import { Link, useRouterState } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { ShoppingBag, Search, User as UserIcon, ShieldCheck } from "lucide-react";
import { cart, useCart } from "@/lib/cart-store";
import { useSession } from "@/lib/auth";
import { useRoles } from "@/lib/use-roles";

const links = [
  { to: "/shop", label: "Shop" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/about", label: "Atelier" },
  { to: "/contact", label: "Contact" },
];


export function Nav() {
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 80], ["oklch(0.08 0.005 80 / 0)", "oklch(0.08 0.005 80 / 0.85)"]);
  const border = useTransform(scrollY, [0, 80], ["oklch(1 0 0 / 0)", "oklch(1 0 0 / 0.08)"]);
  const count = useCart((s) => s.items.length);
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { session } = useSession();
  const { isStaff } = useRoles();

  return (
    <motion.header
      style={{ backgroundColor: bg, borderColor: border }}
      className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl border-b transition-colors"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div
            className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-gold-soft"
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
          <span className="font-display text-xl tracking-tight">Maison Presse</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = path === l.to || path.startsWith(l.to + "/");
            return (
              <Link
                key={l.to}
                to={l.to}
                className="relative px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-full bg-white/5"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative">{l.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          {isStaff && (
            <Link
              to="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 mr-1 rounded-full text-xs text-gold border border-gold/30 hover:bg-gold/10 transition-colors"
              aria-label="Admin"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </Link>
          )}
          <Link
            to={session ? "/artworks" : "/auth"}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            aria-label={session ? "My account" : "Sign in"}
          >
            <UserIcon className="w-4 h-4" />
          </Link>
          <button className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors" aria-label="Search">
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => cart.toggle()}
            className="relative p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            aria-label={`Cart with ${count} items`}
          >
            <ShoppingBag className="w-4 h-4" />
            {count > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-gold text-[10px] font-medium text-ink flex items-center justify-center"
              >
                {count}
              </motion.span>
            )}
          </button>
          <Link
            to="/shop"
            className="ml-2 hidden sm:inline-flex items-center px-4 py-2 rounded-full bg-gold text-ink text-sm font-medium hover:bg-gold-soft transition-colors"
          >
            Order
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

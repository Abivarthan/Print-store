import { createFileRoute, Outlet, Link, useRouterState, redirect } from "@tanstack/react-router";
import { LayoutDashboard, Package, Ticket, ScrollText, Users, ArrowLeft } from "lucide-react";
import { useRoles } from "@/lib/use-roles";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    // Auth is enforced by _authenticated layout; role check happens client-side below.
    return;
  },
  component: AdminShell,
});

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/coupons", label: "Coupons", icon: Ticket },
  { to: "/admin/orders", label: "Orders", icon: ScrollText },
  { to: "/admin/users", label: "Users & Roles", icon: Users },
];

function AdminShell() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { isStaff, isAdmin, loading } = useRoles();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Verifying access…
      </div>
    );
  }
  if (!isStaff) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display text-4xl">Access restricted</h1>
        <p className="text-muted-foreground max-w-md">
          The atelier panel is reserved for studio staff. Ask an admin to grant you access.
        </p>
        <Link to="/" className="inline-flex items-center gap-2 text-gold text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to the press
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-ink">
      <aside className="w-64 border-r border-border p-6 hidden md:flex flex-col gap-1 sticky top-0 h-screen">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold to-gold-soft" />
          <span className="font-display text-lg">Maison Atelier</span>
        </Link>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 px-3">
          {isAdmin ? "Admin" : "Staff"}
        </div>
        {items.map((i) => {
          const active = i.exact ? path === i.to : path === i.to || path.startsWith(i.to + "/");
          if (i.to === "/admin/users" && !isAdmin) return null;
          return (
            <Link
              key={i.to}
              to={i.to}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active ? "bg-gold/10 text-gold" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <i.icon className="w-4 h-4" />
              {i.label}
            </Link>
          );
        })}
        <div className="flex-1" />
        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground px-3">
          ← Back to storefront
        </Link>
      </aside>
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}

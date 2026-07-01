import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Heart, LogOut, Package, Settings, User } from "lucide-react";
import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Metier" }, { name: "robots", content: "noindex" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { wishlist } = useStore();
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", search: { redirect: "/dashboard" } });
  }, [loading, user, navigate]);

  if (!user) {
    return <div className="max-w-7xl mx-auto px-6 py-20 text-center text-ink/60">Loading…</div>;
  }

  const meta = (user.user_metadata ?? {}) as { full_name?: string; name?: string; avatar_url?: string };
  const displayName = meta.full_name || meta.name || user.email?.split("@")[0] || "Friend";
  const initials = displayName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between gap-4 mb-10 flex-wrap">
        <div className="flex items-center gap-4">
          {meta.avatar_url ? (
            <img src={meta.avatar_url} alt="" className="size-14 rounded-full object-cover" />
          ) : (
            <div className="size-14 rounded-full bg-burgundy text-white grid place-items-center font-display font-bold">{initials}</div>
          )}
          <div>
            <h1 className="font-display text-3xl font-bold text-burgundy">Welcome, {displayName.split(" ")[0]}</h1>
            <p className="text-ink/50 text-sm">{user.email}</p>
          </div>
        </div>
        <button
          onClick={async () => { await signOut(); navigate({ to: "/" }); }}
          className="inline-flex items-center gap-2 border border-burgundy/20 text-burgundy px-4 py-2 rounded-full text-sm font-bold hover:bg-burgundy/5"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Tile icon={Package} title="Orders" desc="View history" to="/my-orders" />
        <Tile icon={Heart} title="Wishlist" desc={`${wishlist.length} saved`} to="/wishlist" />
        <Tile icon={User} title="Account details" desc="Update address & contact" to="/dashboard" />
        <Tile icon={Settings} title="Preferences" desc="Notifications & privacy" to="/dashboard" />
      </div>

      <div className="mt-12 grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-burgundy/5">
          <h2 className="font-display text-lg font-bold text-burgundy mb-4">Recent activity</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between"><span className="text-ink/70">Signed in</span><span className="text-ink/40">just now</span></li>
            <li className="flex justify-between"><span className="text-ink/70">Wishlist synced</span><span className="text-ink/40">across devices</span></li>
          </ul>
        </div>
        <div className="bg-burgundy text-white rounded-2xl p-6 relative overflow-hidden">
          <p className="text-gold font-bold text-xs tracking-widest uppercase mb-2">Member perk</p>
          <h3 className="font-display text-xl font-bold">10% off your next stationery order.</h3>
          <p className="text-white/70 text-sm mt-2">Use code <span className="font-mono text-gold">METIER10</span> at checkout.</p>
          <div className="absolute -bottom-10 -right-10 size-48 bg-gold/10 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
}

function Tile({ icon: Icon, title, desc, to }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string; to: string }) {
  return (
    <Link to={to} className="bg-white rounded-2xl p-5 border border-burgundy/5 hover:shadow-lift transition-shadow">
      <div className="size-10 rounded-full bg-gold/10 text-gold grid place-items-center mb-3"><Icon className="h-4 w-4" /></div>
      <h3 className="font-display font-bold text-burgundy">{title}</h3>
      <p className="text-xs text-ink/50 mt-1">{desc}</p>
    </Link>
  );
}

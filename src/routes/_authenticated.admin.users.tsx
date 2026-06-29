import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Shield, ShieldCheck, ShieldOff } from "lucide-react";
import { adminListUsers, adminGrantRole, adminRevokeRole } from "@/lib/admin.functions";
import { useRoles } from "@/lib/use-roles";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: UsersAdmin,
});

type Row = Awaited<ReturnType<typeof adminListUsers>>[number];

function UsersAdmin() {
  const { isAdmin, loading } = useRoles();
  const list = useServerFn(adminListUsers);
  const grant = useServerFn(adminGrantRole);
  const revoke = useServerFn(adminRevokeRole);
  const [rows, setRows] = useState<Row[]>([]);

  async function refresh() {
    try {
      setRows((await list()) ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load users");
    }
  }
  useEffect(() => {
    if (!loading && isAdmin) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, isAdmin]);

  if (loading) return <div className="p-10 text-muted-foreground">Loading…</div>;
  if (!isAdmin) return <div className="p-10 text-muted-foreground">Admins only.</div>;

  async function toggle(userId: string, role: "admin" | "staff", has: boolean) {
    try {
      if (has) await revoke({ data: { userId, role } });
      else await grant({ data: { userId, role } });
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div className="p-10">
      <div className="text-xs uppercase tracking-widest text-gold">Atelier</div>
      <h1 className="font-display text-4xl mt-2">Users & Roles</h1>

      <div className="mt-8 rounded-2xl border border-border bg-card/40 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border">
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Roles</th>
              <th className="text-right p-4">Manage</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => {
              const hasAdmin = u.roles.includes("admin");
              const hasStaff = u.roles.includes("staff");
              return (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="p-4">{u.display_name ?? "—"}</td>
                  <td className="p-4 text-muted-foreground">{u.email}</td>
                  <td className="p-4">
                    <div className="flex gap-1.5 flex-wrap">
                      {u.roles.map((r) => (
                        <span key={r} className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-border">
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => toggle(u.id, "staff", hasStaff)}
                      className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full border border-border hover:border-gold/40 mr-2"
                    >
                      {hasStaff ? <ShieldOff className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                      {hasStaff ? "Revoke staff" : "Grant staff"}
                    </button>
                    <button
                      onClick={() => toggle(u.id, "admin", hasAdmin)}
                      className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full border border-gold/40 text-gold hover:bg-gold/10"
                    >
                      <ShieldCheck className="w-3 h-3" />
                      {hasAdmin ? "Revoke admin" : "Grant admin"}
                    </button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="p-12 text-center text-muted-foreground">
                  No users yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        Tip: the first signed-up user has no admin role. Use the database tool to grant yourself admin once.
      </p>
    </div>
  );
}

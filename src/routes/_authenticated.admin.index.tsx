import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import { getAdminStats } from "@/lib/admin.functions";
import { fmtINR } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

type Stats = Awaited<ReturnType<typeof getAdminStats>>;

function Dashboard() {
  const fn = useServerFn(getAdminStats);
  const [data, setData] = useState<Stats | null>(null);

  useEffect(() => {
    fn().then(setData).catch(() => setData(null));
  }, [fn]);

  return (
    <div className="p-10 max-w-7xl">
      <div className="text-xs uppercase tracking-widest text-gold">Atelier</div>
      <h1 className="font-display text-4xl mt-2">Dashboard</h1>
      <p className="text-muted-foreground mt-1 text-sm">Last 30 days of press activity.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <Stat label="Revenue (30d)" value={data ? fmtINR(data.totalRevenuePaise / 100) : "—"} />
        <Stat label="Orders (30d)" value={data ? String(data.totalOrders) : "—"} />
        <Stat label="Customers" value={data ? String(data.customers) : "—"} />
        <Stat
          label="Avg order"
          value={
            data && data.totalOrders > 0
              ? fmtINR(Math.round(data.totalRevenuePaise / data.totalOrders / 100))
              : "—"
          }
        />
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6 mt-8">
        <Panel title="Revenue trend">
          <div className="h-72">
            {data && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenueSeries}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.8 0.16 86)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="oklch(0.8 0.16 86)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="oklch(1 0 0 / 0.05)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: "oklch(0.6 0 0)", fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
                  <YAxis tick={{ fill: "oklch(0.6 0 0)", fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: "oklch(0.1 0.005 80)", border: "1px solid oklch(1 0 0 / 0.08)", borderRadius: 12 }}
                    formatter={(v: number) => fmtINR(v)}
                  />
                  <Area type="monotone" dataKey="rupees" stroke="oklch(0.8 0.16 86)" fill="url(#rev)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Panel>

        <Panel title="Orders by status">
          <div className="h-72">
            {data && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.statusSeries} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid stroke="oklch(1 0 0 / 0.05)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "oklch(0.6 0 0)", fontSize: 11 }} />
                  <YAxis dataKey="status" type="category" tick={{ fill: "oklch(0.7 0 0)", fontSize: 11 }} width={100} />
                  <Tooltip contentStyle={{ background: "oklch(0.1 0.005 80)", border: "1px solid oklch(1 0 0 / 0.08)", borderRadius: 12 }} />
                  <Bar dataKey="count" fill="oklch(0.8 0.16 86)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Panel>
      </div>

      <Panel title="Top products" className="mt-6">
        <div className="divide-y divide-border">
          {data?.topProducts.map((p, i) => (
            <motion.div
              key={p.name + i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between py-3 text-sm"
            >
              <div className="flex items-center gap-3">
                <span className="text-gold font-mono text-xs w-6">#{i + 1}</span>
                <span>{p.name}</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-muted-foreground text-xs">{p.qty} units</span>
                <span className="font-display">{fmtINR(p.revenue / 100)}</span>
              </div>
            </motion.div>
          ))}
          {data && data.topProducts.length === 0 && (
            <div className="text-sm text-muted-foreground py-6">No sales recorded yet.</div>
          )}
        </div>
      </Panel>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card/40 p-5">
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-display text-3xl mt-2">{value}</div>
    </div>
  );
}

function Panel({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-border bg-card/40 p-6 ${className}`}>
      <h2 className="font-display text-xl mb-4">{title}</h2>
      {children}
    </div>
  );
}

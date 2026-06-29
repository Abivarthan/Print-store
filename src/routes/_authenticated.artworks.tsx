import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, Loader2, FileText, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/Layout";
import { useSession, signOut } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/artworks")({
  head: () => ({
    meta: [
      { title: "My artwork — Maison Presse" },
      { name: "description", content: "Your uploaded artwork files with prepress check results." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ArtworksPage,
});

function ArtworksPage() {
  const { user } = useSession();
  const { data: rows, isLoading } = useQuery({
    queryKey: ["artworks", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artworks")
        .select("id, original_filename, content_type, status, width_px, height_px, dpi_estimate, prepress_notes, product_slug, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <SiteLayout>
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-32">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
          <div>
            <div className="text-xs uppercase tracking-widest text-gold mb-3">Your account</div>
            <h1 className="font-display text-5xl md:text-6xl leading-[0.95]">My artwork.</h1>
            <p className="mt-3 text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/shop" className="text-sm text-muted-foreground hover:text-foreground">+ New upload</Link>
            <button onClick={signOut} className="text-xs text-muted-foreground hover:text-foreground">Sign out</button>
          </div>
        </div>

        {isLoading && (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading your files…
          </div>
        )}

        {!isLoading && (!rows || rows.length === 0) && (
          <div className="rounded-3xl border border-dashed border-border p-16 text-center">
            <div className="font-display text-3xl text-muted-foreground">Nothing pressed yet.</div>
            <p className="text-sm text-muted-foreground mt-2">Upload artwork from any product page.</p>
            <Link to="/shop" className="inline-flex mt-6 px-6 py-3 rounded-full bg-gold text-ink text-sm font-medium hover:bg-gold-soft transition-colors">
              Browse catalogue
            </Link>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <AnimatePresence>
            {rows?.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl border border-border bg-card/40 p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/[0.03] flex items-center justify-center shrink-0">
                    {a.content_type?.includes("pdf") ? <FileText className="w-4 h-4 text-gold" /> : <ImageIcon className="w-4 h-4 text-gold" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-base truncate">{a.original_filename}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {a.width_px && a.height_px ? `${a.width_px}×${a.height_px} px` : "—"} · {a.dpi_estimate ? `${a.dpi_estimate} DPI` : "—"} · {a.product_slug ?? "no product"}
                    </div>
                  </div>
                  <StatusChip status={a.status} />
                </div>
                {Array.isArray(a.prepress_notes) && a.prepress_notes.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {(a.prepress_notes as Array<{ level: string; label: string }>).slice(0, 3).map((n, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        {n.level === "ok" && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        {n.level === "warn" && <AlertTriangle className="w-3 h-3 text-gold" />}
                        {n.level === "fail" && <XCircle className="w-3 h-3 text-red-400" />}
                        {n.label}
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>
    </SiteLayout>
  );
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { c: string; l: string }> = {
    ready: { c: "text-emerald-300 bg-emerald-300/10 border-emerald-300/20", l: "Ready" },
    review_needed: { c: "text-gold bg-gold/10 border-gold/20", l: "Review" },
    analyzing: { c: "text-muted-foreground bg-white/5 border-border", l: "…" },
    uploading: { c: "text-muted-foreground bg-white/5 border-border", l: "…" },
    failed: { c: "text-red-300 bg-red-300/10 border-red-300/20", l: "Failed" },
  };
  const m = map[status] ?? map.review_needed;
  return <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full border whitespace-nowrap ${m.c}`}>{m.l}</span>;
}

import { AnimatePresence, motion } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useRef, useState } from "react";
import { Upload, FileText, CheckCircle2, AlertTriangle, XCircle, Loader2, Image as ImageIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { analyzeArtwork, getArtworkSignedUrl } from "@/lib/artworks.functions";

type Note = { level: "ok" | "warn" | "fail"; label: string; detail?: string };

type State =
  | { kind: "idle" }
  | { kind: "auth" }
  | { kind: "uploading"; progress: number; filename: string }
  | { kind: "analyzing"; filename: string }
  | {
      kind: "done";
      filename: string;
      previewUrl: string | null;
      contentType: string;
      width: number | null;
      height: number | null;
      dpi: number | null;
      status: string;
      notes: Note[];
    }
  | { kind: "error"; message: string };

const ACCEPT = ".pdf,.png,.jpg,.jpeg,.tiff,.ai,.psd";
const MAX_SIZE = 50 * 1024 * 1024;

export function ArtworkUploader({
  productSlug,
  targetWidthIn,
  targetHeightIn,
}: {
  productSlug: string;
  targetWidthIn: number;
  targetHeightIn: number;
}) {
  const { session, loading } = useSession();
  const [state, setState] = useState<State>({ kind: "idle" });
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const analyze = useServerFn(analyzeArtwork);
  const signUrl = useServerFn(getArtworkSignedUrl);

  const handleFile = useCallback(
    async (file: File) => {
      if (!session?.user) {
        setState({ kind: "auth" });
        return;
      }
      if (file.size > MAX_SIZE) {
        setState({ kind: "error", message: `File too large. Max 50 MB.` });
        return;
      }

      const userId = session.user.id;
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${userId}/${crypto.randomUUID()}-${safe}`;

      setState({ kind: "uploading", progress: 10, filename: file.name });

      const { error: upErr } = await supabase.storage
        .from("artworks")
        .upload(path, file, { contentType: file.type || "application/octet-stream", upsert: false });
      if (upErr) {
        setState({ kind: "error", message: upErr.message });
        return;
      }

      setState({ kind: "uploading", progress: 60, filename: file.name });

      const { data: row, error: insErr } = await supabase
        .from("artworks")
        .insert({
          user_id: userId,
          storage_path: path,
          original_filename: file.name,
          file_size: file.size,
          content_type: file.type || "application/octet-stream",
          product_slug: productSlug,
          status: "uploading",
        })
        .select("id")
        .single();
      if (insErr || !row) {
        setState({ kind: "error", message: insErr?.message ?? "Could not create artwork record" });
        return;
      }

      setState({ kind: "analyzing", filename: file.name });

      try {
        const [result, signed] = await Promise.all([
          analyze({ data: { artworkId: row.id, targetWidthIn, targetHeightIn, bleedIn: 0.125 } }),
          signUrl({ data: { artworkId: row.id } }),
        ]);
        const isImage = /image\/(png|jpeg|jpg|webp)/.test(signed.contentType);
        setState({
          kind: "done",
          filename: file.name,
          previewUrl: isImage ? signed.url : null,
          contentType: signed.contentType,
          width: "width" in result ? (result.width ?? null) : null,
          height: "height" in result ? (result.height ?? null) : null,
          dpi: "dpi" in result ? (result.dpi ?? null) : null,
          status: result.ok ? result.status : "failed",
          notes: (result.notes ?? []) as Note[],
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Analysis failed";
        setState({ kind: "error", message });
      }
    },
    [analyze, signUrl, session, productSlug, targetHeightIn, targetWidthIn],
  );

  if (loading) {
    return <div className="px-4 py-4 rounded-xl border border-dashed border-border text-sm text-muted-foreground">Checking sign-in…</div>;
  }

  return (
    <div>
      <AnimatePresence mode="wait">
        {state.kind === "idle" || state.kind === "auth" ? (
          <motion.div
            key="drop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              const f = e.dataTransfer.files?.[0];
              if (f) handleFile(f);
            }}
            className={`relative rounded-2xl border border-dashed transition-colors ${
              drag ? "border-gold bg-gold/5" : "border-border hover:border-gold/40"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            <button
              type="button"
              onClick={() => (session ? inputRef.current?.click() : setState({ kind: "auth" }))}
              className="w-full px-5 py-5 flex items-center gap-4 text-left"
            >
              <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                <Upload className="w-4 h-4 text-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm">Upload your artwork</div>
                <div className="text-xs text-muted-foreground">PDF, AI, PSD, PNG, JPEG · drag & drop or browse</div>
              </div>
              <span className="hidden sm:inline text-xs text-muted-foreground">≤ 50 MB</span>
            </button>
            {state.kind === "auth" && (
              <div className="px-5 pb-5 -mt-2 text-xs text-muted-foreground">
                Please{" "}
                <Link to="/auth" search={{ next: window.location.pathname }} className="text-gold underline-offset-2 hover:underline">
                  sign in
                </Link>{" "}
                to upload artwork.
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key={state.kind}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl border border-border bg-card/60 overflow-hidden"
          >
            {state.kind === "uploading" && <UploadingView filename={state.filename} progress={state.progress} />}
            {state.kind === "analyzing" && <AnalyzingView filename={state.filename} />}
            {state.kind === "done" && <PrepressPreview {...state} onReset={() => setState({ kind: "idle" })} />}
            {state.kind === "error" && <ErrorView message={state.message} onReset={() => setState({ kind: "idle" })} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UploadingView({ filename, progress }: { filename: string; progress: number }) {
  return (
    <div className="p-5">
      <div className="flex items-center gap-3">
        <Loader2 className="w-4 h-4 text-gold animate-spin" />
        <div className="text-sm truncate flex-1">{filename}</div>
        <span className="text-xs text-muted-foreground">Uploading…</span>
      </div>
      <div className="mt-3 h-1 rounded-full bg-white/5 overflow-hidden">
        <motion.div className="h-full bg-gold" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function AnalyzingView({ filename }: { filename: string }) {
  return (
    <div className="p-5">
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full"
        />
        <div className="text-sm truncate flex-1">{filename}</div>
        <span className="text-xs text-gold">Prepress check…</span>
      </div>
      <div className="mt-3 text-xs text-muted-foreground">Checking resolution, bleed, color profile, and dimensions.</div>
    </div>
  );
}

function PrepressPreview({
  filename,
  previewUrl,
  contentType,
  width,
  height,
  dpi,
  status,
  notes,
  onReset,
}: {
  filename: string;
  previewUrl: string | null;
  contentType: string;
  width: number | null;
  height: number | null;
  dpi: number | null;
  status: string;
  notes: Note[];
  onReset: () => void;
}) {
  const StatusBadge = () => {
    const map = {
      ready: { c: "text-emerald-300 bg-emerald-300/10 border-emerald-300/20", l: "Press ready" },
      review_needed: { c: "text-gold bg-gold/10 border-gold/20", l: "Review needed" },
      failed: { c: "text-red-300 bg-red-300/10 border-red-300/20", l: "Failed" },
    } as const;
    const m = map[status as keyof typeof map] ?? map.review_needed;
    return <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full border ${m.c}`}>{m.l}</span>;
  };

  return (
    <div>
      <div className="grid sm:grid-cols-[140px_1fr] gap-0">
        <div className="aspect-square sm:aspect-auto sm:h-full bg-ink relative overflow-hidden flex items-center justify-center">
          {previewUrl ? (
            <motion.img
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              src={previewUrl}
              alt={filename}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-muted-foreground flex flex-col items-center gap-2 text-xs p-4 text-center">
              {contentType.includes("pdf") ? <FileText className="w-8 h-8 text-gold/60" /> : <ImageIcon className="w-8 h-8 text-gold/60" />}
              {contentType.split("/").pop()?.toUpperCase()}
            </div>
          )}
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Prepress preview</div>
              <div className="font-display text-lg truncate">{filename}</div>
            </div>
            <StatusBadge />
          </div>

          <dl className="mt-4 grid grid-cols-3 gap-3 text-xs">
            <Stat label="Dimensions" value={width && height ? `${width} × ${height} px` : "—"} />
            <Stat label="DPI" value={dpi ? `${dpi}` : "—"} highlight={dpi !== null && dpi >= 300} />
            <Stat label="Format" value={contentType.split("/").pop()?.toUpperCase() ?? "—"} />
          </dl>

          <ul className="mt-4 space-y-1.5">
            {notes.map((n, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-2 text-xs"
              >
                {n.level === "ok" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />}
                {n.level === "warn" && <AlertTriangle className="w-3.5 h-3.5 text-gold mt-0.5 shrink-0" />}
                {n.level === "fail" && <XCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />}
                <span>
                  <span className="text-foreground">{n.label}</span>
                  {n.detail && <span className="text-muted-foreground"> — {n.detail}</span>}
                </span>
              </motion.li>
            ))}
          </ul>

          <div className="mt-4 flex items-center gap-3">
            <button onClick={onReset} className="text-xs text-muted-foreground hover:text-foreground">
              Replace file
            </button>
            <Link to="/artworks" className="text-xs text-gold hover:underline underline-offset-2">
              View all uploads →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorView({ message, onReset }: { message: string; onReset: () => void }) {
  return (
    <div className="p-5 flex items-start gap-3">
      <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
      <div className="flex-1 text-sm">
        <div>Upload failed</div>
        <div className="text-xs text-muted-foreground mt-1">{message}</div>
        <button onClick={onReset} className="mt-3 text-xs text-gold hover:underline underline-offset-2">
          Try again
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-lg bg-white/[0.02] border border-border p-2.5">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-0.5 font-display text-base ${highlight ? "text-gold" : ""}`}>{value}</div>
    </div>
  );
}

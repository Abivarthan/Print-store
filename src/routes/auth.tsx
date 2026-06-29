import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { SiteLayout } from "@/components/site/Layout";

const search = z.object({ next: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Sign in — Maison Presse" },
      { name: "description", content: "Sign in to upload artwork, track orders, and reorder past pieces." },
      { name: "robots", content: "noindex" },
    ],
  }),
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/artworks" });
  },
  component: AuthPage,
});

function AuthPage() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const fn = mode === "signin" ? supabase.auth.signInWithPassword : supabase.auth.signUp;
      const { error } = await fn.call(supabase.auth, {
        email,
        password,
        ...(mode === "signup" ? { options: { emailRedirectTo: window.location.origin } } : {}),
      });
      if (error) throw error;
      navigate({ to: next ?? "/artworks" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setBusy(true);
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      setError(result.error.message);
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: next ?? "/artworks" });
  }

  return (
    <SiteLayout>
      <section className="max-w-md mx-auto px-6 pt-24 pb-32">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-xs uppercase tracking-widest text-gold mb-3">{mode === "signin" ? "Welcome back" : "Create account"}</div>
          <h1 className="font-display text-5xl leading-tight">
            {mode === "signin" ? "Sign in to the press." : "Open an account."}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Upload artwork, track orders, and reorder past pieces.
          </p>

          <button
            onClick={google}
            disabled={busy}
            className="mt-10 w-full py-3 rounded-full border border-border hover:bg-white/5 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden>
              <path fill="#EA4335" d="M12 5c1.6 0 3 .5 4.2 1.5l3.1-3.1C17.5 1.7 14.9.7 12 .7 7.4.7 3.4 3.3 1.4 7.1l3.6 2.8C5.9 7 8.7 5 12 5z" />
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5c-.3 1.6-1.2 2.9-2.6 3.8l3.5 2.7c2.1-1.9 3.3-4.7 3.3-8.6z" />
              <path fill="#FBBC04" d="M5 14.1c-.2-.6-.3-1.3-.3-2.1s.1-1.4.3-2L1.4 7.1C.5 8.6 0 10.3 0 12c0 1.7.5 3.4 1.4 4.9L5 14.1z" />
              <path fill="#34A853" d="M12 23.3c3.2 0 5.9-1.1 7.9-2.9l-3.5-2.7c-1 .7-2.3 1.1-4.4 1.1-3.3 0-6.1-2.2-7.1-5.2L1.4 16.9C3.4 20.7 7.4 23.3 12 23.3z" />
            </svg>
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
            <div className="flex-1 h-px bg-border" /> or <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Field label="Email" type="email" value={email} onChange={setEmail} />
            <Field label="Password" type="password" value={password} onChange={setPassword} />
            {error && <div className="text-xs text-red-400">{error}</div>}
            <button
              disabled={busy}
              className="w-full py-3 rounded-full bg-gold text-ink font-medium hover:bg-gold-soft transition-colors disabled:opacity-50"
            >
              {busy ? "…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="mt-6 text-xs text-muted-foreground">
            {mode === "signin" ? "New here? " : "Have an account? "}
            <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-gold hover:underline">
              {mode === "signin" ? "Create one" : "Sign in"}
            </button>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">← Back to shop</Link>
          </div>
        </motion.div>
      </section>
    </SiteLayout>
  );
}

function Field({ label, type, value, onChange }: { label: string; type: string; value: string; onChange: (s: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <input
        required
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full bg-transparent border-b border-border focus:border-gold outline-none py-2 text-sm transition-colors"
      />
    </label>
  );
}

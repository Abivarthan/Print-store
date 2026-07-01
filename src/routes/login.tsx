import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth";

type Search = { redirect?: string };

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Metier" }, { name: "robots", content: "noindex" }] }),
  validateSearch: (search: Record<string, unknown>): Search => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: Login,
});

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/login" });
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const dest = redirect && redirect.startsWith("/") ? redirect : "/dashboard";
      navigate({ to: dest });
    }
  }, [user, redirect, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Welcome back");
  };

  const google = async () => {
    setBusy(true);
    const redirectUri = `${window.location.origin}${redirect && redirect.startsWith("/") ? redirect : "/dashboard"}`;
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: redirectUri });
    setBusy(false);
    if (res?.error) toast.error(res.error.message ?? "Google sign-in failed");
  };

  return (
    <div className="min-h-[70vh] grid place-items-center px-6 py-16">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-burgundy/5 bento-drop">
        <div className="text-center mb-6">
          <p className="text-gold font-bold text-xs tracking-widest uppercase mb-2">Welcome back</p>
          <h1 className="font-display text-3xl font-bold text-burgundy">Sign in</h1>
        </div>

        <button
          type="button"
          onClick={google}
          disabled={busy}
          className="w-full flex items-center justify-center gap-3 border border-burgundy/15 py-3 rounded-full font-semibold text-sm hover:bg-cream transition-colors disabled:opacity-50"
        >
          <GoogleIcon /> Continue with Google
        </button>

        <div className="flex items-center gap-3 my-5 text-[10px] uppercase tracking-widest text-ink/40">
          <div className="flex-1 h-px bg-burgundy/10" /> or <div className="flex-1 h-px bg-burgundy/10" />
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-ink/50 block mb-1.5">Email</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-cream border border-burgundy/10 focus:outline-none focus:border-burgundy" />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-ink/50 block mb-1.5">Password</span>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-cream border border-burgundy/10 focus:outline-none focus:border-burgundy" />
          </label>
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-ink/60"><input type="checkbox" className="accent-burgundy" /> Remember me</label>
            <Link to="/forgot-password" className="text-burgundy underline underline-offset-4">Forgot?</Link>
          </div>
          <button type="submit" disabled={busy} className="w-full bg-burgundy text-white py-3.5 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-wine disabled:opacity-60">
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="text-center text-sm text-ink/60 mt-6">
          No account yet? <Link to="/register" className="text-burgundy underline underline-offset-4 font-bold">Create one</Link>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C33.6 6.1 29.1 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C33.6 6.1 29.1 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5 0 9.6-1.9 13.1-5l-6.1-5c-2 1.4-4.4 2.2-7 2.2-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.6 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.5l6.1 5C40.9 35.6 44 30.3 44 24c0-1.3-.1-2.4-.4-3.5z"/>
    </svg>
  );
}

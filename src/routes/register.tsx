import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — Metier" }, { name: "robots", content: "noindex" }] }),
  component: Register,
});

function Register() {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => { if (user) navigate({ to: "/dashboard" }); }, [user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const full_name = `${first} ${last}`.trim();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name },
      },
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Account created — check your inbox to confirm.");
  };

  const google = async () => {
    setBusy(true);
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/dashboard`,
    });
    setBusy(false);
    if (res?.error) toast.error(res.error.message ?? "Google sign-in failed");
  };

  return (
    <div className="min-h-[70vh] grid place-items-center px-6 py-16">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-burgundy/5 bento-drop">
        <div className="text-center mb-6">
          <p className="text-gold font-bold text-xs tracking-widest uppercase mb-2">Join the atelier</p>
          <h1 className="font-display text-3xl font-bold text-burgundy">Create account</h1>
        </div>

        <button
          type="button"
          onClick={google}
          disabled={busy}
          className="w-full flex items-center justify-center gap-3 border border-burgundy/15 py-3 rounded-full font-semibold text-sm hover:bg-cream transition-colors disabled:opacity-50"
        >
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-5 text-[10px] uppercase tracking-widest text-ink/40">
          <div className="flex-1 h-px bg-burgundy/10" /> or <div className="flex-1 h-px bg-burgundy/10" />
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name" required value={first} onChange={(e) => setFirst(e.currentTarget.value)} />
            <Field label="Last name" required value={last} onChange={(e) => setLast(e.currentTarget.value)} />
          </div>
          <Field label="Email" type="email" required value={email} onChange={(e) => setEmail(e.currentTarget.value)} />
          <Field label="Password" type="password" required value={password} onChange={(e) => setPassword(e.currentTarget.value)} />
          <button type="submit" disabled={busy} className="w-full bg-burgundy text-white py-3.5 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-wine disabled:opacity-60">
            {busy ? "Creating…" : "Create account"}
          </button>
        </form>
        <p className="text-center text-sm text-ink/60 mt-6">
          Already have one? <Link to="/login" className="text-burgundy underline underline-offset-4 font-bold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-widest text-ink/50 block mb-1.5">{label}</span>
      <input {...rest} className="w-full px-4 py-3 rounded-lg bg-cream border border-burgundy/10 focus:outline-none focus:border-burgundy" />
    </label>
  );
}

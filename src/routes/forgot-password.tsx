import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — Metier" }, { name: "robots", content: "noindex" }] }),
  component: Forgot,
});

function Forgot() {
  const [sent, setSent] = useState(false);
  return (
    <div className="min-h-[70vh] grid place-items-center px-6 py-16">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-burgundy/5 bento-drop">
        <div className="text-center mb-6">
          <p className="text-gold font-bold text-xs tracking-widest uppercase mb-2">Reset password</p>
          <h1 className="font-display text-3xl font-bold text-burgundy">Forgot it happens.</h1>
        </div>
        {sent ? (
          <p className="text-center text-sm text-ink/70">Check your inbox — a reset link is on its way.</p>
        ) : (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-ink/50 block mb-1.5">Email</span>
              <input type="email" required className="w-full px-4 py-3 rounded-lg bg-cream border border-burgundy/10 focus:outline-none focus:border-burgundy" />
            </label>
            <button type="submit" className="w-full bg-burgundy text-white py-3.5 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-wine">Send reset link</button>
          </form>
        )}
        <p className="text-center text-sm text-ink/60 mt-6">
          Remembered it? <Link to="/login" className="text-burgundy underline underline-offset-4 font-bold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

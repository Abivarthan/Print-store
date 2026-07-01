import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/quote")({
  head: () => ({
    meta: [
      { title: "Request a quote — Metier" },
      { name: "description", content: "Custom print quote for high-volume or bespoke projects." },
      { property: "og:title", content: "Request a quote — Metier" },
      { property: "og:url", content: "/quote" },
    ],
    links: [{ rel: "canonical", href: "/quote" }],
  }),
  component: Quote,
});

function Quote() {
  const [sent, setSent] = useState(false);
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <p className="text-gold font-bold text-xs tracking-widest uppercase mb-3">Bespoke quote</p>
      <h1 className="font-display text-4xl md:text-5xl font-bold text-burgundy leading-tight">Tell us about the piece.</h1>
      <p className="text-ink/60 mt-3 max-w-xl">Every quote is reviewed by a production specialist. Response within one business day.</p>

      <form
        onSubmit={(e) => { e.preventDefault(); setSent(true); }}
        className="mt-10 bg-white rounded-3xl p-8 border border-burgundy/5 bento-drop"
      >
        {sent ? (
          <div className="text-center py-16">
            <p className="text-gold font-bold text-xs tracking-widest uppercase mb-3">Received</p>
            <h2 className="font-display text-3xl font-bold text-burgundy">On it.</h2>
            <p className="text-ink/60 mt-3">Your quote request is with our team. Expect a personal reply shortly.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Your name" required />
            <Field label="Email" type="email" required />
            <Field label="Company" />
            <Field label="Product type" placeholder="e.g. business cards, packaging" required />
            <Field label="Quantity" type="number" required />
            <Field label="Deadline" type="date" />
            <label className="block sm:col-span-2">
              <span className="text-xs font-bold uppercase tracking-widest text-ink/50 block mb-1.5">Project details</span>
              <textarea rows={5} className="w-full px-4 py-3 rounded-lg bg-cream border border-burgundy/10 focus:outline-none focus:border-burgundy resize-none" />
            </label>
            <div className="sm:col-span-2">
              <button type="submit" className="w-full bg-burgundy text-white py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-wine transition-colors">Submit quote request</button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

function Field({ label, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-widest text-ink/50 block mb-1.5">{label}</span>
      <input {...rest} className="w-full px-4 py-3 rounded-lg bg-cream border border-burgundy/10 focus:outline-none focus:border-burgundy transition-colors" />
    </label>
  );
}

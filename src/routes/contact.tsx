import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { SiteLayout } from "@/components/site/Layout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Maison Presse" },
      { name: "description", content: "Talk to the press. Custom quotes, trade enquiries, large runs, hand-finished editions." },
      { property: "og:title", content: "Contact — Maison Presse" },
      { property: "og:description", content: "Custom quotes, trade enquiries, large runs." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <SiteLayout>
      <section className="max-w-6xl mx-auto px-6 pt-32 pb-24 grid lg:grid-cols-2 gap-20">
        <div>
          <div className="text-xs uppercase tracking-widest text-gold mb-4">Get in touch</div>
          <h1 className="font-display text-6xl md:text-7xl leading-[0.95]">
            Talk to the press.
          </h1>
          <p className="mt-6 text-muted-foreground max-w-md leading-relaxed">
            Tell us what you'd like to print. We'll respond within one working day with a quote, a proof, or a question.
          </p>
          <dl className="mt-12 space-y-6 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted-foreground">Atelier</dt>
              <dd className="mt-1">Haveli No. 14, Brahmpuri, Jaipur 302002</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted-foreground">Press</dt>
              <dd className="mt-1">press@maisonpresse.in · +91 141 000 0000</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted-foreground">Trade</dt>
              <dd className="mt-1">trade@maisonpresse.in</dd>
            </div>
          </dl>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={(e) => { e.preventDefault(); setSent(true); }}
          className="rounded-3xl border border-border bg-card/40 p-8 sm:p-10 space-y-5 h-fit"
        >
          {(["Name", "Email", "Company (optional)"] as const).map((l) => (
            <Field key={l} label={l} type={l === "Email" ? "email" : "text"} />
          ))}
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">What would you like to press?</label>
            <textarea
              rows={5}
              className="mt-2 w-full bg-transparent border-b border-border focus:border-gold outline-none py-2 text-sm transition-colors resize-none"
              placeholder="A run of letterpress invitations, 200 copies…"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-4 rounded-full bg-gold text-ink font-medium hover:bg-gold-soft transition-colors"
          >
            {sent ? "Thank you — we'll be in touch." : "Send to the press"}
          </motion.button>
        </motion.form>
      </section>
    </SiteLayout>
  );
}

function Field({ label, type }: { label: string; type: string }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <input
        type={type}
        className="mt-2 w-full bg-transparent border-b border-border focus:border-gold outline-none py-2 text-sm transition-colors"
      />
    </div>
  );
}

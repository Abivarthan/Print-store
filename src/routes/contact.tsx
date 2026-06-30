import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { SiteLayout } from "@/components/site/Layout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Kruthick Printers" },
      { name: "description", content: "Talk to the press. Custom quotes, offset runs, digital prints, and premium finishes." },
      { property: "og:title", content: "Contact — Kruthick Printers" },
      { property: "og:description", content: "Custom quotes, bulk runs, digital printing." },
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
          <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-4">Get in touch</div>
          <h1 className="font-display text-6xl md:text-7xl leading-[0.95]">
            Talk to the press.
          </h1>
          <p className="mt-6 text-muted-foreground max-w-md leading-relaxed">
            Tell us what you'd like to print. We'll respond within one working day with a quote, a proof, or a question.
          </p>
          <dl className="mt-12 space-y-6 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted-foreground">Office</dt>
              <dd className="mt-1">No.19, Sri Ram Bhavan, Allimal Street, Trichy - 620008</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted-foreground">Phone</dt>
              <dd className="mt-1">95439 38516 / 97897 38516</dd>
              <dd className="mt-1 flex items-center gap-1"><span className="text-accent text-lg">WhatsApp:</span> 74488 89944</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted-foreground">Email</dt>
              <dd className="mt-1">kprinters2020@gmail.com</dd>
            </div>
          </dl>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={(e) => { e.preventDefault(); setSent(true); }}
          className="rounded-3xl border border-primary/20 bg-white shadow-xl shadow-primary/5 p-8 sm:p-10 space-y-5 h-fit"
        >
          {(["Name", "Email", "Company (optional)"] as const).map((l) => (
            <Field key={l} label={l} type={l === "Email" ? "email" : "text"} />
          ))}
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">What would you like to press?</label>
            <textarea
              rows={5}
              className="mt-2 w-full bg-transparent border-b border-border focus:border-primary outline-none py-2 text-sm transition-colors resize-none"
              placeholder="A run of letterpress invitations, 200 copies…"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-4 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
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
        className="mt-2 w-full bg-transparent border-b border-border focus:border-primary outline-none py-2 text-sm transition-colors"
      />
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Metier" },
      { name: "description", content: "Get in touch with Metier's print specialists. Studios in London and NYC." },
      { property: "og:title", content: "Contact — Metier" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12">
        <div>
          <p className="text-gold font-bold text-xs tracking-widest uppercase mb-3">Contact</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-burgundy leading-tight">Let's press something remarkable.</h1>
          <p className="text-ink/60 mt-4 max-w-md">We answer every inquiry within one business day. Complex packaging brief? Attach references — a specialist replies personally.</p>
          <div className="mt-10 space-y-5">
            <ContactRow icon={Mail} label="Email" value="studio@metierprint.com" />
            <ContactRow icon={Phone} label="Phone" value="+44 20 4525 0011" />
            <ContactRow icon={MapPin} label="London" value="Unit 4B, Inkwell Yard, EC1V 9BD" />
            <ContactRow icon={MapPin} label="New York" value="848 Industrial Way, Brooklyn, NY 10012" />
          </div>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); setSent(true); }}
          className="bg-white rounded-3xl p-8 border border-burgundy/5 bento-drop"
        >
          {sent ? (
            <div className="text-center py-16">
              <p className="text-gold font-bold text-xs tracking-widest uppercase mb-3">Received</p>
              <h2 className="font-display text-3xl font-bold text-burgundy">Thank you.</h2>
              <p className="text-ink/60 mt-3">A specialist will be in touch within one business day.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="First name" required />
                <Field label="Last name" required />
                <Field label="Email" type="email" required />
                <Field label="Company (optional)" />
              </div>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-widest text-ink/50 block mb-1.5">Message</span>
                <textarea required rows={5} className="w-full px-4 py-3 rounded-lg bg-cream border border-burgundy/10 focus:outline-none focus:border-burgundy transition-colors resize-none" />
              </label>
              <button type="submit" className="w-full bg-burgundy text-white py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-wine transition-colors">Send message</button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function ContactRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="size-10 rounded-full bg-gold/10 text-gold grid place-items-center shrink-0"><Icon className="h-4 w-4" /></div>
      <div>
        <div className="text-xs font-bold uppercase tracking-widest text-ink/40">{label}</div>
        <div className="text-burgundy font-medium mt-0.5">{value}</div>
      </div>
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

import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, FileText, LifeBuoy, Truck } from "lucide-react";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help & Support — Metier" },
      { name: "description", content: "Support articles, file guides, and shipping information for Metier customers." },
      { property: "og:title", content: "Help & Support — Metier" },
      { property: "og:url", content: "/help" },
    ],
    links: [{ rel: "canonical", href: "/help" }],
  }),
  component: Help,
});

function Help() {
  const topics = [
    { icon: FileText, title: "File preparation", desc: "PDF/X-1a, bleed, embedded fonts, color profiles.", to: "/faq" },
    { icon: Truck, title: "Shipping & delivery", desc: "DHL Express worldwide, rush and standard options.", to: "/faq" },
    { icon: BookOpen, title: "Paper & stock guide", desc: "Cotton, laid, uncoated — how to choose.", to: "/faq" },
    { icon: LifeBuoy, title: "Order support", desc: "Track, edit, reprint or refund an order.", to: "/contact" },
  ] as const;
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <p className="text-gold font-bold text-xs tracking-widest uppercase mb-3">Help & support</p>
      <h1 className="font-display text-4xl md:text-5xl font-bold text-burgundy max-w-2xl">How can we help you press something?</h1>
      <div className="grid sm:grid-cols-2 gap-6 mt-12">
        {topics.map((t) => (
          <Link key={t.title} to={t.to} className="bg-white rounded-2xl p-8 border border-burgundy/5 hover:shadow-lift transition-shadow flex items-start gap-4">
            <div className="size-11 rounded-full bg-gold/10 text-gold grid place-items-center shrink-0"><t.icon className="h-5 w-5" /></div>
            <div>
              <h3 className="font-display font-bold text-burgundy text-lg">{t.title}</h3>
              <p className="text-sm text-ink/60 mt-1">{t.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

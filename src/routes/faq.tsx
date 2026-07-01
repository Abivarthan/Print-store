import { createFileRoute } from "@tanstack/react-router";
import { FAQS } from "@/data/catalog";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Metier" },
      { name: "description", content: "Answers about ordering, files, materials, shipping, and returns at Metier." },
      { property: "og:title", content: "FAQ — Metier" },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      }),
    }],
  }),
  component: FAQ,
});

function FAQ() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <Breadcrumbs items={[{ label: "FAQ" }]} />
      <p className="text-gold font-bold text-xs tracking-widest uppercase mb-3">Frequently asked</p>
      <h1 className="font-display text-4xl md:text-5xl font-bold text-burgundy">Everything you need to know.</h1>
      <div className="mt-10 space-y-3">
        {FAQS.map((f) => (
          <details key={f.q} className="group bg-white rounded-2xl px-6 py-5 border border-burgundy/5">
            <summary className="cursor-pointer list-none flex items-center justify-between gap-4">
              <span className="font-display font-bold text-burgundy text-lg">{f.q}</span>
              <span className="text-gold text-2xl group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className="mt-3 text-ink/70 leading-relaxed">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

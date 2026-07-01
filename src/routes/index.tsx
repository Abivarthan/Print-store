import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Award, Sparkles, Truck } from "lucide-react";
// framer-motion available but hero uses CSS animation to avoid SSR flash
import { CATEGORIES, FAQS, PRODUCTS, TESTIMONIALS } from "@/data/catalog";
import { ProductCard } from "@/components/site/ProductCard";
import heroFoil from "@/assets/hero-foil.jpg";
import varnish from "@/assets/varnish.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Metier — Tactile print for discerning brands" },
      { name: "description", content: "Cotton business cards, wedding invitations, packaging, marketing print — crafted with letterpress, foil, and edge-painted finishes." },
      { property: "og:title", content: "Metier — Tactile print for discerning brands" },
      { property: "og:description", content: "Cotton stocks, foil accents, custom packaging. Crafted since 1994." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const chips = ["Cotton Papers", "Hot Foil", "Edge Painting", "Custom Die-Cuts", "Duplexing", "Letterpress"];

function Home() {
  const bestsellers = PRODUCTS.slice(0, 4);
  const arrivals = PRODUCTS.slice(4, 8);
  const featured = CATEGORIES.slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Bento Hero */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:h-[640px] fade-up">

        <div className="md:col-span-8 group relative overflow-hidden rounded-3xl bg-burgundy bento-drop flex flex-col">
          <div className="p-8 md:p-10 z-10">
            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold text-white text-balance leading-[0.9] mb-6">
              Physicality <br /><span className="text-gold">in every grain.</span>
            </h1>
            <p className="text-white/70 max-w-md text-base md:text-lg leading-relaxed mb-8">
              Premium cardstock meeting precision foil-stamping. Experience the tactile standard of high-craft printing.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-gold text-white px-8 py-4 rounded-full font-bold text-sm tracking-widest uppercase hover:bg-white hover:text-burgundy transition-all duration-500 shadow-xl"
            >
              Sample the Collection <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-auto px-6 pb-6 w-full">
            <div className="w-full aspect-[16/7] rounded-2xl overflow-hidden ring-1 ring-white/10">
              <img src={heroFoil} alt="Gold foil embossed business cards" className="w-full h-full object-cover" width={1600} height={700} />
            </div>
          </div>
        </div>

        <div className="md:col-span-4 grid grid-rows-2 gap-6">
          <Link to="/category/$slug" params={{ slug: "business-cards" }} className="bg-white rounded-3xl p-8 bento-drop border border-burgundy/5 flex flex-col justify-between hover:shadow-lift transition-all">
            <div>
              <span className="text-gold font-display font-bold text-xs tracking-widest uppercase">Featured Tech</span>
              <h3 className="text-2xl font-display font-bold text-burgundy mt-2">3D Spot Varnish</h3>
            </div>
            <div className="w-full aspect-video rounded-xl overflow-hidden ring-1 ring-black/5 mt-4">
              <img src={varnish} alt="Raised varnish detail" loading="lazy" className="w-full h-full object-cover" width={800} height={450} />
            </div>
          </Link>
          <Link to="/category/$slug" params={{ slug: "letterheads" }} className="bg-wine rounded-3xl p-8 bento-drop relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-white text-2xl font-display font-bold">Cotton Series</h3>
              <p className="text-white/60 text-sm mt-2">600gsm Letterpress Stock</p>
              <span className="mt-6 text-gold text-sm font-bold flex items-center gap-2">
                Explore Materials
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
            <div className="absolute -bottom-10 -right-10 size-48 bg-gold/10 rounded-full blur-3xl" />
          </Link>
        </div>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-3 my-12 justify-center">
        {chips.map((c) => (
          <Link key={c} to="/shop" className="px-6 py-2.5 rounded-full border border-burgundy/10 text-burgundy font-medium text-sm hover:border-burgundy transition-colors bg-white">
            {c}
          </Link>
        ))}
      </div>

      {/* Featured categories */}
      <section className="py-12">
        <div className="flex items-end justify-between mb-10 gap-6">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-burgundy">Featured categories</h2>
            <p className="text-ink/60 mt-2">Every touchpoint of your brand, considered.</p>
          </div>
          <Link to="/categories" className="text-sm font-bold text-gold underline underline-offset-4 shrink-0">All categories</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {featured.map((c) => (
            <Link key={c.slug} to="/category/$slug" params={{ slug: c.slug }} className="group">
              <div className="aspect-square rounded-2xl overflow-hidden bg-white bento-drop border border-burgundy/5">
                <img src={c.image} alt={c.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="mt-3">
                <p className="text-sm font-semibold text-burgundy truncate">{c.name}</p>
                <p className="text-[10px] uppercase tracking-widest text-ink/40 mt-0.5">{c.productCount} products</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bestsellers */}
      <section className="py-12">
        <div className="flex items-end justify-between mb-10 gap-6">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-burgundy">Best-sellers</h2>
            <p className="text-ink/60 mt-2">The foundations of brand identity.</p>
          </div>
          <Link to="/shop" className="text-sm font-bold text-gold underline underline-offset-4 shrink-0">View all products</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {bestsellers.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </section>

      {/* Services strip */}
      <section className="grid sm:grid-cols-3 gap-6 my-16">
        {[
          { icon: Sparkles, title: "Free file review", desc: "A production artist checks every file before we press." },
          { icon: Truck, title: "Rush production", desc: "Next-day dispatch on our most requested stationery." },
          { icon: Award, title: "Sustainable defaults", desc: "FSC papers and soy-based inks across the range." },
        ].map((s) => (
          <div key={s.title} className="bg-white rounded-2xl p-6 bento-drop border border-burgundy/5 flex items-start gap-4">
            <div className="size-11 rounded-full bg-gold/10 grid place-items-center text-gold shrink-0">
              <s.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h4 className="font-display font-bold text-burgundy">{s.title}</h4>
              <p className="text-sm text-ink/60 mt-1">{s.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* New arrivals */}
      <section className="py-12">
        <div className="flex items-end justify-between mb-10 gap-6">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-burgundy">New arrivals</h2>
            <p className="text-ink/60 mt-2">Fresh off the press.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {arrivals.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </section>

      {/* Trust bar */}
      <div className="bg-burgundy text-white rounded-[2rem] p-8 md:p-10 mt-20 grid md:grid-cols-2 gap-8 md:gap-12 relative overflow-hidden foil-shimmer">
        <div className="z-10">
          <p className="text-gold font-bold text-xs tracking-widest uppercase mb-4">The master's promise</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight max-w-lg">
            Print shouldn't just be seen. <br /><span className="italic text-white/90">It must be felt.</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-8 z-10 self-center">
          <div><span className="block text-3xl font-display font-bold text-gold">100%</span><span className="text-xs text-white/50 uppercase tracking-widest">Sustainably sourced</span></div>
          <div><span className="block text-3xl font-display font-bold text-gold">24h</span><span className="text-xs text-white/50 uppercase tracking-widest">Expert review</span></div>
          <div><span className="block text-3xl font-display font-bold text-gold">30+</span><span className="text-xs text-white/50 uppercase tracking-widest">Countries served</span></div>
          <div><span className="block text-3xl font-display font-bold text-gold">4.9★</span><span className="text-xs text-white/50 uppercase tracking-widest">Average rating</span></div>
        </div>
      </div>

      {/* Testimonials */}
      <section className="py-20">
        <div className="text-center mb-12">
          <p className="text-gold font-bold text-xs tracking-widest uppercase mb-3">Kind words</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-burgundy">From studios we've pressed for</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-white rounded-2xl p-8 bento-drop border border-burgundy/5">
              <p className="text-gold text-2xl leading-none">"</p>
              <blockquote className="text-ink/80 mt-3 leading-relaxed">{t.quote}</blockquote>
              <div className="mt-6 pt-6 border-t border-burgundy/5">
                <div className="font-display font-bold text-burgundy text-sm">{t.name}</div>
                <div className="text-xs text-ink/50 mt-0.5">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 grid md:grid-cols-[1fr_2fr] gap-10">
        <div>
          <p className="text-gold font-bold text-xs tracking-widest uppercase mb-3">Questions</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-burgundy leading-tight">Everything you need to know before we press.</h2>
          <Link to="/faq" className="mt-6 inline-block text-sm font-bold text-gold underline underline-offset-4">All FAQs</Link>
        </div>
        <div className="space-y-3">
          {FAQS.slice(0, 4).map((f) => (
            <details key={f.q} className="group bg-white rounded-2xl px-6 py-5 border border-burgundy/5">
              <summary className="cursor-pointer list-none flex items-center justify-between gap-4">
                <span className="font-display font-bold text-burgundy">{f.q}</span>
                <span className="text-gold text-xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-3 text-ink/60 text-sm leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="my-16 bg-ink rounded-[2rem] p-10 md:p-16 text-center relative overflow-hidden">
        <div className="absolute -top-24 -right-24 size-80 rounded-full bg-burgundy/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 size-80 rounded-full bg-gold/20 blur-3xl" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="text-gold font-bold text-xs tracking-widest uppercase mb-4">Bespoke project?</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight">Let's talk about what you want people to feel.</h2>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link to="/quote" className="inline-flex items-center gap-2 bg-gold text-white px-8 py-4 rounded-full font-bold text-sm tracking-widest uppercase hover:bg-white hover:text-burgundy transition-all">
              Request a quote <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/contact" className="inline-flex items-center gap-2 border border-white/20 text-white px-8 py-4 rounded-full font-bold text-sm tracking-widest uppercase hover:bg-white/10 transition-all">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

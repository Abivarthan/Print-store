import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { ProductMark } from "@/components/site/ProductMark";
import { CATEGORIES, PRODUCTS } from "@/lib/catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Maison Presse — Print, pressed in India" },
      { name: "description", content: "Premium printing atelier. Letterpress business cards, monogrammed stationery, rigid packaging, hardcover books. Shipped worldwide." },
      { property: "og:title", content: "Maison Presse — Print, pressed in India" },
      { property: "og:description", content: "Letterpress, foil, cotton stock, rigid packaging. Pressed in Jaipur." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <SiteLayout>
      <Hero />
      <Marquee />
      <Categories />
      <Process />
      <Featured />
      <CTA />
    </SiteLayout>
  );
}

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[92vh] flex items-center overflow-hidden">
      <motion.div
        style={{ y, opacity }}
        className="absolute inset-0 -z-10"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full"
          style={{ background: "radial-gradient(closest-side, oklch(0.82 0.13 85 / 0.18), transparent 70%)" }} />
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-[1.3fr_1fr] gap-16 items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card/40 backdrop-blur-sm text-xs"
          >
            <Sparkles className="w-3 h-3 text-gold" />
            <span className="text-muted-foreground">Pressed in Jaipur · est. 2014</span>
          </motion.div>

          <h1 className="mt-6 font-display text-[clamp(3rem,8vw,7rem)] leading-[0.95] tracking-tight">
            {"The art of".split("").map((c, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.025, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block"
              >
                {c === " " ? "\u00A0" : c}
              </motion.span>
            ))}
            <br />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 1 }}
              className="italic gold-shimmer"
            >
              printing
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="inline-block"
            >
              , refined.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-8 max-w-lg text-base text-muted-foreground leading-relaxed"
          >
            A small atelier. Cotton stock. Hand-poured ink. Foil pressed by feel.
            Order one card or a thousand books — we treat them the same.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.15, duration: 0.6 }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <Link
              to="/shop"
              className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gold text-ink font-medium hover:bg-gold-soft transition-all hover:gap-3"
            >
              Explore the press
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:rotate-45" />
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3.5 rounded-full border border-border text-sm hover:bg-white/5 transition-colors"
            >
              Request a custom quote
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative aspect-[3/4] hidden lg:block"
        >
          <motion.div
            animate={{ y: [0, -14, 0], rotate: [-3, -1, -3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 glass rounded-3xl p-10 shadow-[var(--shadow-card)]"
          >
            <ProductMark kind="card" className="w-full h-full text-gold" />
            <div className="absolute bottom-6 left-6 right-6 flex justify-between text-xs">
              <span className="text-muted-foreground">No. 037</span>
              <span className="text-gold">Cotton 600gsm</span>
            </div>
          </motion.div>
          <motion.div
            animate={{ y: [0, 12, 0], rotate: [6, 8, 6] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute -bottom-8 -right-4 w-2/3 aspect-square glass rounded-3xl p-8"
          >
            <ProductMark kind="envelope" className="w-full h-full text-gold-soft" />
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        Scroll
      </div>
    </section>
  );
}

function Marquee() {
  const items = ["Letterpress", "Foil stamp", "Pressed cotton", "Spot UV", "Smyth-sewn", "Edge gilding", "Embossing", "Giclée"];
  return (
    <section aria-hidden className="py-10 border-y border-border overflow-hidden">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 40, ease: "linear", repeat: Infinity }}
        className="flex gap-16 whitespace-nowrap font-display text-3xl text-muted-foreground/40"
      >
        {[...items, ...items, ...items].map((t, i) => (
          <span key={i} className="flex items-center gap-16">
            <span>{t}</span>
            <span className="text-gold">✦</span>
          </span>
        ))}
      </motion.div>
    </section>
  );
}

function Categories() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-32">
      <div className="flex items-end justify-between flex-wrap gap-6 mb-14">
        <div>
          <div className="text-xs uppercase tracking-widest text-gold mb-3">01 — Catalogue</div>
          <h2 className="font-display text-5xl md:text-6xl leading-[1.05] max-w-2xl">
            Six rooms in the atelier.
          </h2>
        </div>
        <Link to="/shop" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2">
          See all <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map((c, i) => (
          <motion.div
            key={c.slug}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              to="/shop"
              className="group relative block aspect-[4/5] rounded-3xl border border-border overflow-hidden p-8 hover:border-gold/40 transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-card via-card/40 to-transparent" />
              <div className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity">
                <ProductMark kind={["card","letter","brochure","box","book","poster"][i % 6]} className="w-full h-full text-gold" />
              </div>
              <div className="relative h-full flex flex-col justify-between">
                <span className="text-xs text-muted-foreground">0{i + 1}</span>
                <div>
                  <div className="font-display text-3xl mb-2 group-hover:translate-x-1 transition-transform">{c.name}</div>
                  <p className="text-sm text-muted-foreground max-w-[22ch]">{c.blurb}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Process() {
  const steps = [
    { n: "01", h: "You upload", t: "Send artwork or commission ours. AI-assisted prepress checks bleed, color and resolution in seconds." },
    { n: "02", h: "We compose", t: "A real human prepares plates. Proofs are photographed and sent within 24 hours." },
    { n: "03", h: "Press runs", t: "Letterpress, foil, digital, or offset — selected to suit the piece, never the margin." },
    { n: "04", h: "Pack & dispatch", t: "Wrapped in glassine, boxed, shipped worldwide. Tracked from press to door." },
  ];
  return (
    <section className="bg-card/40 border-y border-border">
      <div className="max-w-7xl mx-auto px-6 py-32">
        <div className="text-xs uppercase tracking-widest text-gold mb-3">02 — Process</div>
        <h2 className="font-display text-5xl md:text-6xl leading-[1.05] max-w-2xl mb-16">
          Four steps. No shortcuts.
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="bg-background p-8 min-h-[280px] flex flex-col justify-between hover:bg-card transition-colors"
            >
              <span className="font-display text-5xl text-gold-gradient">{s.n}</span>
              <div>
                <div className="font-display text-2xl mb-2">{s.h}</div>
                <p className="text-sm text-muted-foreground">{s.t}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Featured() {
  const picks = PRODUCTS.slice(0, 4);
  return (
    <section className="max-w-7xl mx-auto px-6 py-32">
      <div className="flex items-end justify-between flex-wrap gap-6 mb-14">
        <div>
          <div className="text-xs uppercase tracking-widest text-gold mb-3">03 — Selected works</div>
          <h2 className="font-display text-5xl md:text-6xl leading-[1.05] max-w-2xl">
            New from the press.
          </h2>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {picks.map((p, i) => (
          <motion.div
            key={p.slug}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
          >
            <Link
              to="/shop/$slug"
              params={{ slug: p.slug }}
              className="group block"
            >
              <div className="aspect-[4/5] rounded-2xl border border-border bg-card/60 overflow-hidden mb-4 relative">
                <motion.div whileHover={{ scale: 1.04 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0 p-10 text-gold">
                  <ProductMark kind={p.hero} className="w-full h-full" />
                </motion.div>
              </div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-display text-lg leading-tight group-hover:text-gold transition-colors">{p.name}</div>
                  <p className="text-xs text-muted-foreground mt-1">{p.tagline}</p>
                </div>
                <span className="text-sm whitespace-nowrap">from ₹{p.basePrice}</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      <div className="relative rounded-3xl border border-border p-12 md:p-20 overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-60"
          style={{ background: "radial-gradient(60% 80% at 80% 20%, oklch(0.82 0.13 85 / 0.18), transparent 60%)" }} />
        <div className="max-w-3xl">
          <h3 className="font-display text-4xl md:text-6xl leading-[1.05]">
            Press something <span className="italic text-gold-gradient">unforgettable</span>.
          </h3>
          <p className="mt-6 text-muted-foreground max-w-xl">
            Whether it's a hundred wedding invitations or a thousand catalogues, we'd love to print it.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/shop" className="px-6 py-3.5 rounded-full bg-gold text-ink font-medium hover:bg-gold-soft transition-colors">
              Start your order
            </Link>
            <Link to="/contact" className="px-6 py-3.5 rounded-full border border-border hover:bg-white/5 transition-colors text-sm">
              Talk to the press
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

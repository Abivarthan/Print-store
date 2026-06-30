import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/site/Layout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "The Atelier — Kruthick Printers" },
      { name: "description", content: "Inside the press: a small studio in Trichy where offset, digital, and premium finishing meet." },
      { property: "og:title", content: "The Atelier — Kruthick Printers" },
      { property: "og:description", content: "A small studio in Trichy. Offset, digital, premium finishes." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <section className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-4">The atelier</div>
          <h1 className="font-display text-6xl md:text-8xl leading-[0.95]">
            A printing press,<br /><span className="italic text-primary">built on quality.</span>
          </h1>
        </motion.div>

        <div className="mt-20 grid md:grid-cols-2 gap-12 text-muted-foreground leading-relaxed">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            We started with a stubborn belief that print still mattered.
            Years later, we still believe it — only now we serve with a wider range of high-quality finishes.
          </motion.p>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.15 }}>
            Our press is located in the heart of Trichy. The facility shares floor space with offset machines,
            digital printers, and a dedicated team ensuring the colors are perfectly matched to your vision.
          </motion.p>
        </div>
      </section>

      <section className="border-y border-border bg-card/40">
        <div className="max-w-7xl mx-auto px-6 py-24 grid sm:grid-cols-2 md:grid-cols-4 gap-px bg-border">
          {[
            ["12+", "Years pressing"],
            ["48,000", "Pieces / month"],
            ["94", "Paper stocks held"],
            ["1962", "Oldest press in use"],
          ].map(([n, l], i) => (
            <motion.div
              key={l}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="bg-white p-10 border border-border/50"
            >
              <div className="font-display text-5xl text-primary">{n}</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mt-2">{l}</div>
            </motion.div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}

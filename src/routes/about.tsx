import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/site/Layout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "The Atelier — Maison Presse" },
      { name: "description", content: "Inside the press: a small studio in Jaipur where letterpress, foil, and bookbinding meet modern digital prepress." },
      { property: "og:title", content: "The Atelier — Maison Presse" },
      { property: "og:description", content: "A small studio in Jaipur. Letterpress, foil, bookbinding, with modern prepress." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <section className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="text-xs uppercase tracking-widest text-gold mb-4">The atelier</div>
          <h1 className="font-display text-6xl md:text-8xl leading-[0.95]">
            A small press,<br /><span className="italic text-gold-gradient">in a quiet courtyard.</span>
          </h1>
        </motion.div>

        <div className="mt-20 grid md:grid-cols-2 gap-12 text-muted-foreground leading-relaxed">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            We started in 2014 with a single 1962 Heidelberg Windmill and a stubborn belief that print still mattered.
            Twelve years and three more presses later, we still believe it — only now we say so on cotton stock.
          </motion.p>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.15 }}>
            Our atelier is housed in a restored haveli in old Jaipur. The presses share floor space with a binding table,
            a foil station, and a permanently-on espresso machine. There are no minimum orders — only the floor minimum, which is one.
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
              className="bg-background p-10"
            >
              <div className="font-display text-5xl text-gold-gradient">{n}</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mt-2">{l}</div>
            </motion.div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Leaf, Users } from "lucide-react";
import heroFoil from "@/assets/hero-foil.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Metier" },
      { name: "description", content: "Metier is a print atelier crafting tactile stationery, packaging and marketing print since 1994. London & NYC." },
      { property: "og:title", content: "About — Metier" },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

function About() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
        <div>
          <p className="text-gold font-bold text-xs tracking-widest uppercase mb-3">Our story</p>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-burgundy leading-tight">Print you can feel — printed with the same hands since 1994.</h1>
          <p className="text-ink/70 mt-6 leading-relaxed max-w-lg">Metier was founded on a simple belief: printed things become artifacts. From foil-stamped business cards to letterpress wedding suites and architectural packaging, our craft has always favored fewer, better objects.</p>
          <div className="mt-8 flex gap-3">
            <Link to="/shop" className="bg-burgundy text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-wine">Shop</Link>
            <Link to="/contact" className="border border-burgundy/20 text-burgundy px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-burgundy/5">Visit</Link>
          </div>
        </div>
        <div className="aspect-[4/5] rounded-3xl overflow-hidden bento-drop">
          <img src={heroFoil} alt="Foil embossed card" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-20">
        {[
          { icon: Award, title: "30 years pressed", desc: "Independently owned, three generations of print masters." },
          { icon: Users, title: "1,200+ studios trust us", desc: "Design agencies and hospitality brands across 30 countries." },
          { icon: Leaf, title: "FSC & soy-based inks", desc: "Sustainability is a default, not a premium option." },
        ].map((v) => (
          <div key={v.title} className="bg-white rounded-2xl p-8 border border-burgundy/5">
            <div className="size-11 rounded-full bg-gold/10 grid place-items-center text-gold mb-4"><v.icon className="h-5 w-5" /></div>
            <h3 className="font-display font-bold text-burgundy text-xl">{v.title}</h3>
            <p className="text-sm text-ink/60 mt-2">{v.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-burgundy text-white rounded-[2rem] p-10 md:p-16">
        <p className="text-gold font-bold text-xs tracking-widest uppercase mb-3">The atelier</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold max-w-2xl leading-tight">Our presses live in a converted textile factory in East London and a Brooklyn studio. Come by — the door's open.</h2>
      </div>
    </div>
  );
}

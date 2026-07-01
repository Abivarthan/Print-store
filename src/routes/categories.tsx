import { createFileRoute, Link } from "@tanstack/react-router";
import { groupedCategories } from "@/data/catalog";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — Metier" },
      { name: "description", content: "All Metier print categories: business essentials, marketing, packaging, invitations, gifts and services." },
      { property: "og:title", content: "Categories — Metier" },
      { property: "og:url", content: "/categories" },
    ],
    links: [{ rel: "canonical", href: "/categories" }],
  }),
  component: Categories,
});

function Categories() {
  const groups = groupedCategories();
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <Breadcrumbs items={[{ label: "Categories" }]} />
      <div className="max-w-2xl mb-14">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-burgundy">Every category, one atelier.</h1>
        <p className="text-ink/60 mt-3">Choose a discipline — cotton stationery, marketing, packaging, or occasion print. Every item is bespoke-configurable.</p>
      </div>
      <div className="space-y-16">
        {Object.entries(groups).map(([group, cats]) => (
          <section key={group}>
            <div className="flex items-center gap-4 mb-6">
              <h2 className="font-display text-2xl font-bold text-burgundy">{group}</h2>
              <div className="flex-1 h-px bg-burgundy/10" />
              <span className="text-xs uppercase tracking-widest text-ink/40">{cats.length} categories</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {cats.map((c) => (
                <Link key={c.slug} to="/category/$slug" params={{ slug: c.slug }} className="group">
                  <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-white bento-drop border border-burgundy/5">
                    <img src={c.image} alt={c.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="mt-3">
                    <h3 className="font-display font-bold text-burgundy">{c.name}</h3>
                    <p className="text-xs text-ink/50 mt-0.5">{c.blurb}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

import { createFileRoute, notFound } from "@tanstack/react-router";
import { getCategory, productsByCategory } from "@/data/catalog";
import { ProductCard } from "@/components/site/ProductCard";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => {
    const c = getCategory(params.slug);
    const title = c ? `${c.name} — Metier` : "Category — Metier";
    return {
      meta: [
        { title },
        { name: "description", content: c?.blurb ?? "Explore Metier's printing categories." },
        { property: "og:title", content: title },
        { property: "og:url", content: `/category/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/category/${params.slug}` }],
    };
  },
  loader: ({ params }) => {
    const c = getCategory(params.slug);
    if (!c) throw notFound();
    return { category: c };
  },
  component: CategoryDetail,
  notFoundComponent: () => (
    <div className="max-w-3xl mx-auto px-6 py-24 text-center">
      <h1 className="font-display text-4xl font-bold text-burgundy">Category not found</h1>
      <p className="text-ink/60 mt-3">The category you're looking for has moved.</p>
    </div>
  ),
});

function CategoryDetail() {
  const { category } = Route.useLoaderData() as { category: import("@/data/catalog").Category };
  const products = productsByCategory(category.slug);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <Breadcrumbs items={[
        { label: "Categories", to: "/categories" },
        { label: category.name },
      ]} />

      <div className="grid md:grid-cols-2 gap-10 items-end mb-14">
        <div>
          <p className="text-gold font-bold text-xs tracking-widest uppercase mb-3">{category.group}</p>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-burgundy">{category.name}</h1>
          <p className="text-ink/60 mt-4 max-w-lg">{category.blurb} Every product is fully configurable — stock, size, finish, quantity — with a live price calculator.</p>
        </div>
        <div className="aspect-[16/9] rounded-3xl overflow-hidden bento-drop">
          <img src={category.image} alt={category.name} loading="lazy" className="w-full h-full object-cover" />
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-burgundy/5">
          <p className="text-ink/60">This category is being restocked. Request a quote and we'll craft it for you.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      )}
    </div>
  );
}

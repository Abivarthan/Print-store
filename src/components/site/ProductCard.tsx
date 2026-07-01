import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import type { Product } from "@/data/catalog";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const badgeColor: Record<NonNullable<Product["badge"]>, string> = {
  PREMIUM: "bg-burgundy/90 text-white",
  POPULAR: "bg-gold text-white",
  NEW: "bg-ink text-white",
  BESTSELLER: "bg-wine text-white",
};

export function ProductCard({ product }: { product: Product }) {
  const { wishlist, toggleWishlist } = useStore();
  const wished = wishlist.includes(product.slug);
  return (
    <div className="group">
      <Link to="/product/$slug" params={{ slug: product.slug }} className="block">
        <div className="relative mb-4 overflow-hidden rounded-2xl bg-white bento-drop border border-burgundy/5 transition-transform duration-500 group-hover:-translate-y-2">
          <div className="w-full aspect-[3/4] bg-stone-50 overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          </div>
          {product.badge && (
            <div className={cn("absolute top-4 left-4 backdrop-blur-sm text-[10px] font-bold px-3 py-1 rounded-full tracking-wider", badgeColor[product.badge])}>
              {product.badge}
            </div>
          )}
          <button
            onClick={(e) => { e.preventDefault(); toggleWishlist(product.slug); }}
            aria-label="Toggle wishlist"
            className={cn(
              "absolute top-3 right-3 size-9 rounded-full grid place-items-center backdrop-blur-sm transition-all",
              wished ? "bg-burgundy text-white" : "bg-white/80 text-ink hover:bg-white",
            )}
          >
            <Heart className={cn("h-4 w-4", wished && "fill-current")} />
          </button>
        </div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="font-display font-bold text-base sm:text-lg text-burgundy truncate">{product.name}</h4>
            <p className="text-[10px] text-ink/40 font-medium uppercase tracking-widest mt-1">From ${product.price.toFixed(2)}</p>
          </div>
          <span className="text-xs text-ink/50 shrink-0 mt-1">★ {product.rating.toFixed(1)}</span>
        </div>
      </Link>
    </div>
  );
}

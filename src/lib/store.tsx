import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { PRODUCTS, type Product } from "@/data/catalog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, requireAuthOrRedirect } from "@/lib/auth";

export type CartItem = {
  slug: string;
  qty: number;
  material?: string;
  size?: string;
  finish?: string;
};

type StoreState = {
  cart: CartItem[];
  wishlist: string[];
  theme: "light" | "dark";
  loading: boolean;
  addToCart: (item: CartItem) => void;
  updateQty: (slug: string, qty: number) => void;
  removeFromCart: (slug: string) => void;
  clearCart: () => void;
  toggleWishlist: (slug: string) => void;
  toggleTheme: () => void;
};

const StoreContext = createContext<StoreState | null>(null);
const THEME_KEY = "metier.theme";

function variantKey(item: Pick<CartItem, "material" | "size" | "finish">) {
  return [item.material ?? "", item.size ?? "", item.finish ?? ""].join("|");
}

function priceFor(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug)?.price ?? 0;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [loading, setLoading] = useState(false);

  // Theme persists locally (UI-only)
  useEffect(() => {
    try {
      const t = localStorage.getItem(THEME_KEY);
      if (t === "dark" || t === "light") setTheme(t);
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
      document.documentElement.classList.toggle("dark", theme === "dark");
    } catch { /* ignore */ }
  }, [theme]);

  // Load cart + wishlist from Supabase whenever user changes
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setCart([]);
      setWishlist([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const [{ data: cartRows, error: cartErr }, { data: wishRows, error: wishErr }] = await Promise.all([
        supabase.from("cart_items").select("product_slug, variant_key, quantity, metadata").eq("user_id", user.id),
        supabase.from("wishlist_items").select("product_slug").eq("user_id", user.id),
      ]);
      if (cancelled) return;
      if (cartErr) console.error(cartErr);
      if (wishErr) console.error(wishErr);
      setCart(
        (cartRows ?? []).map((r) => {
          const meta = (r.metadata ?? {}) as { material?: string; size?: string; finish?: string };
          return {
            slug: r.product_slug,
            qty: r.quantity,
            material: meta.material,
            size: meta.size,
            finish: meta.finish,
          };
        }),
      );
      setWishlist((wishRows ?? []).map((r) => r.product_slug));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user, authLoading]);

  const addToCart = useCallback((item: CartItem) => {
    if (!requireAuthOrRedirect(user, "Sign in to add items to your cart")) return;
    const key = variantKey(item);
    const price = priceFor(item.slug);
    // Optimistic
    setCart((prev) => {
      const idx = prev.findIndex((p) => p.slug === item.slug && variantKey(p) === key);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + item.qty };
        return next;
      }
      return [...prev, item];
    });
    (async () => {
      // Upsert by (user_id, product_slug, variant_key)
      const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", user!.id)
        .eq("product_slug", item.slug)
        .eq("variant_key", key)
        .maybeSingle();
      if (existing) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + item.qty })
          .eq("id", existing.id);
        if (error) { toast.error("Couldn't update cart"); console.error(error); }
      } else {
        const { error } = await supabase.from("cart_items").insert({
          user_id: user!.id,
          product_slug: item.slug,
          variant_key: key,
          quantity: item.qty,
          unit_price: price,
          metadata: { material: item.material, size: item.size, finish: item.finish },
        });
        if (error) { toast.error("Couldn't add to cart"); console.error(error); }
      }
      toast.success("Added to cart");
    })();
  }, [user]);

  const updateQty = useCallback((slug: string, qty: number) => {
    if (!user) return;
    const target = cart.find((p) => p.slug === slug);
    const key = target ? variantKey(target) : "";
    const nextQty = Math.max(1, qty);
    if (qty <= 0) {
      setCart((prev) => prev.filter((p) => !(p.slug === slug && variantKey(p) === key)));
      supabase.from("cart_items").delete().eq("user_id", user.id).eq("product_slug", slug).eq("variant_key", key).then(({ error }) => {
        if (error) console.error(error);
      });
      return;
    }
    setCart((prev) => prev.map((p) => (p.slug === slug && variantKey(p) === key ? { ...p, qty: nextQty } : p)));
    supabase
      .from("cart_items")
      .update({ quantity: nextQty })
      .eq("user_id", user.id)
      .eq("product_slug", slug)
      .eq("variant_key", key)
      .then(({ error }) => { if (error) console.error(error); });
  }, [user, cart]);

  const removeFromCart = useCallback((slug: string) => {
    if (!user) return;
    const target = cart.find((p) => p.slug === slug);
    const key = target ? variantKey(target) : "";
    setCart((prev) => prev.filter((p) => !(p.slug === slug && variantKey(p) === key)));
    supabase.from("cart_items").delete().eq("user_id", user.id).eq("product_slug", slug).eq("variant_key", key).then(({ error }) => {
      if (error) console.error(error);
    });
  }, [user, cart]);

  const clearCart = useCallback(() => {
    setCart([]);
    if (!user) return;
    supabase.from("cart_items").delete().eq("user_id", user.id).then(({ error }) => {
      if (error) console.error(error);
    });
  }, [user]);

  const toggleWishlist = useCallback((slug: string) => {
    if (!requireAuthOrRedirect(user, "Sign in to save to your wishlist")) return;
    const has = wishlist.includes(slug);
    setWishlist((prev) => (has ? prev.filter((s) => s !== slug) : [...prev, slug]));
    if (has) {
      supabase.from("wishlist_items").delete().eq("user_id", user!.id).eq("product_slug", slug).then(({ error }) => {
        if (error) { toast.error("Couldn't remove from wishlist"); console.error(error); }
      });
    } else {
      supabase.from("wishlist_items").insert({ user_id: user!.id, product_slug: slug }).then(({ error }) => {
        if (error) { toast.error("Couldn't save to wishlist"); console.error(error); }
        else toast.success("Saved to wishlist");
      });
    }
  }, [user, wishlist]);

  const toggleTheme = useCallback(() => setTheme((t) => (t === "light" ? "dark" : "light")), []);

  const value = useMemo<StoreState>(
    () => ({ cart, wishlist, theme, loading, addToCart, updateQty, removeFromCart, clearCart, toggleWishlist, toggleTheme }),
    [cart, wishlist, theme, loading, addToCart, updateQty, removeFromCart, clearCart, toggleWishlist, toggleTheme],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function useCartWithProducts() {
  const { cart } = useStore();
  return cart
    .map((item) => {
      const product = PRODUCTS.find((p) => p.slug === item.slug);
      return product ? { item, product } : null;
    })
    .filter((v): v is { item: CartItem; product: Product } => v !== null);
}

export function useCartTotals() {
  const items = useCartWithProducts();
  const subtotal = items.reduce((s, { item, product }) => s + item.qty * product.price, 0);
  const shipping = subtotal === 0 ? 0 : subtotal > 200 ? 0 : 12;
  const tax = +(subtotal * 0.08).toFixed(2);
  const total = +(subtotal + shipping + tax).toFixed(2);
  const count = items.reduce((s, { item }) => s + item.qty, 0);
  return { items, subtotal, shipping, tax, total, count };
}

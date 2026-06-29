export type Product = {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  basePrice: number; // INR, per unit at base config
  minQty: number;
  hero: string; // emoji or icon hint
  description: string;
  options: {
    sizes: { id: string; label: string; mult: number }[];
    papers: { id: string; label: string; mult: number }[];
    finishes: { id: string; label: string; add: number }[];
    qtyTiers: { qty: number; discount: number }[];
  };
};

const defaultOptions: Product["options"] = {
  sizes: [
    { id: "std", label: "Standard 3.5 × 2 in", mult: 1 },
    { id: "sq", label: "Square 2.5 × 2.5 in", mult: 1.05 },
    { id: "lg", label: "Large 3.5 × 2.5 in", mult: 1.15 },
  ],
  papers: [
    { id: "matte", label: "Soft Matte 350gsm", mult: 1 },
    { id: "linen", label: "Italian Linen 400gsm", mult: 1.35 },
    { id: "cotton", label: "Pressed Cotton 600gsm", mult: 1.8 },
  ],
  finishes: [
    { id: "none", label: "No finish", add: 0 },
    { id: "spot", label: "Spot UV", add: 4 },
    { id: "foil", label: "Gold foil edge", add: 9 },
    { id: "emboss", label: "Blind emboss", add: 12 },
  ],
  qtyTiers: [
    { qty: 100, discount: 0 },
    { qty: 250, discount: 0.08 },
    { qty: 500, discount: 0.16 },
    { qty: 1000, discount: 0.24 },
  ],
};

export const CATEGORIES = [
  { slug: "cards", name: "Business Cards", blurb: "Calling cards that arrive before you do." },
  { slug: "stationery", name: "Stationery", blurb: "Letterheads, envelopes, notepads." },
  { slug: "marketing", name: "Marketing", blurb: "Brochures, flyers, posters." },
  { slug: "packaging", name: "Packaging", blurb: "Boxes, labels, wraps." },
  { slug: "books", name: "Books & Zines", blurb: "Perfect-bound, saddle-stitched, hardcover." },
  { slug: "signage", name: "Signage", blurb: "Standees, banners, foam boards." },
];

export const PRODUCTS: Product[] = [
  {
    slug: "noir-business-cards",
    name: "Noir Business Cards",
    tagline: "Pressed cotton. Foiled edges. Unmistakable.",
    category: "cards",
    basePrice: 12,
    minQty: 100,
    hero: "card",
    description:
      "A calling card carved from 600gsm pressed cotton, finished with hand-applied gold foil. A first impression that lingers long after the handshake.",
    options: defaultOptions,
  },
  {
    slug: "letterpress-cards",
    name: "Letterpress Editions",
    tagline: "Deep impressions, hand-fed press.",
    category: "cards",
    basePrice: 18,
    minQty: 100,
    hero: "press",
    description: "Heritage letterpress on Italian cotton. Each card individually pressed.",
    options: defaultOptions,
  },
  {
    slug: "studio-letterhead",
    name: "Studio Letterhead",
    tagline: "Mould-made paper. Watermark optional.",
    category: "stationery",
    basePrice: 6,
    minQty: 100,
    hero: "letter",
    description: "A4 letterhead on archival mould-made stock. For correspondence that endures.",
    options: {
      ...defaultOptions,
      sizes: [
        { id: "a4", label: "A4 — 210 × 297 mm", mult: 1 },
        { id: "us", label: "US Letter", mult: 1 },
      ],
    },
  },
  {
    slug: "monogram-envelopes",
    name: "Monogram Envelopes",
    tagline: "Lined, foiled, sealed.",
    category: "stationery",
    basePrice: 9,
    minQty: 50,
    hero: "envelope",
    description: "Pointed-flap envelopes with optional foil-stamped monogram and patterned lining.",
    options: defaultOptions,
  },
  {
    slug: "editorial-brochure",
    name: "Editorial Brochures",
    tagline: "8 pages. Saddle-stitched. Cinematic.",
    category: "marketing",
    basePrice: 32,
    minQty: 50,
    hero: "brochure",
    description: "A4 brochures with editorial-grade printing, perfect for studios and galleries.",
    options: defaultOptions,
  },
  {
    slug: "exhibition-poster",
    name: "Exhibition Posters",
    tagline: "Museum-grade pigment. A2 to A0.",
    category: "marketing",
    basePrice: 240,
    minQty: 1,
    hero: "poster",
    description: "Giclée-grade large-format prints on cotton rag. Built to be framed.",
    options: {
      ...defaultOptions,
      sizes: [
        { id: "a2", label: "A2 — 420 × 594 mm", mult: 1 },
        { id: "a1", label: "A1 — 594 × 841 mm", mult: 1.7 },
        { id: "a0", label: "A0 — 841 × 1189 mm", mult: 2.8 },
      ],
    },
  },
  {
    slug: "atelier-boxes",
    name: "Atelier Rigid Boxes",
    tagline: "Magnetic closure. Wrapped in textured paper.",
    category: "packaging",
    basePrice: 180,
    minQty: 25,
    hero: "box",
    description: "Two-piece rigid boxes wrapped in fine art paper with optional ribbon pull.",
    options: defaultOptions,
  },
  {
    slug: "private-press-book",
    name: "Private Press Book",
    tagline: "Smyth-sewn. Cloth-bound. Foil-stamped.",
    category: "books",
    basePrice: 1200,
    minQty: 10,
    hero: "book",
    description: "Hardcover books with sewn bindings and printed endpapers. Limited runs.",
    options: defaultOptions,
  },
];

export function getProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function calcPrice(p: Product, opts: {
  qty: number;
  size: string;
  paper: string;
  finish: string;
}) {
  const size = p.options.sizes.find((s) => s.id === opts.size) ?? p.options.sizes[0];
  const paper = p.options.papers.find((s) => s.id === opts.paper) ?? p.options.papers[0];
  const finish = p.options.finishes.find((s) => s.id === opts.finish) ?? p.options.finishes[0];
  const tier = [...p.options.qtyTiers].reverse().find((t) => opts.qty >= t.qty) ?? p.options.qtyTiers[0];
  const unit = (p.basePrice * size.mult * paper.mult + finish.add) * (1 - tier.discount);
  const subtotal = unit * opts.qty;
  const gst = subtotal * 0.18;
  return {
    unit: Math.round(unit * 100) / 100,
    subtotal: Math.round(subtotal),
    gst: Math.round(gst),
    total: Math.round(subtotal + gst),
    discount: tier.discount,
  };
}

export const fmtINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

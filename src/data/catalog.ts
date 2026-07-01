import cards from "@/assets/prod-cards.jpg";
import invites from "@/assets/prod-invites.jpg";
import tubes from "@/assets/prod-tubes.jpg";
import stickers from "@/assets/prod-stickers.jpg";
import brochures from "@/assets/prod-brochures.jpg";
import boxes from "@/assets/prod-boxes.jpg";
import letterhead from "@/assets/prod-letterhead.jpg";
import mug from "@/assets/prod-mug.jpg";
import posters from "@/assets/prod-posters.jpg";
import varnish from "@/assets/varnish.jpg";

export type Category = {
  slug: string;
  name: string;
  group: "Business" | "Marketing" | "Packaging" | "Invitations" | "Gifts" | "Services";
  blurb: string;
  image: string;
  productCount: number;
};

export type Product = {
  slug: string;
  name: string;
  categorySlug: string;
  price: number;
  priceLabel?: string;
  badge?: "PREMIUM" | "POPULAR" | "NEW" | "BESTSELLER";
  image: string;
  gallery: string[];
  description: string;
  specs: { label: string; value: string }[];
  materials: string[];
  sizes: string[];
  finishes: string[];
  turnaround: string;
  minQty: number;
  rating: number;
  reviewCount: number;
};

export const CATEGORIES: Category[] = [
  { slug: "business-cards",     name: "Business Cards",       group: "Business",     blurb: "Cotton stocks, foil accents, painted edges.", image: cards,     productCount: 24 },
  { slug: "letterheads",        name: "Letterheads",          group: "Business",     blurb: "Refined corporate stationery.",              image: letterhead, productCount: 12 },
  { slug: "envelopes",          name: "Envelopes",            group: "Business",     blurb: "Custom liners, wax seals, sizes.",           image: letterhead, productCount: 8  },
  { slug: "id-cards",           name: "ID Cards",             group: "Business",     blurb: "Durable PVC and lanyards.",                   image: cards,     productCount: 6  },
  { slug: "flyers",             name: "Flyers",               group: "Marketing",    blurb: "High-impact single-sheet marketing.",         image: posters,   productCount: 14 },
  { slug: "brochures",          name: "Brochures",            group: "Marketing",    blurb: "Bi-fold and tri-fold, glossy or matte.",      image: brochures, productCount: 10 },
  { slug: "posters",            name: "Posters",              group: "Marketing",    blurb: "Large format up to A0.",                       image: posters,   productCount: 9  },
  { slug: "banners",            name: "Banners",              group: "Marketing",    blurb: "Vinyl and fabric banners for events.",         image: posters,   productCount: 7  },
  { slug: "certificates",       name: "Certificates",         group: "Marketing",    blurb: "Presentation-grade certificates.",             image: letterhead, productCount: 5 },
  { slug: "stickers",           name: "Stickers",             group: "Packaging",    blurb: "Die-cut matte and gloss vinyl.",              image: stickers,  productCount: 18 },
  { slug: "labels",             name: "Labels",               group: "Packaging",    blurb: "Product and estate labels.",                   image: stickers,  productCount: 11 },
  { slug: "packaging-boxes",    name: "Packaging Boxes",      group: "Packaging",    blurb: "Rigid and folding cartons.",                   image: boxes,     productCount: 15 },
  { slug: "paper-bags",         name: "Paper Bags",           group: "Packaging",    blurb: "Kraft and premium retail bags.",               image: boxes,     productCount: 7  },
  { slug: "mailing-tubes",      name: "Mailing Tubes",        group: "Packaging",    blurb: "Bespoke architectural tubes.",                 image: tubes,     productCount: 4  },
  { slug: "wedding-invitations",name: "Wedding Invitations",  group: "Invitations",  blurb: "Heritage letterpress suites.",                image: invites,   productCount: 22 },
  { slug: "birthday-invitations",name:"Birthday Invitations", group: "Invitations",  blurb: "Playful, refined, memorable.",                image: invites,   productCount: 9  },
  { slug: "invitation-cards",   name: "Invitation Cards",     group: "Invitations",  blurb: "For every occasion.",                          image: invites,   productCount: 14 },
  { slug: "mugs",               name: "Mugs",                 group: "Gifts",        blurb: "Personalized ceramic mugs.",                   image: mug,       productCount: 8  },
  { slug: "t-shirts",           name: "T-Shirts",             group: "Gifts",        blurb: "Screen and DTG printed apparel.",              image: mug,       productCount: 6  },
  { slug: "photo-frames",       name: "Photo Frames",         group: "Gifts",        blurb: "Framed prints for the home.",                  image: mug,       productCount: 5  },
  { slug: "calendars",          name: "Calendars",            group: "Gifts",        blurb: "Desk and wall calendars.",                     image: mug,       productCount: 4  },
  { slug: "digital-printing",   name: "Digital Printing",     group: "Services",     blurb: "Short-run precision printing.",                image: varnish,   productCount: 3  },
  { slug: "offset-printing",    name: "Offset Printing",      group: "Services",     blurb: "High-volume with archival fidelity.",          image: varnish,   productCount: 3  },
  { slug: "flex-printing",      name: "Flex Printing",        group: "Services",     blurb: "Large-format outdoor and event signage.",     image: varnish,   productCount: 3  },
];

const P = (p: Product): Product => p;

export const PRODUCTS: Product[] = [
  P({
    slug: "lux-cotton-cards", name: "Lux Cotton Cards",
    categorySlug: "business-cards", price: 45, badge: "PREMIUM",
    image: cards, gallery: [cards, varnish, boxes],
    description: "600gsm triple-layer cotton cards with a hand-fed letterpress deboss and optional 24k gold foil accents. The most tactile card in our catalog — deep bite, refined edges, unforgettable first impression.",
    specs: [
      { label: "Stock", value: "600gsm triple cotton" },
      { label: "Print", value: "Letterpress deboss + optional foil" },
      { label: "Standard size", value: "89 × 55 mm" },
      { label: "Turnaround", value: "5–7 business days" },
    ],
    materials: ["Cotton 600gsm", "Cotton 350gsm", "Recycled Kraft"],
    sizes: ["Standard 89×55", "Square 65×65", "Slim 89×40"],
    finishes: ["Letterpress", "Gold Foil", "Edge Paint", "Matte"],
    turnaround: "5–7 business days",
    minQty: 50, rating: 4.9, reviewCount: 214,
  }),
  P({
    slug: "heritage-invitations", name: "Heritage Invitations",
    categorySlug: "wedding-invitations", price: 120, badge: "POPULAR",
    image: invites, gallery: [invites, cards, letterhead],
    description: "Letterpress wedding suites on 300gsm cotton, hand-tied with silk ribbon and finished with a house-blend wax seal. Optional envelope liner and RSVP card.",
    specs: [
      { label: "Suite", value: "Invitation + RSVP + Details" },
      { label: "Stock", value: "300gsm cotton" },
      { label: "Finish", value: "Letterpress + wax seal" },
      { label: "Turnaround", value: "10–14 days" },
    ],
    materials: ["Cotton 300gsm", "Vellum overlay", "Handmade paper"],
    sizes: ["A5 (148×210)", "5×7\"", "Square 150×150"],
    finishes: ["Letterpress", "Foil", "Blind Deboss", "Hand-calligraphy"],
    turnaround: "10–14 business days",
    minQty: 25, rating: 5.0, reviewCount: 96,
  }),
  P({
    slug: "bespoke-mailing-tubes", name: "Bespoke Mailing Tubes",
    categorySlug: "mailing-tubes", price: 8.5,
    image: tubes, gallery: [tubes, boxes, varnish],
    description: "Matte black rigid tubes with foil-stamped typography. Interior custom-lined; end caps in wood, metal, or coordinating card.",
    specs: [
      { label: "Wall", value: "3mm rigid board" },
      { label: "Diameter", value: "60 / 80 / 100 mm" },
      { label: "Length", value: "up to 900 mm" },
      { label: "Turnaround", value: "7–10 days" },
    ],
    materials: ["Matte black board", "Kraft", "Ivory linen"],
    sizes: ["60×300", "80×450", "100×600", "Custom"],
    finishes: ["Gold Foil", "Blind Deboss", "Screen Print"],
    turnaround: "7–10 business days",
    minQty: 25, rating: 4.8, reviewCount: 48,
  }),
  P({
    slug: "sculpted-vinyl-labels", name: "Sculpted Vinyl Labels",
    categorySlug: "stickers", price: 32,
    image: stickers, gallery: [stickers, cards],
    description: "Premium matte vinyl with intricate die-cut shapes, weatherproof and dishwasher-safe. Sheet and roll options.",
    specs: [
      { label: "Material", value: "Matte / gloss / clear vinyl" },
      { label: "Adhesive", value: "Removable or permanent" },
      { label: "Cut", value: "Die-cut, kiss-cut, sheet" },
      { label: "Turnaround", value: "4–6 days" },
    ],
    materials: ["Matte vinyl", "Gloss vinyl", "Clear vinyl", "Holographic"],
    sizes: ["2\"", "3\"", "4\"", "Custom"],
    finishes: ["Matte", "Gloss", "Soft-touch", "Holographic"],
    turnaround: "4–6 business days",
    minQty: 50, rating: 4.9, reviewCount: 512,
  }),
  P({
    slug: "editorial-brochures", name: "Editorial Brochures",
    categorySlug: "brochures", price: 68, badge: "NEW",
    image: brochures, gallery: [brochures, posters],
    description: "Tri-fold brochures on 170gsm silk stock with saturated CMYK printing. Editorial quality, in-house folding.",
    specs: [
      { label: "Stock", value: "170gsm silk / uncoated" },
      { label: "Fold", value: "Tri-fold / Bi-fold / Z-fold" },
      { label: "Size", value: "A4 → A5 finished" },
      { label: "Turnaround", value: "3–5 days" },
    ],
    materials: ["170gsm silk", "170gsm uncoated", "250gsm cover"],
    sizes: ["A4→A5", "A3→A4", "DL"],
    finishes: ["Matte", "Gloss", "Soft-touch"],
    turnaround: "3–5 business days",
    minQty: 100, rating: 4.7, reviewCount: 138,
  }),
  P({
    slug: "onyx-packaging-box", name: "Onyx Packaging Boxes",
    categorySlug: "packaging-boxes", price: 12,
    image: boxes, gallery: [boxes, tubes],
    description: "Rigid two-piece boxes wrapped in book cloth or textured paper. Interior tray and ribbon pull optional.",
    specs: [
      { label: "Construction", value: "Rigid two-piece" },
      { label: "Wrap", value: "Book cloth / textured paper" },
      { label: "Insert", value: "EVA foam / flocked tray" },
      { label: "Turnaround", value: "12–15 days" },
    ],
    materials: ["Book cloth", "Textured cover", "Uncoated"],
    sizes: ["100×100×40", "180×130×60", "240×170×80", "Custom"],
    finishes: ["Foil Stamp", "Blind Deboss", "Screen Print"],
    turnaround: "12–15 business days",
    minQty: 25, rating: 4.8, reviewCount: 72,
  }),
  P({
    slug: "atelier-letterhead", name: "Atelier Letterhead Suite",
    categorySlug: "letterheads", price: 58,
    image: letterhead, gallery: [letterhead, cards],
    description: "A4 letterhead + envelope + compliment slip on matched 120gsm laid stock. Single-color or two-color letterpress.",
    specs: [
      { label: "Set", value: "Letterhead + envelope + slip" },
      { label: "Stock", value: "120gsm laid" },
      { label: "Print", value: "1c or 2c letterpress" },
      { label: "Turnaround", value: "7–9 days" },
    ],
    materials: ["120gsm laid", "120gsm smooth", "Cotton"],
    sizes: ["A4 letterhead", "DL envelope", "1/3 A4 slip"],
    finishes: ["Letterpress", "Foil", "Digital"],
    turnaround: "7–9 business days",
    minQty: 50, rating: 4.9, reviewCount: 41,
  }),
  P({
    slug: "signature-mug", name: "Signature Ceramic Mug",
    categorySlug: "mugs", price: 18, badge: "BESTSELLER",
    image: mug, gallery: [mug],
    description: "11oz ceramic mug with sublimation print. Dishwasher and microwave safe. Full-wrap or single-side print.",
    specs: [
      { label: "Volume", value: "11oz / 330ml" },
      { label: "Print", value: "Sublimation" },
      { label: "Wash", value: "Dishwasher safe" },
      { label: "Turnaround", value: "3–4 days" },
    ],
    materials: ["Ceramic white", "Ceramic black interior", "Matte"],
    sizes: ["11oz", "15oz"],
    finishes: ["Gloss", "Matte"],
    turnaround: "3–4 business days",
    minQty: 12, rating: 4.6, reviewCount: 289,
  }),
  P({
    slug: "gallery-poster", name: "Gallery Poster Print",
    categorySlug: "posters", price: 24,
    image: posters, gallery: [posters, brochures],
    description: "Museum-grade poster prints on 200gsm matte or satin. Sizes up to A0.",
    specs: [
      { label: "Stock", value: "200gsm matte / satin" },
      { label: "Ink", value: "Pigment archival" },
      { label: "Max size", value: "A0 (841×1189)" },
      { label: "Turnaround", value: "3–5 days" },
    ],
    materials: ["200gsm matte", "200gsm satin", "260gsm fine art"],
    sizes: ["A3", "A2", "A1", "A0"],
    finishes: ["Matte", "Satin", "Fine art"],
    turnaround: "3–5 business days",
    minQty: 1, rating: 4.8, reviewCount: 176,
  }),
];

export const TESTIMONIALS = [
  { quote: "The tactile quality is beyond anything we've held. Our clients notice immediately.", name: "Amara Okoye", role: "Creative Director, Vessel Studio" },
  { quote: "From proof to delivery, five days. And the foil is a dream.", name: "Julian Vance", role: "Founder, Aeris Botanicals" },
  { quote: "Metier turned our brand from a logo into an object. That's the point.", name: "Priya Menon", role: "Head of Brand, Halide Press" },
];

export const FAQS = [
  { q: "Can I request a physical sample pack?", a: "Yes. Every new client can order a complimentary sample pack of our five most-used stocks. Request from Help & Support." },
  { q: "What file format should I upload?", a: "PDF/X-1a is preferred, with 3mm bleed and fonts embedded. We also accept AI, INDD, and high-res PSD." },
  { q: "How does the price calculator work?", a: "Prices update live as you configure stock, size, finish, and quantity. A specialist reviews every order before production." },
  { q: "Do you ship internationally?", a: "We ship worldwide via DHL Express. Rush and standard options are available at checkout." },
  { q: "Can I get a custom quote for large runs?", a: "Absolutely — submit the Quote Request form and we'll respond within one business day with a tailored proposal." },
  { q: "What is your return policy?", a: "Because every order is bespoke, we reprint at no charge if we've missed spec — see our Refund Policy for details." },
];

export const groupedCategories = () => {
  const groups: Record<string, Category[]> = {};
  for (const c of CATEGORIES) (groups[c.group] ??= []).push(c);
  return groups;
};

export const getProduct = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const getCategory = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
export const productsByCategory = (slug: string) => PRODUCTS.filter((p) => p.categorySlug === slug);
export const relatedProducts = (slug: string, categorySlug: string) =>
  PRODUCTS.filter((p) => p.slug !== slug && p.categorySlug === categorySlug).slice(0, 4);

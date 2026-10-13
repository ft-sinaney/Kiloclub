/**
 * Sample catalogue. The store shows this when Supabase isn't configured yet
 * (handy for previewing), and `supabase/seed.sql` is generated from it.
 * Prices here are placeholders — set real ones from the admin panel.
 */
import type { Brand, Category, Highlight, Product, Variant } from "./types";

export const demoCategories: Category[] = [
  { id: "cat-proteins", name: "Proteins", slug: "proteins", description: "Build muscle", image_url: null, sort_order: 1 },
  { id: "cat-creatine", name: "Creatine", slug: "creatine", description: "More strength", image_url: null, sort_order: 2 },
  { id: "cat-pre-workout", name: "Pre-Workout", slug: "pre-workout", description: "Explosive energy", image_url: null, sort_order: 3 },
  { id: "cat-bcaas", name: "BCAAs", slug: "bcaas", description: "Faster recovery", image_url: null, sort_order: 4 },
  { id: "cat-vitamins", name: "Vitamins", slug: "vitamins", description: "Better health", image_url: null, sort_order: 5 },
  { id: "cat-accessories", name: "Accessories", slug: "accessories", description: "Gym essentials", image_url: null, sort_order: 6 },
];

export const demoBrands: Brand[] = [
  { id: "brand-on", name: "Optimum Nutrition", slug: "optimum-nutrition", logo_url: null },
  { id: "brand-mb", name: "MuscleBlaze", slug: "muscleblaze", logo_url: null },
  { id: "brand-mt", name: "MuscleTech", slug: "muscletech", logo_url: null },
  { id: "brand-mp", name: "MyProtein", slug: "myprotein", logo_url: null },
  { id: "brand-cellucor", name: "Cellucor", slug: "cellucor", logo_url: null },
  { id: "brand-scivation", name: "Scivation", slug: "scivation", logo_url: null },
  { id: "brand-kc", name: "Kilo Club", slug: "kilo-club", logo_url: null },
];

interface DemoProductInput {
  slug: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  highlights?: Highlight[];
  badge?: string;
  featured?: boolean;
  /** size → [price, mrp] */
  sizes: [string, number, number | null][];
  flavours?: string[];
}

const inputs: DemoProductInput[] = [
  {
    slug: "on-gold-standard-whey",
    name: "Gold Standard 100% Whey",
    brand: "optimum-nutrition",
    category: "proteins",
    description:
      "High-quality whey protein isolate and concentrate blend to support muscle growth and recovery. Mixes easily, tastes great.",
    highlights: [
      { label: "Protein", value: "24g" },
      { label: "BCAAs", value: "5.5g" },
      { label: "Glutamine", value: "4g" },
    ],
    badge: "Bestseller",
    featured: true,
    sizes: [["1 kg", 3499, 3999], ["2 kg", 6499, 7499]],
    flavours: ["Double Rich Chocolate", "Vanilla Ice Cream", "Strawberry"],
  },
  {
    slug: "muscleblaze-creatine-monohydrate",
    name: "Creatine Monohydrate",
    brand: "muscleblaze",
    category: "creatine",
    description: "Micronised creatine monohydrate for more strength, power and better workout performance.",
    highlights: [
      { label: "Creatine", value: "3g" },
      { label: "Servings", value: "83" },
    ],
    featured: true,
    sizes: [["100 g", 499, 699], ["250 g", 899, 1199]],
    flavours: ["Unflavoured"],
  },
  {
    slug: "muscletech-nitro-tech-whey",
    name: "Nitro-Tech Whey Protein",
    brand: "muscletech",
    category: "proteins",
    description: "Whey protein with added creatine for lean muscle and strength gains.",
    highlights: [
      { label: "Protein", value: "30g" },
      { label: "Creatine", value: "3g" },
      { label: "BCAAs", value: "6.6g" },
    ],
    featured: true,
    sizes: [["1 kg", 2999, 3499], ["2 kg", 5999, 6999]],
    flavours: ["Milk Chocolate", "Cookies & Cream"],
  },
  {
    slug: "myprotein-impact-whey",
    name: "Impact Whey Protein",
    brand: "myprotein",
    category: "proteins",
    description: "Everyday whey protein with 21g of protein per serving. Great value for daily use.",
    highlights: [
      { label: "Protein", value: "21g" },
      { label: "BCAAs", value: "4.5g" },
    ],
    featured: true,
    sizes: [["1 kg", 2799, 3299], ["2.5 kg", 4999, 5999]],
    flavours: ["Chocolate Smooth", "Vanilla"],
  },
  {
    slug: "cellucor-c4-original",
    name: "C4 Original Pre-Workout",
    brand: "cellucor",
    category: "pre-workout",
    description: "Explosive energy, focus and endurance for intense training sessions.",
    highlights: [
      { label: "Caffeine", value: "150mg" },
      { label: "Beta-Alanine", value: "1.6g" },
    ],
    featured: true,
    sizes: [["30 servings", 2199, 2799]],
    flavours: ["Fruit Punch", "Icy Blue Razz"],
  },
  {
    slug: "scivation-xtend-bcaa",
    name: "Xtend Original BCAA",
    brand: "scivation",
    category: "bcaas",
    description: "7g of BCAAs in a 2:1:1 ratio plus electrolytes for faster recovery.",
    highlights: [
      { label: "BCAAs", value: "7g" },
      { label: "Sugar", value: "0g" },
    ],
    featured: true,
    sizes: [["30 servings", 1899, 2299]],
    flavours: ["Mango", "Watermelon"],
  },
  {
    slug: "on-micronized-creatine",
    name: "Micronized Creatine Powder",
    brand: "optimum-nutrition",
    category: "creatine",
    description: "Pure creatine monohydrate to support power and performance.",
    highlights: [{ label: "Creatine", value: "3g" }],
    sizes: [["250 g", 1349, 1599]],
  },
  {
    slug: "muscleblaze-pre-workout-300",
    name: "Pre Workout 300",
    brand: "muscleblaze",
    category: "pre-workout",
    description: "Pre-workout for energy, pump and focus.",
    highlights: [{ label: "Caffeine", value: "300mg" }],
    sizes: [["250 g", 999, 1299]],
    flavours: ["Green Apple", "Fruit Fury"],
  },
  {
    slug: "on-opti-men",
    name: "Opti-Men Multivitamin",
    brand: "optimum-nutrition",
    category: "vitamins",
    description: "Multivitamin built for active men, with 75+ active ingredients.",
    highlights: [{ label: "Tablets", value: "90" }],
    featured: true,
    sizes: [["90 tablets", 1799, 2099]],
  },
  {
    slug: "muscleblaze-multivitamin",
    name: "MB-Vite Daily Multivitamin",
    brand: "muscleblaze",
    category: "vitamins",
    description: "Daily multivitamin for immunity, energy and overall health.",
    highlights: [{ label: "Tablets", value: "60" }],
    sizes: [["60 tablets", 449, 599]],
  },
  {
    slug: "kilo-club-shaker",
    name: "Kilo Club Shaker Bottle",
    brand: "kilo-club",
    category: "accessories",
    description: "Leak-proof shaker with mixing ball. Fight for fitness.",
    highlights: [{ label: "Capacity", value: "700ml" }],
    badge: "New",
    featured: true,
    sizes: [["700 ml", 349, 499]],
  },
];

function buildDemoProducts(): Product[] {
  return inputs.map((input, index) => {
    const id = `prod-${input.slug}`;
    const flavours = input.flavours?.length ? input.flavours : [null];
    const variants: Variant[] = [];
    let order = 0;
    for (const [size, price, mrp] of input.sizes) {
      for (const flavour of flavours) {
        variants.push({
          id: `${id}-v${order}`,
          product_id: id,
          size,
          flavour,
          price,
          mrp,
          in_stock: true,
          sort_order: order++,
        });
      }
    }
    const brand = demoBrands.find((b) => b.slug === input.brand) ?? null;
    const category = demoCategories.find((c) => c.slug === input.category) ?? null;
    return {
      id,
      name: input.name,
      slug: input.slug,
      brand_id: brand?.id ?? null,
      category_id: category?.id ?? null,
      description: input.description,
      highlights: input.highlights ?? [],
      images: [],
      badge: input.badge ?? null,
      is_active: true,
      is_featured: input.featured ?? false,
      created_at: new Date(Date.UTC(2026, 0, 1 + index)).toISOString(),
      brand,
      category,
      variants,
    };
  });
}

export const demoProducts: Product[] = buildDemoProducts();

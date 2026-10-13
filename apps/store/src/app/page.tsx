import Link from "next/link";
import { ArrowRight, BadgeCheck, MessageCircle, ShieldCheck, ShoppingBag, Users } from "lucide-react";
import { bestDiscount, whatsappLink } from "@kiloclub/shared";
import { BestSellers } from "@/components/best-sellers";
import { CategoryIcon } from "@/components/category-icon";
import { WhatsAppIcon } from "@/components/icons";
import { ProductImage } from "@/components/product-image";
import { SectionHeader } from "@/components/section-header";
import { getBrands, getCategories, getProducts, getSettings } from "@/lib/catalog";

export default async function HomePage() {
  const [products, categories, brands, settings] = await Promise.all([
    getProducts(),
    getCategories(),
    getBrands(),
    getSettings(),
  ]);
  const featured = products.filter((p) => p.is_featured);
  const bestSellers = featured.length > 0 ? featured : products;
  const offers = products.filter((p) => bestDiscount(p) > 0);
  const maxOff = Math.max(0, ...offers.map(bestDiscount));
  const offerShowcase = offers.slice(0, 3);
  const brandsInUse = brands.filter((b) => products.some((p) => p.brand_id === b.id));

  return (
    <>
      {/* Hero */}
      <section className="noise relative overflow-hidden border-b border-ink-800">
        <div className="hero-glow absolute inset-0" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,transparent_55%,rgba(239,185,53,0.05)_55%,transparent_70%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.1fr_1fr] md:py-20 lg:py-24">
          <div className="order-2 md:order-1">
            <p className="text-xs font-semibold tracking-[0.35em] text-gold-400 uppercase">Premium supplements</p>
            <h1 className="mt-4 font-display text-[3.4rem] leading-[0.92] text-white uppercase sm:text-7xl lg:text-8xl">
              Fight for
              <br />
              <span className="text-gold">fitness</span>
            </h1>
            <p className="mt-5 max-w-md text-base text-ink-300 sm:text-lg">
              Discipline builds a stronger you. Fuel your workouts with genuine supplements from brands you trust.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="btn-gold px-7">
                Shop now <ArrowRight className="size-4" />
              </Link>
              <a
                href={whatsappLink(settings.whatsapp_number, "Heyy, I need help choosing a supplement.")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline px-6"
              >
                <WhatsAppIcon className="size-4 text-whatsapp" /> Ask on WhatsApp
              </a>
            </div>
            <ul className="mt-10 grid max-w-lg grid-cols-3 gap-4">
              {[
                { icon: BadgeCheck, label: "100% authentic products" },
                { icon: MessageCircle, label: "Quick replies on WhatsApp" },
                { icon: Users, label: "Trusted by lifters" },
              ].map(({ icon: Icon, label }) => (
                <li key={label} className="flex flex-col gap-2 text-xs leading-snug text-ink-300 sm:flex-row sm:items-center">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full border border-gold-500/40 text-gold-400">
                    <Icon className="size-4" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative order-1 mx-auto w-full max-w-[300px] sm:max-w-[400px] md:order-2 md:max-w-[480px]">
            <div className="absolute inset-[8%] rounded-full bg-gold-500/20 blur-3xl" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.webp"
              alt="Kilo Club — Fight for Fitness"
              width={640}
              height={505}
              fetchPriority="high"
              className="animate-float relative w-full drop-shadow-[0_20px_50px_rgba(217,157,28,0.35)]"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Categories */}
        <section className="pt-14" id="categories">
          <SectionHeader title="Shop by category" href="/shop" />
          <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:grid-cols-6">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/shop?category=${c.slug}`}
                className="group card relative flex flex-col items-center gap-3 overflow-hidden px-2 py-5 text-center transition hover:-translate-y-0.5 hover:border-gold-500/60 sm:items-start sm:px-5 sm:text-left"
              >
                <div className="absolute -top-10 -right-10 size-28 rounded-full bg-gold-500/5 transition group-hover:bg-gold-500/15" />
                {c.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.image_url} alt="" className="size-14 rounded-xl object-cover" />
                ) : (
                  <span className="grid size-12 place-items-center rounded-xl border border-gold-500/30 bg-ink-900 text-gold-400 sm:size-14">
                    <CategoryIcon slug={c.slug} className="size-6 sm:size-7" />
                  </span>
                )}
                <span>
                  <span className="block text-sm font-semibold text-white">{c.name}</span>
                  {c.description && <span className="mt-0.5 hidden text-xs text-ink-400 sm:block">{c.description}</span>}
                </span>
                <ArrowRight className="absolute right-4 bottom-5 hidden size-4 text-ink-500 transition group-hover:text-gold-400 sm:block" />
              </Link>
            ))}
          </div>
        </section>

        {/* Best sellers */}
        {bestSellers.length > 0 && (
          <section className="pt-16">
            <SectionHeader title="Best sellers" href="/shop" />
            <BestSellers products={bestSellers} categories={categories} />
          </section>
        )}

        {/* Offers + how it works */}
        <section className="grid gap-4 pt-16 lg:grid-cols-[1.4fr_1fr]">
          <div className="relative overflow-hidden rounded-2xl border border-gold-500/30 bg-[linear-gradient(120deg,#17130a_0%,#0c0c0e_60%)] p-6 sm:p-8">
            <div className="absolute -top-20 -left-20 size-64 rounded-full bg-gold-500/10 blur-3xl" />
            <div className="relative grid items-center gap-6 sm:grid-cols-[1fr_auto]">
              <div>
                <p className="text-xs font-semibold tracking-[0.3em] text-gold-400 uppercase">Offers & deals</p>
                <h2 className="mt-3 font-display text-4xl leading-none text-white uppercase sm:text-5xl">
                  Save more.
                  <br />
                  <span className="text-gold">Lift heavier.</span>
                </h2>
                <p className="mt-3 text-sm text-ink-300">
                  {maxOff > 0 ? `Up to ${maxOff}% off on selected supplements.` : "Ask us about current deals and stacks."}
                </p>
                <Link href="/shop?offers=1" className="btn-gold mt-6 py-2.5">
                  View offers <ArrowRight className="size-4" />
                </Link>
              </div>
              {offerShowcase.length > 0 && (
                <div className="hidden -space-x-10 sm:flex">
                  {offerShowcase.map((p, i) => (
                    <ProductImage
                      key={p.id}
                      product={p}
                      className={`h-36 w-28 drop-shadow-2xl ${i === 1 ? "relative z-10 -translate-y-3 scale-110" : ""}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card p-6 sm:p-8">
            <p className="text-xs font-semibold tracking-[0.3em] text-gold-400 uppercase">How it works</p>
            <ol className="mt-5 space-y-5">
              {[
                { icon: ShoppingBag, title: "Pick your products", text: "Choose the size and flavour, or add several items to your cart." },
                { icon: WhatsAppIcon, title: "Tap enquire", text: "WhatsApp opens with your order typed in — just hit send." },
                { icon: ShieldCheck, title: "We confirm", text: "We reply with availability and the final price." },
              ].map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="flex gap-4">
                  <span className="bg-gold grid size-10 shrink-0 place-items-center rounded-full text-ink-950">
                    <Icon className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {i + 1}. {title}
                    </p>
                    <p className="mt-0.5 text-sm text-ink-400">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Brands */}
        {brandsInUse.length > 0 && (
          <section className="pt-16">
            <div className="card px-6 py-8">
              <p className="text-center text-xs font-semibold tracking-[0.3em] text-ink-400 uppercase">
                Authentic brands · trusted nutrition
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
                {brandsInUse.map((b) => (
                  <Link key={b.id} href={`/shop?brand=${b.slug}`} className="text-ink-300 transition hover:text-gold-300">
                    {b.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.logo_url} alt={b.name} className="h-8 w-auto opacity-80 grayscale hover:opacity-100 hover:grayscale-0" />
                    ) : (
                      <span className="font-display text-xl tracking-wider uppercase sm:text-2xl">{b.name}</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}

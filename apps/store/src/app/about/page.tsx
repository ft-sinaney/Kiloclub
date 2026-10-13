import type { Metadata } from "next";
import Link from "next/link";
import { whatsappLink } from "@kiloclub/shared";
import { WhatsAppIcon } from "@/components/icons";
import { getSettings } from "@/lib/catalog";

export const metadata: Metadata = { title: "About us" };

export default async function AboutPage() {
  const settings = await getSettings();
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="grid items-center gap-10 md:grid-cols-[1fr_280px]">
        <div>
          <p className="text-xs font-semibold tracking-[0.3em] text-gold-400 uppercase">About Kilo Club</p>
          <h1 className="mt-3 font-display text-5xl leading-none text-white uppercase sm:text-6xl">
            Fight for <span className="text-gold">fitness</span>
          </h1>
          <div className="mt-6 space-y-4 text-ink-300">
            <p>
              Kilo Club is built for people who show up and put in the work. We stock genuine supplements from
              brands lifters trust — protein, creatine, pre-workout, BCAAs, vitamins and gym essentials.
            </p>
            <p>
              Not sure what you need? Message us. We&apos;ll help you pick the right product for your goal and
              confirm the latest price and availability before you buy.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className="btn-gold">Shop supplements</Link>
            <a href={whatsappLink(settings.whatsapp_number, "Heyy, I have a question about your supplements.")} target="_blank" rel="noopener noreferrer" className="btn-outline">
              <WhatsAppIcon className="size-4 text-whatsapp" /> Chat with us
            </a>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.webp" alt="Kilo Club logo" width={640} height={505} className="mx-auto w-full max-w-[280px] drop-shadow-[0_20px_50px_rgba(217,157,28,0.3)]" />
      </div>
    </div>
  );
}

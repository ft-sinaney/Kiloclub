import Link from "next/link";
import { whatsappLink, type Category, type SiteSettings } from "@kiloclub/shared";
import { WhatsAppIcon } from "./icons";
import { Logo } from "./logo";

export function Footer({ settings, categories }: { settings: SiteSettings; categories: Category[] }) {
  const phone = settings.whatsapp_number.replace(/\D/g, "");
  const pretty = phone.startsWith("91") && phone.length === 12 ? `+91 ${phone.slice(2, 7)} ${phone.slice(7)}` : `+${phone}`;
  return (
    <footer className="mt-20 border-t border-ink-800 bg-ink-900">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-400">
            Genuine supplements for people who train hard. Pick your products, tap enquire, and we&apos;ll confirm
            availability and price on WhatsApp.
          </p>
          <a
            href={whatsappLink(phone, "Heyy, I have a question about your supplements.")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp mt-5 py-2.5"
          >
            <WhatsAppIcon /> Chat on WhatsApp
          </a>
        </div>
        <div>
          <h3 className="text-xs font-semibold tracking-[0.2em] text-gold-400 uppercase">Shop</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {categories.slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link href={`/shop?category=${c.slug}`} className="text-ink-300 hover:text-gold-300">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold tracking-[0.2em] text-gold-400 uppercase">Kilo Club</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/about" className="text-ink-300 hover:text-gold-300">About us</Link></li>
            <li><Link href="/shop?offers=1" className="text-ink-300 hover:text-gold-300">Offers</Link></li>
            <li><Link href="/account" className="text-ink-300 hover:text-gold-300">My account</Link></li>
            <li><Link href="/cart" className="text-ink-300 hover:text-gold-300">Cart</Link></li>
            <li className="pt-2 text-ink-400">WhatsApp: <span className="text-ink-200">{pretty}</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} Kilo Club. Fight for fitness.</p>
          <p className="text-gold-300/80">{settings.price_notice}</p>
        </div>
      </div>
    </footer>
  );
}

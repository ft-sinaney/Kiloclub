import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <p className="text-gold font-display text-7xl">404</p>
      <h1 className="mt-4 text-xl font-semibold text-white">We couldn&apos;t find that page</h1>
      <p className="mt-2 text-sm text-ink-400">The product may have been removed or the link is wrong.</p>
      <Link href="/shop" className="btn-gold mt-8">Browse supplements</Link>
    </div>
  );
}

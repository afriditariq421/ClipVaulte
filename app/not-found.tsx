import Link from "next/link";

export default function NotFound() {
  return (
    <section className="py-24">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-ember">404</p>
      <h1 className="mt-3 font-display text-5xl font-bold">Nothing here.</h1>
      <Link href="/" className="mt-8 inline-block border-2 border-ink px-5 py-3 font-mono text-xs uppercase tracking-widest hover:bg-ink hover:text-paper">
        Back to the inspector
      </Link>
    </section>
  );
}

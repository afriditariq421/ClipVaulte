import type { Metadata } from "next";
import Link from "next/link";
import { site, siteUrl } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: `${site.name} | Public video link inspector`, template: `%s | ${site.name}` },
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: { title: site.name, description: site.description, type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-5 sm:px-8">
          <header className="flex items-center justify-between border-b-2 border-ink py-5">
            <Link href="/" className="flex items-baseline gap-2">
              <span className="font-display text-2xl font-bold italic tracking-tight">{site.name}</span>
              <span className="hidden font-mono text-[11px] uppercase tracking-[0.2em] text-moss sm:inline">
                link inspector
              </span>
            </Link>
            <nav className="flex gap-5 font-mono text-xs uppercase tracking-widest">
              <Link href="/privacy" className="hover:text-ember">Privacy</Link>
              <Link href="/terms" className="hover:text-ember">Terms</Link>
            </nav>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="flex flex-col gap-2 border-t border-ink/20 py-6 font-mono text-[11px] uppercase tracking-widest text-ink/60 sm:flex-row sm:justify-between">
            <span>© {new Date().getFullYear()} {site.name}</span>
            <span>Not affiliated with YouTube, TikTok or Instagram</span>
          </footer>
        </div>
      </body>
    </html>
  );
}

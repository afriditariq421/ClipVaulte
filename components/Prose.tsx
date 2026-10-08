export function Prose({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <article className="max-w-2xl py-14">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-ember">Draft · updated {updated}</p>
      <h1 className="mt-3 font-display text-5xl font-bold tracking-tight">{title}</h1>
      <div className="mt-8 space-y-5 leading-relaxed text-ink/80 [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-ink">
        {children}
      </div>
    </article>
  );
}

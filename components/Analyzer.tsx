"use client";

import { useState, type FormEvent } from "react";
import clsx from "clsx";
import { ArrowRight, ExternalLink, Loader2, ShieldCheck, TriangleAlert } from "lucide-react";
import type { VideoMetadata } from "@/lib/oembed";
import { PLATFORMS } from "@/lib/platform";

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "done"; data: VideoMetadata };

export function Analyzer() {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!url.trim() || state.kind === "loading") return;
    setState({ kind: "loading" });
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const body = (await res.json().catch(() => ({}))) as { data?: VideoMetadata; error?: string };
      if (!res.ok || !body.data) {
        setState({ kind: "error", message: body.error ?? "Something went wrong. Try again." });
        return;
      }
      setState({ kind: "done", data: body.data });
    } catch {
      setState({ kind: "error", message: "Network error. Check your connection and try again." });
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row" noValidate>
        <label htmlFor="video-url" className="sr-only">Video link</label>
        <input
          id="video-url"
          type="url"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          placeholder="https://www.youtube.com/watch?v=…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          maxLength={2048}
          className="min-w-0 flex-1 border-2 border-ink bg-paper px-4 py-4 font-mono text-sm shadow-[4px_4px_0_0_var(--color-ink)] outline-none placeholder:text-ink/40 focus:shadow-[4px_4px_0_0_var(--color-ember)]"
        />
        <button
          type="submit"
          disabled={state.kind === "loading" || !url.trim()}
          className="group flex items-center justify-center gap-2 border-2 border-ink bg-ink px-6 py-4 font-mono text-sm uppercase tracking-widest text-paper transition hover:bg-ember hover:border-ember disabled:cursor-not-allowed disabled:opacity-50"
        >
          {state.kind === "loading" ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden />
          )}
          Inspect
        </button>
      </form>

      <div aria-live="polite" className="mt-8 min-h-8">
        {state.kind === "error" && (
          <p className="rise flex items-start gap-2 border-l-4 border-ember bg-ember/10 px-4 py-3 text-sm">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-ember" aria-hidden />
            {state.message}
          </p>
        )}
        {state.kind === "done" && <Result data={state.data} />}
      </div>
    </div>
  );
}

function Result({ data }: { data: VideoMetadata }) {
  return (
    <article className="rise grid gap-0 border-2 border-ink bg-paper shadow-[8px_8px_0_0_var(--color-ink)] sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className="relative aspect-video bg-ink sm:aspect-auto sm:min-h-56">
        {data.thumbnail ? (
          // Plain <img>: thumbnail hosts are allowlisted server-side and in the CSP.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.thumbnail} alt="" className="absolute inset-0 size-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <div className="absolute inset-0 grid place-items-center font-mono text-xs uppercase tracking-widest text-paper/50">
            No thumbnail
          </div>
        )}
        <span className="absolute left-3 top-3 bg-ember px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-paper">
          {PLATFORMS[data.platform].label}
        </span>
      </div>
      <div className="flex flex-col gap-4 border-t-2 border-ink p-6 sm:border-l-2 sm:border-t-0">
        <h2 className="font-display text-2xl font-bold leading-tight">{data.title}</h2>
        {data.author && (
          <p className="font-mono text-xs uppercase tracking-widest text-moss">
            by{" "}
            {data.authorUrl ? (
              <a href={data.authorUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-ember underline-offset-4">
                {data.author}
              </a>
            ) : (
              data.author
            )}
          </p>
        )}
        <a
          href={data.url}
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(
            "inline-flex w-fit items-center gap-2 border-2 border-ink px-4 py-2 font-mono text-xs uppercase tracking-widest transition hover:bg-ink hover:text-paper",
          )}
        >
          Open on {PLATFORMS[data.platform].label} <ExternalLink className="size-3.5" aria-hidden />
        </a>
        <p className="mt-auto flex items-start gap-2 border-t border-dashed border-ink/30 pt-4 text-xs leading-relaxed text-ink/70">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-moss" aria-hidden />
          File downloads are disabled on this site. Details come from the platform&apos;s official oEmbed API, which provides metadata only.
        </p>
      </div>
    </article>
  );
}

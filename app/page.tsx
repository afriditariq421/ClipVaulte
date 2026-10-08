import { Analyzer } from "@/components/Analyzer";
import { site } from "@/lib/site";

const steps = [
  { n: "01", title: "Paste", body: "Drop in a public YouTube, Shorts, TikTok or Instagram post link." },
  { n: "02", title: "Verify", body: "The link is checked against a strict allowlist and rebuilt into its canonical form." },
  { n: "03", title: "Inspect", body: "Title, creator and thumbnail come straight from the platform's official oEmbed API." },
];

const faqs = [
  {
    q: "Can I download the video file?",
    a: "Not on this site. Official platform APIs only expose metadata, and saving other people's videos can break platform terms and copyright law. You get the details and a clean link back to the original.",
  },
  {
    q: "Which links work?",
    a: "youtube.com/watch, youtu.be, /shorts and /live links; tiktok.com/@user/video/… links; and instagram.com /p, /reel and /tv links when the site operator has configured Instagram access.",
  },
  {
    q: "What about private videos?",
    a: `${site.name} never uses cookies or logins, so private, unlisted-with-restrictions and login-gated content is out of reach by design.`,
  },
];

export default function Home() {
  return (
    <>
      <section className="grid gap-10 py-14 sm:py-20">
        <div className="rise max-w-3xl">
          <p className="mb-5 font-mono text-xs uppercase tracking-[0.25em] text-ember">YouTube · TikTok · Instagram</p>
          <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-tight sm:text-7xl">
            Paste a link.
            <br />
            <span className="italic text-moss">See what&apos;s behind it.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/75">{site.description}</p>
        </div>
        <div className="rise [animation-delay:120ms]">
          <Analyzer />
        </div>
      </section>

      <section className="grid gap-px border-2 border-ink bg-ink sm:grid-cols-3" aria-label="How it works">
        {steps.map((s) => (
          <div key={s.n} className="bg-paper p-6">
            <span className="font-mono text-xs text-ember">{s.n}</span>
            <h3 className="mt-2 font-display text-2xl font-bold">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/70">{s.body}</p>
          </div>
        ))}
      </section>

      <section className="py-16" aria-labelledby="faq">
        <h2 id="faq" className="font-display text-3xl font-bold">Questions</h2>
        <div className="mt-6 divide-y divide-ink/20 border-y border-ink/20">
          {faqs.map((f) => (
            <details key={f.q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                {f.q}
                <span className="font-mono text-ember transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/70">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}

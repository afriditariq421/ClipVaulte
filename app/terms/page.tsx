import type { Metadata } from "next";
import { Prose } from "@/components/Prose";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Terms & acceptable use", alternates: { canonical: "/terms" } };

export default function Terms() {
  return (
    <Prose title="Terms & acceptable use" updated="October 2026">
      <p>By using {site.name} you agree to these terms. This is a draft and should be reviewed by a lawyer.</p>
      <h2>The service</h2>
      <p>
        {site.name} displays publicly available metadata for public video links using official platform APIs. It
        doesn&apos;t host, copy or redistribute video files. It&apos;s provided as-is, without warranty.
      </p>
      <h2>Acceptable use</h2>
      <p>
        Don&apos;t use the service to scrape at scale, get around rate limits, or infringe anyone&apos;s rights. Respect the
        terms of YouTube, TikTok and Instagram and the rights of creators.
      </p>
      <h2>Trademarks</h2>
      <p>
        YouTube, TikTok and Instagram are trademarks of their respective owners. {site.name} isn&apos;t affiliated with or
        endorsed by them.
      </p>
      <h2>Contact</h2>
      <p>
        Rights holders and other enquiries:{" "}
        <a className="underline decoration-ember underline-offset-4" href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
      </p>
    </Prose>
  );
}

import type { Metadata } from "next";
import { Prose } from "@/components/Prose";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy", alternates: { canonical: "/privacy" } };

export default function Privacy() {
  return (
    <Prose title="Privacy" updated="October 2026">
      <p>
        {site.name} is built to collect as little as possible. This is a draft and should be reviewed by a lawyer before
        you rely on it.
      </p>
      <h2>What we process</h2>
      <p>
        When you inspect a link, the link is sent to our server, rebuilt into its canonical form and forwarded to the
        relevant platform&apos;s public oEmbed endpoint. We don&apos;t store the link or the result.
      </p>
      <p>
        Your IP address is used briefly, in memory, to rate-limit abuse. Standard hosting logs may record requests for
        a short period.
      </p>
      <h2>What we don&apos;t do</h2>
      <p>No accounts, no tracking cookies, no advertising profiles, and no selling of data.</p>
      <h2>Third parties</h2>
      <p>
        Thumbnails load directly from YouTube, TikTok or Instagram servers, which may see your IP address. Their own
        privacy policies apply.
      </p>
      <h2>Contact</h2>
      <p>
        Questions: <a className="underline decoration-ember underline-offset-4" href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
      </p>
    </Prose>
  );
}

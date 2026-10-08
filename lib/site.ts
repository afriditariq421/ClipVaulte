// Rebrand here (and via NEXT_PUBLIC_SITE_NAME).
export const site = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "ClipVault",
  tagline: "Paste a public video link. Get the clean details.",
  description:
    "ClipVault reads public YouTube, TikTok and Instagram links and shows the title, creator and thumbnail using each platform's official oEmbed endpoint.",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@example.com",
};

/** Public origin without trailing slash. Netlify sets URL in production; SITE_URL overrides it. */
export function siteUrl(): string {
  const raw = process.env.SITE_URL || process.env.URL || "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

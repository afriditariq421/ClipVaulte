import type { ParsedVideo, PlatformId } from "./platform";

export type VideoMetadata = {
  platform: PlatformId;
  url: string;
  title: string;
  author: string | null;
  authorUrl: string | null;
  thumbnail: string | null;
};

export type MetadataResult =
  | { ok: true; data: VideoMetadata }
  | { ok: false; status: number; error: string };

// Must stay in sync with img-src in next.config.ts.
const THUMB_HOST_SUFFIXES = [
  ".ytimg.com",
  ".tiktokcdn.com",
  ".tiktokcdn-us.com",
  ".cdninstagram.com",
  ".fbcdn.net",
  ".googleusercontent.com",
  ".ggpht.com",
];

export function safeThumbnail(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 4096) return null;
  try {
    const u = new URL(value);
    if (u.protocol !== "https:" || u.username || u.password || u.port) return null;
    return THUMB_HOST_SUFFIXES.some((s) => u.hostname.endsWith(s)) ? u.toString() : null;
  } catch {
    return null;
  }
}

function safeHttpsUrl(value: unknown, allowedHosts: string[]): string | null {
  if (typeof value !== "string") return null;
  try {
    const u = new URL(value);
    return u.protocol === "https:" && allowedHosts.includes(u.hostname) ? u.toString() : null;
  } catch {
    return null;
  }
}

function text(value: unknown, max = 300): string | null {
  if (typeof value !== "string") return null;
  const t = value.replace(/\s+/g, " ").trim();
  return t ? t.slice(0, max) : null;
}

function endpoint(video: ParsedVideo): string | null {
  const url = encodeURIComponent(video.canonicalUrl);
  switch (video.platform) {
    case "youtube":
      return `https://www.youtube.com/oembed?format=json&url=${url}`;
    case "tiktok":
      return `https://www.tiktok.com/oembed?url=${url}`;
    case "instagram": {
      const token = process.env.INSTAGRAM_OEMBED_TOKEN;
      if (!token) return null;
      return `https://graph.facebook.com/v21.0/instagram_oembed?omitscript=true&url=${url}&access_token=${encodeURIComponent(token)}`;
    }
  }
}

const AUTHOR_HOSTS: Record<PlatformId, string[]> = {
  youtube: ["www.youtube.com", "youtube.com"],
  tiktok: ["www.tiktok.com", "tiktok.com"],
  instagram: ["www.instagram.com", "instagram.com"],
};

/** Calls the platform's fixed public oEmbed endpoint. Never forwards user input except the rebuilt URL. */
export async function fetchOEmbed(video: ParsedVideo): Promise<MetadataResult> {
  const target = endpoint(video);
  if (!target) {
    return { ok: false, status: 501, error: "Instagram lookups aren't configured on this site yet." };
  }
  const timeout = Number(process.env.PROVIDER_TIMEOUT_MS) || 8000;

  let res: Response;
  try {
    res = await fetch(target, {
      headers: { accept: "application/json" },
      redirect: "error",
      signal: AbortSignal.timeout(Math.min(timeout, 15000)),
      cache: "no-store",
    });
  } catch (err) {
    console.error("[oembed] request failed", video.platform, err);
    return { ok: false, status: 502, error: "The platform didn't respond. Try again in a moment." };
  }

  if (res.status === 401 || res.status === 403 || res.status === 404) {
    return { ok: false, status: 404, error: "That video is private, removed, or not embeddable." };
  }
  if (!res.ok) {
    console.error("[oembed] bad status", video.platform, res.status);
    return { ok: false, status: 502, error: "The platform returned an error. Try again later." };
  }

  let body: Record<string, unknown>;
  try {
    const raw = await res.text();
    if (raw.length > 200_000) throw new Error("oversized oEmbed response");
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch (err) {
    console.error("[oembed] invalid body", video.platform, err);
    return { ok: false, status: 502, error: "The platform returned something unexpected." };
  }

  return {
    ok: true,
    data: {
      platform: video.platform,
      url: video.canonicalUrl,
      title: text(body.title) ?? "Untitled video",
      author: text(body.author_name, 120),
      authorUrl: safeHttpsUrl(body.author_url, AUTHOR_HOSTS[video.platform]),
      thumbnail: safeThumbnail(body.thumbnail_url),
    },
  };
}

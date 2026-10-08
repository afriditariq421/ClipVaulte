export type PlatformId = "youtube" | "tiktok" | "instagram";

export const PLATFORMS: Record<PlatformId, { label: string; hosts: readonly string[] }> = {
  youtube: {
    label: "YouTube",
    hosts: ["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "youtu.be"],
  },
  tiktok: { label: "TikTok", hosts: ["tiktok.com", "www.tiktok.com", "m.tiktok.com"] },
  instagram: { label: "Instagram", hosts: ["instagram.com", "www.instagram.com"] },
};

export type ParsedVideo = { platform: PlatformId; id: string; canonicalUrl: string };

export type ParseResult = { ok: true; video: ParsedVideo } | { ok: false; error: string };

const YT_ID = /^[A-Za-z0-9_-]{11}$/;
const TT_USER = /^@[A-Za-z0-9._]{1,64}$/;
const TT_ID = /^\d{8,25}$/;
const IG_CODE = /^[A-Za-z0-9_-]{5,64}$/;

function platformForHost(host: string): PlatformId | null {
  for (const [id, p] of Object.entries(PLATFORMS) as [PlatformId, (typeof PLATFORMS)[PlatformId]][]) {
    if (p.hosts.includes(host)) return id;
  }
  return null;
}

/** Recognise a video path and return its id, or null. Exposed for tests and new platforms. */
export function isVideoPath(platform: PlatformId, url: URL): { id: string; user?: string } | null {
  const parts = url.pathname.split("/").filter(Boolean);
  if (platform === "youtube") {
    if (url.hostname === "youtu.be") return parts.length === 1 && YT_ID.test(parts[0]!) ? { id: parts[0]! } : null;
    if (parts.length === 1 && parts[0] === "watch") {
      const v = url.searchParams.get("v");
      return v && YT_ID.test(v) ? { id: v } : null;
    }
    if (parts.length === 2 && ["shorts", "embed", "live", "v"].includes(parts[0]!) && YT_ID.test(parts[1]!)) {
      return { id: parts[1]! };
    }
    return null;
  }
  if (platform === "tiktok") {
    if (parts.length === 3 && TT_USER.test(parts[0]!) && parts[1] === "video" && TT_ID.test(parts[2]!)) {
      return { id: parts[2]!, user: parts[0]! };
    }
    return null;
  }
  if (parts.length === 2 && ["p", "reel", "reels", "tv"].includes(parts[0]!) && IG_CODE.test(parts[1]!)) {
    return { id: parts[1]! };
  }
  return null;
}

/**
 * Strict parser: https only, exact-host allowlist, no credentials/ports/IPs, and the URL is rebuilt
 * from the extracted id so nothing user-controlled is ever forwarded verbatim.
 */
export function parseVideoUrl(input: string): ParseResult {
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > 2048) return { ok: false, error: "Paste a full video link." };
  let url: URL;
  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    return { ok: false, error: "That doesn't look like a valid link." };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return { ok: false, error: "Only web links are supported." };
  if (url.username || url.password || url.port) return { ok: false, error: "That link format isn't supported." };

  const host = url.hostname.toLowerCase();
  const platform = platformForHost(host);
  if (!platform) return { ok: false, error: "Only YouTube, TikTok and Instagram links are supported." };

  const match = isVideoPath(platform, url);
  if (!match) return { ok: false, error: `That ${PLATFORMS[platform].label} link doesn't point to a single public video.` };

  const canonicalUrl =
    platform === "youtube"
      ? `https://www.youtube.com/watch?v=${match.id}`
      : platform === "tiktok"
        ? `https://www.tiktok.com/${match.user}/video/${match.id}`
        : `https://www.instagram.com/p/${match.id}/`;

  return { ok: true, video: { platform, id: match.id, canonicalUrl } };
}

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { parseVideoUrl } from "@/lib/platform";
import { fetchOEmbed } from "@/lib/oembed";
import { rateLimit } from "@/lib/rate-limit";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 4096;
const Body = z.strictObject({ url: z.string().min(1).max(2048) });

function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return NextResponse.json(body, { status, headers: { "cache-control": "no-store", ...headers } });
}

function clientKey(req: NextRequest): string {
  // Netlify sets this header itself; clients cannot spoof it.
  const nf = req.headers.get("x-nf-client-connection-ip");
  if (nf) return nf;
  if (process.env.TRUST_PROXY === "true") {
    const xff = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    if (xff) return xff;
  }
  return "shared";
}

function sameOrigin(req: NextRequest): boolean {
  const fetchSite = req.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") return false;
  const origin = req.headers.get("origin");
  if (!origin) return fetchSite === "same-origin";
  if (origin === siteUrl()) return true;
  // Browsers can't forge Host, so matching it against Origin is enough for CSRF purposes.
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return !!host && new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "Forbidden." }, 403);
  if (!req.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return json({ error: "Expected JSON." }, 415);
  }

  const limit = Number(process.env.ANALYZE_RATE_LIMIT) || 20;
  const windowMs = (Number(process.env.RATE_LIMIT_WINDOW_SECONDS) || 60) * 1000;
  const rl = rateLimit(`analyze:${clientKey(req)}`, limit, windowMs);
  if (!rl.ok) {
    return json({ error: "Too many requests. Slow down a little." }, 429, { "retry-after": String(rl.retryAfter) });
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return json({ error: "Request too large." }, 413);

  let parsedBody: z.infer<typeof Body>;
  try {
    parsedBody = Body.parse(JSON.parse(raw));
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  const parsed = parseVideoUrl(parsedBody.url);
  if (!parsed.ok) return json({ error: parsed.error }, 422);

  const result = await fetchOEmbed(parsed.video);
  if (!result.ok) return json({ error: result.error }, result.status);

  return json({ data: result.data, downloadsEnabled: false });
}

export function GET() {
  return json({ error: "Method not allowed." }, 405, { allow: "POST" });
}

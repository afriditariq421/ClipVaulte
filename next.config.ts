import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Next.js injects inline bootstrap scripts, so script-src needs 'unsafe-inline' unless nonces are used
// (nonces would force every page to render dynamically and hurt caching). Everything else is locked down.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://*.ytimg.com https://*.tiktokcdn.com https://*.tiktokcdn-us.com https://*.cdninstagram.com https://*.fbcdn.net https://*.googleusercontent.com https://*.ggpht.com",
  "font-src 'self'",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const config: NextConfig = {
  poweredByHeader: false, // do not advertise the framework
  reactStrictMode: true,
  productionBrowserSourceMaps: false, // never ship source maps to the public
  images: { remotePatterns: [] }, // thumbnails use plain <img> from allowlisted CDN hosts via CSP
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default config;

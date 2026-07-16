import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const nextConfig: NextConfig = {
  // Lets the dev server serve dev-only resources (HMR websocket,
  // /__nextjs_font/*, etc.) to requests from this LAN IP — e.g. testing
  // on a phone over Wi-Fi at http://192.168.1.69:3000. Next.js blocks
  // cross-origin dev requests by default as a safety measure; this has
  // no effect on production (`next build`/`next start`), only `next dev`.
  // Update this value if the PC's LAN IP changes (e.g. after a DHCP
  // lease renewal) — entries are hostnames only, no protocol/port.
  allowedDevOrigins: ["192.168.1.69"],
  images: {
    remotePatterns: [
      // Google's avatar CDN, used as a fallback before a profile photo is uploaded.
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // Supabase Storage, serving uploaded profile photos.
      ...(supabaseHostname
        ? [{ protocol: "https" as const, hostname: supabaseHostname }]
        : []),
    ],
  },
};

export default nextConfig;

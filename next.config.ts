import { networkInterfaces } from "node:os";

import type { NextConfig } from "next";

import { version } from "./package.json";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

/**
 * This machine's own LAN addresses, found rather than typed.
 *
 * Next blocks cross-origin dev requests, so testing on a phone over Wi-Fi
 * needs the PC's LAN IP listed here. It used to be one hardcoded address,
 * which stopped working silently every time the DHCP lease moved and had
 * to be corrected in source. Asking the machine costs nothing and is right
 * by construction. `DEV_ORIGINS` (comma-separated) covers anything this
 * cannot see, such as a tunnel hostname.
 *
 * Dev only: `allowedDevOrigins` has no effect on `next build`/`next start`.
 */
function localNetworkOrigins(): string[] {
  const found = Object.values(networkInterfaces())
    .flat()
    .filter((entry) => entry && entry.family === "IPv4" && !entry.internal)
    .map((entry) => entry!.address);

  const configured = (process.env.DEV_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return Array.from(new Set([...found, ...configured]));
}

const nextConfig: NextConfig = {
  allowedDevOrigins: localNetworkOrigins(),
  // Single-sourced from package.json so the version shown on the Más screen
  // and stamped on every feedback report is the one that was actually
  // built, rather than a constant someone has to remember to bump.
  env: { NEXT_PUBLIC_APP_VERSION: version },
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

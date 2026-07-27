import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthContext";
import AuthGate from "@/components/auth/AuthGate";
import ServiceWorkerRegistration from "@/components/pwa/ServiceWorkerRegistration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * The voice of the person, and of the day.
 *
 * In a product where typography *is* the interface, the typeface is the most
 * identity-defining decision available — and this one was Geist alone, which
 * is the house font of a developer platform. Excellent, neutral, and in this
 * context anonymous: a warm gray palette does not make a screenshot
 * recognizable, and nothing else here ever would.
 *
 * So the type now carries a distinction rather than a style. Serif is
 * reserved for what a human said — reflections, journal entries, quoted
 * intentions, the echo — and for the sentence the day offers. Sans stays for
 * everything the software says: navigation, labels, buttons, dates. The
 * interface speaks in a different voice than the content it holds, which is
 * a semantic rule before it is a visual one, and none of this product's
 * neighbours do it: Day One, Reflect, Stoic and Notion are each one voice
 * throughout.
 *
 * Newsreader specifically: cut for reading on screens, warm, with a real
 * editorial character that never tips into quirk, and unusually good in the
 * light weights this product sets its largest text in.
 */
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Proyecto SER",
  description: "Construye una vida con propósito, un día a la vez.",
  appleWebApp: {
    capable: true,
    title: "Proyecto SER",
    // "black", not "black-translucent": a solid status bar reserves its
    // own space, so no view needs extra safe-area-top padding to avoid
    // being drawn under it. iOS also uses this (plus theme/background
    // color and the manifest icons) to generate the launch splash screen.
    statusBarStyle: "black",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Lets content extend under notches/home indicators so safe-area-inset-*
  // env() values are non-zero — required for the bottom nav's safe-area
  // padding to do anything on notched devices.
  viewportFit: "cover",
  // Matches the warm near-black the app actually paints, so the browser
  // chrome on mobile doesn't sit a shade cooler than the page under it.
  themeColor: "#0c0a09",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      // Every user-facing string in this product is Spanish. With `en`,
      // screen readers pronounce all of it with English phonetics.
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <ServiceWorkerRegistration />
        <AuthProvider>
          <AuthGate>{children}</AuthGate>
        </AuthProvider>
      </body>
    </html>
  );
}
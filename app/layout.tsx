import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
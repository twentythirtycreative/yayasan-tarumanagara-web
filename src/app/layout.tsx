import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SmoothScroll } from "@/components/smooth-scroll";
import { siteConfig } from "@/lib/site";

// Figma uses Plus Jakarta Sans throughout, including display headings
// (Bold / Bold Italic). We load italic + the full weight range.
//
// Self-hosted rather than via next/font/google: Google rotates the hashed
// fonts.gstatic.com filenames, so a restored Vercel build cache can point at
// URLs that now 404 and fail the build. These are the latin-subset variable
// files (wght 200-800), fetched once and committed.
const jakarta = localFont({
  src: [
    {
      path: "./fonts/PlusJakartaSans-Variable.woff2",
      weight: "200 800",
      style: "normal",
    },
    {
      path: "./fonts/PlusJakartaSans-Italic-Variable.woff2",
      weight: "200 800",
      style: "italic",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  keywords: [
    "Yayasan Tarumanagara",
    "Tarumanagara",
    "Universitas Tarumanagara",
    "Untar",
    "pendidikan",
    "kesehatan",
    "berita",
    "karir",
    "lowongan",
    "yayasan Jakarta",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  // No `alternates` here on purpose: metadata is inherited field by field, so a
  // canonical set on the root layout is handed to every page that doesn't
  // declare its own — pointing them all at the homepage. Each public page sets
  // its own via `pageMetadata` (lib/seo.ts).
  //
  // Favicon package in /public/favicon (realfavicongenerator). The root
  // /favicon.ico is served via the app/favicon.ico convention.
  manifest: "/favicon/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon/favicon-96x96.png", type: "image/png", sizes: "96x96" },
    ],
    apple: [{ url: "/favicon/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: { title: siteConfig.shortName },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-ink">
        <SmoothScroll />
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}

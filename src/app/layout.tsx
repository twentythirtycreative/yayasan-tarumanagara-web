import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SmoothScroll } from "@/components/smooth-scroll";

// Figma uses Plus Jakarta Sans throughout, including display headings
// (Bold / Bold Italic). We load italic + the full weight range.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Yayasan Tarumanagara",
    template: "%s | Yayasan Tarumanagara",
  },
  description:
    "Yayasan Tarumanagara — Membangun Nilai, Menginspirasi Masa Depan. Informasi lembaga, unit usaha, berita, kegiatan, dan karir.",
  metadataBase: new URL("https://yayasan-tarumanagara.example"),
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
  appleWebApp: { title: "Tarumanagara" },
  openGraph: {
    title: "Yayasan Tarumanagara",
    description: "Membangun Nilai, Menginspirasi Masa Depan.",
    type: "website",
    locale: "id_ID",
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

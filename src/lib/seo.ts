import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

/**
 * Per-page metadata for the public pages.
 *
 * Next merges metadata one *field* at a time: a page that only declares `title`
 * inherits the root layout's `alternates`, `openGraph` and `twitter` wholesale.
 * That is how every inner page ended up pointing its canonical URL at the
 * homepage and sharing the homepage's OG card. Each page therefore has to own
 * all three, and building them from one call keeps them from drifting apart.
 */
export function pageMetadata({
  title,
  description,
  path,
  image = siteConfig.ogImage,
}: {
  title: string;
  description: string;
  /** Route path with a leading slash, e.g. "/karir". */
  path: string;
  /** Override the shared OG card; site-relative or absolute. */
  image?: string;
}): Metadata {
  // The <title> gets the root layout's "%s | …" template applied to it, but an
  // og:title never does (a template only propagates from a parent `openGraph`).
  // Spelling the suffix out here keeps the share card and the tab in step.
  const fullTitle = `${title} | ${siteConfig.name}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: `${siteConfig.url}${path}`,
      siteName: siteConfig.name,
      title: fullTitle,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
  };
}

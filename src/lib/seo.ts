import type { Metadata } from "next";
import { LOCATIONS, SITE } from "@/lib/site";

const SITE_URL = "https://www.glitteringmedspa.com";
const DEFAULT_IMAGE = "/globe.svg";

export function getAbsoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function buildPageMetadata({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const canonicalUrl = getAbsoluteUrl(path);

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE.name,
      type: "website",
      images: [{ url: image, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE_URL,
    email: SITE.email,
    logo: getAbsoluteUrl(DEFAULT_IMAGE),
    sameAs: [
      `https://instagram.com/${SITE.instagram}`,
      getAbsoluteUrl("/blog"),
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        telephone: `+${SITE.phoneIntl}`,
        areaServed: "GH",
        availableLanguage: ["en"],
      },
    ],
    address: LOCATIONS.map((location) => ({
      "@type": "PostalAddress",
      addressLocality: "Accra",
      streetAddress: location.address,
      addressCountry: "GH",
    })),
  };
}

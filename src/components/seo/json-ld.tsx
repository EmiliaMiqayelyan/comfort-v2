import {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  siteUrl,
} from "@/lib/seo";

const organizationLd = {
  "@context": "https://schema.org",
  "@type": ["Organization", "LocalBusiness"],
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/brand/comfort-logo.png`,
  image: `${SITE_URL}${DEFAULT_OG_IMAGE}`,
  description:
    "Premium architectural interior products: baseboards, 3D wall panels, moldings and profiles for modern architecture in Armenia.",
  address: {
    "@type": "PostalAddress",
    addressCountry: "AM",
    addressLocality: "Yerevan",
  },
  areaServed: {
    "@type": "Country",
    name: "Armenia",
  },
  sameAs: [
    "https://www.instagram.com/",
    "https://www.youtube.com/",
    "https://www.linkedin.com/",
  ],
};

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  return <JsonLd data={organizationLd} />;
}

export function WebsiteJsonLd({ locale }: { locale: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl(locale),
    inLanguage: locale,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl(locale, "/products")}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return <JsonLd data={data} />;
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <JsonLd data={data} />;
}

export function ProductJsonLd({
  name,
  description,
  sku,
  image,
  price,
  url,
}: {
  name: string;
  description: string;
  sku: string;
  image: string;
  price: number;
  url?: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    sku,
    image,
    ...(url ? { url } : {}),
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      priceCurrency: "AMD",
      price,
      availability: "https://schema.org/InStock",
      url: url ?? SITE_URL,
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
      },
    },
  };

  return <JsonLd data={data} />;
}

export function ArticleJsonLd({
  title,
  description,
  image,
  url,
  datePublished,
  dateModified,
  locale,
}: {
  title: string;
  description: string;
  image: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  locale: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    datePublished,
    dateModified: dateModified ?? datePublished,
    inLanguage: locale,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/brand/comfort-logo.png`,
      },
    },
  };

  return <JsonLd data={data} />;
}

export function CollectionPageJsonLd({
  name,
  description,
  url,
  image,
}: {
  name: string;
  description: string;
  url: string;
  image?: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    ...(image ? { image } : {}),
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  return <JsonLd data={data} />;
}

export function ItemListJsonLd({
  name,
  url,
  items,
}: {
  name: string;
  url: string;
  items: Array<{ name: string; url: string; image?: string }>;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: item.url,
      name: item.name,
      ...(item.image ? { image: item.image } : {}),
    })),
  };

  return <JsonLd data={data} />;
}

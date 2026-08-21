const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Comfort",
  url: "https://comfort.am",
  logo: "https://comfort.am/brand/comfort-logo.svg",
  description:
    "Premium architectural interior products: baseboards, 3D wall panels, moldings and profiles.",
  address: {
    "@type": "PostalAddress",
    addressCountry: "AM",
    addressLocality: "Yerevan",
  },
};

export function OrganizationJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
    />
  );
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

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function ProductJsonLd({
  name,
  description,
  sku,
  image,
  price,
}: {
  name: string;
  description: string;
  sku: string;
  image: string;
  price: number;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    sku,
    image,
    brand: { "@type": "Brand", name: "Comfort" },
    offers: {
      "@type": "Offer",
      priceCurrency: "AMD",
      price,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

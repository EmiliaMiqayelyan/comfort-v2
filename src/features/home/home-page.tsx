import { HeroSection } from "./hero-section";
import { CategoriesSection } from "./categories-section";
import { CollectionsSection } from "./collections-section";
import { AdvantagesSection } from "./advantages-section";
import { AboutTeaser } from "./about-teaser";
import { CatalogCta } from "./catalog-cta";
import { ContactBanner } from "./contact-banner";
import type { Collection, ProductCategory } from "@/types";

export function HomePage({
  categories,
  collections,
}: {
  categories: ProductCategory[];
  collections: Collection[];
}) {
  return (
    <>
      <HeroSection />
      <CategoriesSection initialCategories={categories} />
      <CollectionsSection initialCollections={collections} />
      <AdvantagesSection />
      <AboutTeaser />
      <CatalogCta />
      <ContactBanner />
    </>
  );
}

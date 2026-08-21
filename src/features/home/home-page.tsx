import { HeroSection } from "./hero-section";
import { CategoriesSection } from "./categories-section";
import { CollectionsSection } from "./collections-section";
import { AdvantagesSection } from "./advantages-section";
import { AboutTeaser } from "./about-teaser";
import { CatalogCta } from "./catalog-cta";

export function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <CollectionsSection />
      <AdvantagesSection />
      <AboutTeaser />
      <CatalogCta />
    </>
  );
}

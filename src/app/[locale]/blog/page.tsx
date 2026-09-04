import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Reveal } from "@/components/molecules/reveal";
import { Badge } from "@/components/atoms/badge";
import { getLocalized } from "@/data/catalog";
import { loadPosts } from "@/lib/catalog-source";
import { jsonArray } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return {
    title: t("blogTitle"),
    description: t("homeDescription"),
    alternates: {
      canonical: `https://comfort.am/${locale}/blog`,
      languages: {
        am: "https://comfort.am/am/blog",
        ru: "https://comfort.am/ru/blog",
        en: "https://comfort.am/en/blog",
      },
    },
    openGraph: {
      title: t("blogTitle"),
      url: `https://comfort.am/${locale}/blog`,
      locale,
    },
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "blog" });
  const blogPosts = await loadPosts();

  const sorted = [...blogPosts].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="container-wide px-4 md:px-8">
        <Reveal className="mb-16 max-w-3xl">
          <h1 className="display text-4xl text-foreground md:text-5xl lg:text-6xl">
            {t("title")}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            {t("subtitle")}
          </p>
        </Reveal>

        <div className="grid gap-8 md:grid-cols-2">
          {sorted.map((post, i) => (
            <Reveal key={post.id} delay={i * 0.08}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-3xl bg-card shadow-soft transition hover:shadow-[0_24px_64px_rgba(17,24,39,0.12)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={post.coverImage}
                    alt={getLocalized(post.title, locale)}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="flex flex-1 flex-col p-8">
                  <div className="mb-4 flex flex-wrap gap-2">
                    <Badge className="capitalize">{post.category}</Badge>
                    {jsonArray<string>(post.tags).slice(0, 2).map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  </div>
                  <h2 className="display text-xl text-foreground md:text-2xl">
                    {getLocalized(post.title, locale)}
                  </h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {getLocalized(post.excerpt, locale)}
                  </p>
                  <p className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">
                    {t("published")} · {post.publishedAt}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

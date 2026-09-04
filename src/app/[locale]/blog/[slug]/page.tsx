import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Reveal } from "@/components/molecules/reveal";
import { Badge } from "@/components/atoms/badge";
import { getLocalized } from "@/data/catalog";
import { loadPost, loadPosts } from "@/lib/catalog-source";
import { routing } from "@/i18n/routing";
import { jsonArray } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export async function generateStaticParams() {
  const posts = await loadPosts();
  return routing.locales.flatMap((locale) =>
    posts.map((post) => ({ locale, slug: post.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await loadPost(slug);
  if (!post) return { title: "Journal — Comfort" };

  const title = getLocalized(post.title, locale);
  const description = getLocalized(post.excerpt, locale);

  return {
    title: `${title} — Comfort`,
    description,
    alternates: {
      canonical: `https://comfort.am/${locale}/blog/${slug}`,
    },
    openGraph: {
      title,
      description,
      images: [{ url: post.coverImage }],
      locale,
      type: "article",
      publishedTime: post.publishedAt,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = await loadPost(slug);
  if (!post) notFound();

  const t = await getTranslations({ locale, namespace: "blog" });
  const tc = await getTranslations({ locale, namespace: "common" });

  const posts = await loadPosts();
  const related = posts.filter((p) => p.id !== post.id).slice(0, 2);

  return (
    <article className="bg-background pt-28 pb-16 md:pt-36 md:pb-24">
      <div className="container-wide px-4 md:px-8">
        <Link
          href="/blog"
          className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {tc("back")}
        </Link>

        <Reveal className="mx-auto max-w-3xl">
          <div className="mb-6 flex flex-wrap gap-2">
            <Badge className="capitalize">{post.category}</Badge>
            {jsonArray<string>(post.tags).map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
          <h1 className="display text-4xl text-foreground md:text-5xl">
            {getLocalized(post.title, locale)}
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            {t("published")} {post.publishedAt} · {t("author")}:{" "}
            {post.author.name}
          </p>
        </Reveal>

        <Reveal className="mx-auto mt-12 max-w-4xl">
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl shadow-soft">
            <Image
              src={post.coverImage}
              alt={getLocalized(post.title, locale)}
              fill
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
              priority
            />
          </div>
        </Reveal>

        <Reveal className="mx-auto mt-12 max-w-3xl">
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <p className="text-lg leading-relaxed text-muted-foreground">
              {getLocalized(post.content, locale)}
            </p>
          </div>

          <div className="mt-12 flex items-center gap-4 border-t border-border pt-8">
            <div className="relative h-14 w-14 overflow-hidden rounded-full">
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
            <div>
              <p className="font-medium text-foreground">{post.author.name}</p>
              <p className="text-sm text-muted-foreground">
                {getLocalized(post.author.role, locale)}
              </p>
            </div>
          </div>
        </Reveal>

        {related.length > 0 && (
          <div className="mx-auto mt-24 max-w-4xl border-t border-border pt-24">
            <Reveal>
              <h2 className="display mb-8 text-2xl text-foreground">
                {t("related")}
              </h2>
            </Reveal>
            <div className="grid gap-6 sm:grid-cols-2">
              {related.map((item, i) => (
                <Reveal key={item.id} delay={i * 0.06}>
                  <Link
                    href={`/blog/${item.slug}`}
                    className="group block rounded-3xl border border-border bg-card p-6 transition hover:shadow-soft"
                  >
                    <h3 className="display text-lg text-foreground group-hover:text-accent">
                      {getLocalized(item.title, locale)}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {getLocalized(item.excerpt, locale)}
                    </p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

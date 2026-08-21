"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Reveal } from "@/components/molecules/reveal";
import { getLocalized } from "@/data/catalog";
import { useProjects } from "@/hooks/use-catalog";
import { cn } from "@/lib/utils";

export function ProjectsTeaser() {
  const t = useTranslations("projects");
  const locale = useLocale();
  const { data: projects = [] } = useProjects();
  const featured = projects.slice(0, 3);

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="container-wide px-4 md:px-8">
        <Reveal className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="display text-3xl text-foreground md:text-4xl lg:text-5xl">
              {t("title")}
            </h2>
            <p className="mt-3 max-w-lg text-muted-foreground">{t("subtitle")}</p>
          </div>
          <Link
            href="/projects"
            className="group inline-flex items-center gap-2 text-sm tracking-wide text-muted-foreground transition hover:text-accent"
          >
            {t("viewCase")}
            <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-12 md:grid-rows-2 md:gap-6">
          {featured.map((project, i) => (
            <Reveal
              key={project.id}
              delay={i * 0.1}
              className={cn(
                "md:col-span-6",
                i === 0 && "md:row-span-2 md:col-span-7",
                i === 1 && "md:col-span-5",
                i === 2 && "md:col-span-5",
              )}
            >
              <Link
                href={`/projects/${project.slug}`}
                className="group relative block overflow-hidden rounded-3xl shadow-soft"
              >
                <div
                  className={cn(
                    "relative w-full overflow-hidden",
                    i === 0 ? "aspect-[4/5] md:aspect-auto md:h-full md:min-h-[520px]" : "aspect-[16/10]",
                  )}
                >
                  <Image
                    src={project.images[0]}
                    alt={getLocalized(project.title, locale)}
                    fill
                    className="object-cover transition duration-700 ease-out group-hover:scale-105"
                    sizes={
                      i === 0
                        ? "(max-width: 768px) 100vw, 58vw"
                        : "(max-width: 768px) 100vw, 42vw"
                    }
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                    <p className="text-xs tracking-wide text-white/80">
                      {getLocalized(project.location, locale)} · {project.year}
                    </p>
                    <h3 className="display mt-2 text-xl text-white md:text-2xl">
                      {getLocalized(project.title, locale)}
                    </h3>
                    <p className="mt-2 line-clamp-2 max-w-md text-sm text-white/70">
                      {getLocalized(project.description, locale)}
                    </p>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

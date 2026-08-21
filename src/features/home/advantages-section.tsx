"use client";

import { useTranslations } from "next-intl";
import {
  Factory,
  Gem,
  Cpu,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Reveal } from "@/components/molecules/reveal";

const advantages = [
  { key: "production" as const, icon: Factory },
  { key: "materials" as const, icon: Gem },
  { key: "technology" as const, icon: Cpu },
  { key: "design" as const, icon: Sparkles },
  { key: "warranty" as const, icon: ShieldCheck },
];

export function AdvantagesSection() {
  const t = useTranslations("advantages");

  return (
    <section className="bg-comfort-ink py-16 md:py-20">
      <div className="container-wide px-4 md:px-8">
        <Reveal className="mb-12 text-center md:mb-14">
          <h2 className="display text-2xl text-comfort-sand md:text-3xl lg:text-4xl">
            {t("title")}
          </h2>
        </Reveal>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
          {advantages.map(({ key, icon: Icon }, i) => (
            <Reveal key={key} delay={i * 0.08}>
              <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-comfort-sand/20 bg-comfort-sand/10">
                  <Icon className="h-5 w-5 text-comfort-sand" />
                </span>
                <h3 className="text-sm font-medium tracking-wide text-comfort-sand">
                  {t(key)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-comfort-sand/75">
                  {t(`${key}Desc`)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

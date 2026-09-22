"use client";

import { useState, type ReactNode, type WheelEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";
import { getLocalized } from "@/data/catalog";
import { useCategories, useCollections } from "@/hooks/use-catalog";
import {
  childCategories,
  parentCategories,
} from "@/lib/category-tree";
import { cn } from "@/lib/utils";
import type { ProductCategory } from "@/types";

/** Keep wheel/touch scroll inside the panel; Lenis otherwise scrolls the page. */
function stopPageScroll(event: WheelEvent<HTMLElement>) {
  event.stopPropagation();
}

export const navKeys = [
  "products",
  "collections",
  "about",
  "downloads",
  "calculator",
  "contact",
] as const;

export type NavKey = (typeof navKeys)[number];

export const hrefMap: Record<NavKey, string> = {
  products: "/products",
  collections: "/collections",
  about: "/about",
  downloads: "/downloads",
  calculator: "/calculator",
  contact: "/contact",
};

const submenuKeys = new Set<NavKey>(["products", "collections"]);

type HeaderNavProps = {
  solid: boolean;
  onNavigate?: () => void;
  variant?: "desktop" | "mobile";
};

function linkTone(solid: boolean, active: boolean) {
  if (solid) {
    return active
      ? "text-accent"
      : "text-foreground/90 hover:text-accent";
  }
  return active
    ? "text-white font-medium"
    : "text-white/90 hover:text-white";
}

function DesktopDropdown({
  solid,
  label,
  href,
  active,
  children,
}: {
  solid: boolean;
  label: string;
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <Link
        href={href}
        className={cn(
          "inline-flex items-center gap-1 text-[15px] tracking-wide transition-colors",
          linkTone(solid, active),
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {label}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 opacity-70 transition-transform",
            open && "rotate-180",
          )}
        />
      </Link>

      <div
        className={cn(
          "absolute left-1/2 top-full z-50 pt-3 -translate-x-1/2 transition duration-150",
          open
            ? "pointer-events-auto visible translate-y-0 opacity-100"
            : "pointer-events-none invisible -translate-y-1 opacity-0",
        )}
      >
        <div
          role="menu"
          data-lenis-prevent
          onWheel={stopPageScroll}
          className="min-w-[16rem] overflow-hidden overscroll-contain rounded-xl border border-black/8 bg-white shadow-[0_16px_48px_rgba(44,51,62,0.12)]"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function ProductsMenu({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("categories");
  const locale = useLocale();
  const { data: categories = [] } = useCategories();
  const roots = parentCategories(categories);
  const [activeId, setActiveId] = useState<string | null>(null);
  const active =
    roots.find((category) => category.id === activeId) ?? roots[0];
  const children = active
    ? childCategories(categories, active.id)
    : [];

  if (roots.length === 0) {
    return (
      <div className="px-4 py-3 text-sm text-muted-foreground">
        {t("viewAll")}
      </div>
    );
  }

  return (
    <div
      className="flex min-w-[30rem] bg-white"
      data-lenis-prevent
      onWheel={stopPageScroll}
    >
      <ul className="w-60 shrink-0 border-r border-black/6 bg-white py-2.5">
        <li>
          <Link
            href="/products"
            role="menuitem"
            onClick={onNavigate}
            className="mx-2 block rounded-lg px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-black/[0.04] hover:text-accent"
          >
            {t("viewAll")}
          </Link>
        </li>
        {roots.map((category) => {
          const hasKids = childCategories(categories, category.id).length > 0;
          const isActive = category.id === active?.id;
          return (
            <li key={category.id}>
              <Link
                href={`/products/${category.slug}`}
                role="menuitem"
                onMouseEnter={() => setActiveId(category.id)}
                onFocus={() => setActiveId(category.id)}
                onClick={onNavigate}
                className={cn(
                  "mx-2 flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition",
                  isActive
                    ? "bg-accent/8 font-semibold text-accent"
                    : "text-foreground/75 hover:bg-black/[0.04] hover:text-foreground",
                )}
              >
                <span className="leading-snug">
                  {getLocalized(category.name, locale)}
                </span>
                {hasKids && (
                  <ChevronRight
                    className={cn(
                      "h-3.5 w-3.5 shrink-0",
                      isActive ? "text-accent/70" : "opacity-40",
                    )}
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="min-w-[16rem] flex-1 bg-white py-2.5">
        {children.length > 0 ? (
          <ul className="space-y-0.5">
            {children.map((child) => (
              <CategoryChildItem
                key={child.id}
                category={child}
                categories={categories}
                onNavigate={onNavigate}
              />
            ))}
          </ul>
        ) : active ? (
          <div className="px-4 py-3 text-sm text-foreground/50">
            {getLocalized(active.name, locale)}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CategoryChildItem({
  category,
  categories,
  onNavigate,
  depth = 0,
}: {
  category: ProductCategory;
  categories: ProductCategory[];
  onNavigate?: () => void;
  depth?: number;
}) {
  const locale = useLocale();
  const nested = childCategories(categories, category.id);

  const hasNested = nested.length > 0;

  return (
    <li>
      <Link
        href={`/products/${category.slug}`}
        role="menuitem"
        onClick={onNavigate}
        className={cn(
          "mx-2 block rounded-lg py-2 transition",
          depth === 0
            ? "px-3 text-sm font-medium text-foreground/85 hover:bg-black/[0.04] hover:text-accent"
            : "px-3 pl-5 text-[13px] text-foreground/60 hover:bg-black/[0.04] hover:text-foreground",
        )}
      >
        {getLocalized(category.name, locale)}
      </Link>
      {hasNested && (
        <ul className="mb-1.5 ml-3 border-l border-black/6 pl-1">
          {nested.map((child) => (
            <CategoryChildItem
              key={child.id}
              category={child}
              categories={categories}
              onNavigate={onNavigate}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function CollectionsMenu({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("collections");
  const tCategories = useTranslations("categories");
  const locale = useLocale();
  const { data: collections = [] } = useCollections();

  return (
    <ul
      className="bg-white py-2.5"
      data-lenis-prevent
      onWheel={stopPageScroll}
    >
      <li>
        <Link
          href="/collections"
          role="menuitem"
          onClick={onNavigate}
          className="mx-2 block rounded-lg px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-black/[0.04] hover:text-accent"
        >
          {tCategories.has("viewAll") ? tCategories("viewAll") : t("title")}
        </Link>
      </li>
      {collections.map((collection) => (
        <li key={collection.id}>
          <Link
            href={`/collections/${collection.slug}`}
            role="menuitem"
            onClick={onNavigate}
            className="mx-2 block rounded-lg px-3 py-2 text-sm text-foreground/75 transition hover:bg-black/[0.04] hover:text-foreground"
          >
            {getLocalized(collection.name, locale)}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function MobileSubmenu({
  label,
  href,
  children,
  onNavigate,
}: {
  label: string;
  href: string;
  children: ReactNode;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center gap-2">
        <Link href={href} className="flex-1 text-lg" onClick={onNavigate}>
          {label}
        </Link>
        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? "Collapse" : "Expand"}
          onClick={() => setOpen((value) => !value)}
          className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
          />
        </button>
      </div>
      {open && <div className="mt-2 space-y-2 border-l border-border/60 pl-4">{children}</div>}
    </div>
  );
}

function MobileProductsLinks({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("categories");
  const locale = useLocale();
  const { data: categories = [] } = useCategories();
  const roots = parentCategories(categories);

  return (
    <>
      <Link
        href="/products"
        className="block text-base text-muted-foreground"
        onClick={onNavigate}
      >
        {t("viewAll")}
      </Link>
      {roots.map((category) => {
        const kids = childCategories(categories, category.id);
        return (
          <div key={category.id} className="space-y-2">
            <Link
              href={`/products/${category.slug}`}
              className="block text-base text-foreground/90"
              onClick={onNavigate}
            >
              {getLocalized(category.name, locale)}
            </Link>
            {kids.map((child) => (
              <Link
                key={child.id}
                href={`/products/${child.slug}`}
                className="block pl-3 text-sm text-muted-foreground"
                onClick={onNavigate}
              >
                {getLocalized(child.name, locale)}
              </Link>
            ))}
          </div>
        );
      })}
    </>
  );
}

function MobileCollectionsLinks({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("categories");
  const locale = useLocale();
  const { data: collections = [] } = useCollections();

  return (
    <>
      <Link
        href="/collections"
        className="block text-base text-muted-foreground"
        onClick={onNavigate}
      >
        {t("viewAll")}
      </Link>
      {collections.map((collection) => (
        <Link
          key={collection.id}
          href={`/collections/${collection.slug}`}
          className="block text-base text-foreground/90"
          onClick={onNavigate}
        >
          {getLocalized(collection.name, locale)}
        </Link>
      ))}
    </>
  );
}

export function HeaderNav({
  solid,
  onNavigate,
  variant = "desktop",
}: HeaderNavProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  if (variant === "mobile") {
    return (
      <>
        {navKeys.map((key) => {
          if (!submenuKeys.has(key)) {
            return (
              <Link
                key={key}
                href={hrefMap[key]}
                className="text-lg"
                onClick={onNavigate}
              >
                {t(key)}
              </Link>
            );
          }

          return (
            <MobileSubmenu
              key={key}
              label={t(key)}
              href={hrefMap[key]}
              onNavigate={onNavigate}
            >
              {key === "products" ? (
                <MobileProductsLinks onNavigate={onNavigate} />
              ) : (
                <MobileCollectionsLinks onNavigate={onNavigate} />
              )}
            </MobileSubmenu>
          );
        })}
      </>
    );
  }

  return (
    <>
      {navKeys.map((key) => {
        const href = hrefMap[key];
        const active = pathname.startsWith(href);

        if (!submenuKeys.has(key)) {
          return (
            <Link
              key={key}
              href={href}
              className={cn(
                "text-[15px] tracking-wide transition-colors",
                linkTone(solid, active),
              )}
            >
              {t(key)}
            </Link>
          );
        }

        return (
          <DesktopDropdown
            key={key}
            solid={solid}
            label={t(key)}
            href={href}
            active={active}
          >
            {key === "products" ? (
              <ProductsMenu onNavigate={onNavigate} />
            ) : (
              <CollectionsMenu onNavigate={onNavigate} />
            )}
          </DesktopDropdown>
        );
      })}
    </>
  );
}

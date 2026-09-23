"use client";

import { useLayoutEffect, useRef, useState, type ReactNode, type WheelEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/routing";
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
  wide = false,
  children,
}: {
  solid: boolean;
  label: string;
  href: string;
  active: boolean;
  /** Viewport-centered panel, wide enough for subcategory columns. */
  wide?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [wideLayout, setWideLayout] = useState({ left: 0, bridge: 12 });
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const syncWideLayout = () => {
    const anchor = rootRef.current;
    const panel = panelRef.current;
    if (!anchor || !panel) return;
    const anchorRect = anchor.getBoundingClientRect();
    const headerBottom =
      anchor.closest("header")?.getBoundingClientRect().bottom ?? anchorRect.bottom;
    const width = panel.getBoundingClientRect().width;
    const idealLeft = Math.max(16, (window.innerWidth - width) / 2);
    const left = idealLeft - anchorRect.left;
    const bridge = Math.max(headerBottom - anchorRect.bottom, 8) + 8;
    setWideLayout((current) =>
      Math.abs(current.left - left) < 0.5 && Math.abs(current.bridge - bridge) < 0.5
        ? current
        : { left, bridge },
    );
  };

  useLayoutEffect(() => {
    if (!open || !wide) return;
    syncWideLayout();
    const header = rootRef.current?.closest("header");
    const observer = new ResizeObserver(() => syncWideLayout());
    if (header) observer.observe(header);
    window.addEventListener("resize", syncWideLayout);
    window.addEventListener("scroll", syncWideLayout, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncWideLayout);
      window.removeEventListener("scroll", syncWideLayout);
    };
  }, [open, wide]);

  return (
    <div
      ref={rootRef}
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
        ref={panelRef}
        className={cn(
          "absolute top-full z-50 transition duration-150",
          wide ? "w-[min(80rem,calc(100vw-2rem))]" : "left-1/2 -translate-x-1/2 pt-3",
          open
            ? "pointer-events-auto visible opacity-100"
            : "pointer-events-none invisible opacity-0",
          !wide && (open ? "translate-y-0" : "-translate-y-1"),
        )}
        style={wide ? { left: wideLayout.left, paddingTop: wideLayout.bridge } : undefined}
      >
        <div
          role="menu"
          data-lenis-prevent
          onWheel={stopPageScroll}
          className={cn(
            "overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-[0_16px_48px_rgba(44,51,62,0.12)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.45)]",
            !wide && "min-w-[16rem]",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function ViewAllProductsLink({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const t = useTranslations("categories");
  const router = useRouter();

  return (
    <Link
      href="/products"
      role="menuitem"
      className={cn("cursor-pointer", className)}
      onMouseDown={(event) => {
        if (
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }
        onNavigate?.();
        router.push("/products");
      }}
      onClick={onNavigate}
    >
      {t("viewAll")}
    </Link>
  );
}

function ProductsMenu({ onNavigate }: { onNavigate?: () => void }) {
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
      <ViewAllProductsLink
        onNavigate={onNavigate}
        className="block px-4 py-3 text-sm font-semibold uppercase tracking-[0.06em] text-popover-foreground transition hover:text-accent"
      />
    );
  }

  return (
    <div
      className="flex bg-popover text-popover-foreground"
      data-lenis-prevent
      onWheel={stopPageScroll}
    >
      <ul className="w-72 shrink-0 border-r border-border bg-foreground/[0.03] py-3">
        <li>
          <ViewAllProductsLink
            onNavigate={onNavigate}
            className="mx-2 block rounded-lg px-3 py-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-popover-foreground transition hover:bg-foreground/5 hover:text-accent"
          />
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
                  "mx-2 flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-[13px] uppercase tracking-[0.06em] transition",
                  isActive
                    ? "bg-accent/10 font-semibold text-accent"
                    : "text-popover-foreground/75 hover:bg-foreground/5 hover:text-popover-foreground",
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

      <div className="@container min-w-0 flex-1 px-4 py-4">
        {children.length > 0 ? (
          <div className="columns-2 gap-x-8 @min-[560px]:columns-3 @min-[860px]:columns-4">
            {children.map((child) => (
              <CategoryColumn
                key={child.id}
                category={child}
                categories={categories}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ) : active ? (
          <div className="px-2 py-1 text-[13px] uppercase tracking-[0.06em] text-popover-foreground/50">
            {getLocalized(active.name, locale)}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CategoryColumn({
  category,
  categories,
  onNavigate,
}: {
  category: ProductCategory;
  categories: ProductCategory[];
  onNavigate?: () => void;
}) {
  const locale = useLocale();
  const nested = childCategories(categories, category.id);

  return (
    <div className={cn("break-inside-avoid", nested.length > 0 ? "mb-6" : "mb-1")}>
      <Link
        href={`/products/${category.slug}`}
        role="menuitem"
        onClick={onNavigate}
        className="block rounded-md px-2 py-1.5 text-[13px] font-semibold uppercase leading-snug tracking-[0.06em] text-popover-foreground transition hover:bg-foreground/5 hover:text-accent"
      >
        {getLocalized(category.name, locale)}
      </Link>
      {nested.length > 0 && (
        <ul className="mt-1">
          {nested.map((child) => (
            <CategoryChildItem
              key={child.id}
              category={child}
              categories={categories}
              onNavigate={onNavigate}
              depth={1}
            />
          ))}
        </ul>
      )}
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
          "block rounded-md py-1.5 uppercase leading-snug tracking-[0.05em] transition hover:bg-foreground/5",
          depth <= 1
            ? "px-2 text-[13px] text-popover-foreground/80 hover:text-accent"
            : "px-2 pl-4 text-[12px] text-popover-foreground/60 hover:text-popover-foreground",
        )}
      >
        {getLocalized(category.name, locale)}
      </Link>
      {hasNested && (
        <ul className="mb-1.5 ml-3 border-l border-border pl-1">
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
  const locale = useLocale();
  const { data: collections = [] } = useCollections();

  return (
    <ul
      className="bg-popover py-2.5 text-popover-foreground"
      data-lenis-prevent
      onWheel={stopPageScroll}
    >
      <li>
        <Link
          href="/collections"
          role="menuitem"
          onClick={onNavigate}
          className="mx-2 block rounded-lg px-3 py-2 text-sm font-semibold uppercase tracking-[0.06em] text-popover-foreground transition hover:bg-foreground/5 hover:text-accent"
        >
          {t("viewAll")}
        </Link>
      </li>
      {collections.map((collection) => (
        <li key={collection.id}>
          <Link
            href={`/collections/${collection.slug}`}
            role="menuitem"
            onClick={onNavigate}
            className="mx-2 block rounded-lg px-3 py-2 text-sm text-popover-foreground/75 transition hover:bg-foreground/5 hover:text-popover-foreground"
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

function MobileCategoryNode({
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
  const kids = childCategories(categories, category.id);
  const [open, setOpen] = useState(false);
  const label = getLocalized(category.name, locale);

  return (
    <div>
      <div className="flex items-center gap-1">
        <Link
          href={`/products/${category.slug}`}
          onClick={onNavigate}
          className={cn(
            "min-w-0 flex-1 py-1 uppercase leading-snug tracking-[0.05em]",
            depth === 0
              ? "text-base text-foreground/90"
              : "text-sm text-muted-foreground",
          )}
        >
          {label}
        </Link>
        {kids.length > 0 && (
          <button
            type="button"
            aria-expanded={open}
            aria-label={label}
            onClick={() => setOpen((value) => !value)}
            className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
            />
          </button>
        )}
      </div>
      {open && kids.length > 0 && (
        <div className="mt-1 space-y-1 border-l border-border/60 pl-3">
          {kids.map((child) => (
            <MobileCategoryNode
              key={child.id}
              category={child}
              categories={categories}
              onNavigate={onNavigate}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MobileProductsLinks({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("categories");
  const { data: categories = [] } = useCategories();
  const roots = parentCategories(categories);

  return (
    <>
      <Link
        href="/products"
        className="block py-1 text-base uppercase tracking-[0.05em] text-muted-foreground"
        onClick={onNavigate}
      >
        {t("viewAll")}
      </Link>
      {roots.map((category) => (
        <MobileCategoryNode
          key={category.id}
          category={category}
          categories={categories}
          onNavigate={onNavigate}
        />
      ))}
    </>
  );
}

function MobileCollectionsLinks({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("collections");
  const locale = useLocale();
  const { data: collections = [] } = useCollections();

  return (
    <>
      <Link
        href="/collections"
        className="block py-1 text-base uppercase tracking-[0.05em] text-muted-foreground"
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
            wide={key === "products"}
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

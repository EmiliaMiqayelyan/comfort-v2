import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  heightClassName?: string;
  /** Light mark for dark backgrounds (hero/footer). */
  inverted?: boolean;
};

export function BrandLogo({
  className,
  heightClassName = "h-11",
  inverted = false,
}: BrandLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/comfort-logo.svg"
      alt="comfort"
      className={cn(
        "h-auto max-w-[9.5rem] object-contain object-left md:max-w-[11rem]",
        heightClassName,
        inverted && "brightness-0 invert",
        className,
      )}
    />
  );
}

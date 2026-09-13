"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { Minus, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;

export function ImageLightbox({
  open,
  onOpenChange,
  src,
  alt,
  unoptimized,
  closeLabel = "Close",
  zoomInLabel = "Zoom in",
  zoomOutLabel = "Zoom out",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string;
  alt: string;
  unoptimized?: boolean;
  closeLabel?: string;
  zoomInLabel?: string;
  zoomOutLabel?: string;
}) {
  const [zoom, setZoom] = useState(MIN_ZOOM);

  useEffect(() => {
    if (!open) setZoom(MIN_ZOOM);
  }, [open, src]);

  const adjustZoom = useCallback((delta: number) => {
    setZoom((current) =>
      Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number((current + delta).toFixed(2)))),
    );
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed inset-0 z-[81] flex outline-none"
          onOpenAutoFocus={(event) => event.preventDefault()}
          onWheel={(event) => {
            event.preventDefault();
            adjustZoom(event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP);
          }}
        >
          <Dialog.Title className="sr-only">{alt}</Dialog.Title>
          <Dialog.Description className="sr-only">{alt}</Dialog.Description>

          <div className="absolute right-3 top-3 z-10 flex items-center gap-2 sm:right-5 sm:top-5">
            <button
              type="button"
              onClick={() => adjustZoom(-ZOOM_STEP)}
              disabled={zoom <= MIN_ZOOM}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-40"
              aria-label={zoomOutLabel}
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => adjustZoom(ZOOM_STEP)}
              disabled={zoom >= MAX_ZOOM}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-40"
              aria-label={zoomInLabel}
            >
              <Plus className="h-4 w-4" />
            </button>
            <Dialog.Close
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label={closeLabel}
            >
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <div
            className={cn(
              "flex h-full w-full items-center justify-center overflow-auto p-4 sm:p-10",
              zoom > 1 ? "cursor-zoom-out" : "cursor-zoom-in",
            )}
            onClick={(event) => {
              if (event.target === event.currentTarget) onOpenChange(false);
            }}
            onDoubleClick={() =>
              setZoom((current) => (current > MIN_ZOOM ? MIN_ZOOM : 2))
            }
          >
            <div
              className="relative h-[min(88vh,100%)] w-[min(96vw,1400px)] transition-transform duration-200 ease-out"
              style={{ transform: `scale(${zoom})` }}
            >
              <Image
                src={src}
                alt={alt}
                fill
                quality={100}
                unoptimized={unoptimized}
                className="object-contain object-center"
                sizes="100vw"
                priority
              />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

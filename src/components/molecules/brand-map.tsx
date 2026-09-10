"use client";

import { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  COMFORT_MAP_MARKER,
  COMFORT_MAP_STYLE,
  resolveMapCoords,
  type MapCoords,
} from "@/lib/maps";
import { cn } from "@/lib/utils";

type BrandMapProps = {
  address?: string | null;
  embedUrl?: string | null;
  className?: string;
  /** MapLibre zoom level (default 15). */
  zoom?: number;
  /** Allow pan/zoom (default true). */
  interactive?: boolean;
  title?: string;
};

function MarkerElement() {
  const el = document.createElement("div");
  el.setAttribute("aria-hidden", "true");
  el.style.cssText = [
    "width:18px",
    "height:18px",
    "border-radius:9999px",
    `background:${COMFORT_MAP_MARKER}`,
    "border:2.5px solid #E7DFD9",
    "box-shadow:0 4px 14px rgba(44,51,62,0.35)",
  ].join(";");
  return el;
}

export function BrandMap({
  address,
  embedUrl,
  className,
  zoom = 15,
  interactive = true,
  title = "Map",
}: BrandMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<MapCoords | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    setCoords(null);

    resolveMapCoords(embedUrl, address).then((result) => {
      if (cancelled) return;
      if (!result) {
        setFailed(true);
        return;
      }
      setCoords(result);
    });

    return () => {
      cancelled = true;
    };
  }, [address, embedUrl]);

  useEffect(() => {
    if (!coords || !containerRef.current) return;

    let cancelled = false;
    let map: import("maplibre-gl").Map | undefined;
    let marker: import("maplibre-gl").Marker | undefined;

    (async () => {
      const maplibregl = await import("maplibre-gl");
      if (cancelled || !containerRef.current) return;

      const instance = new maplibregl.Map({
        container: containerRef.current,
        style: COMFORT_MAP_STYLE,
        center: [coords.lng, coords.lat],
        zoom,
        interactive,
        attributionControl: { compact: true },
      });
      map = instance;

      if (!interactive) {
        instance.scrollZoom.disable();
        instance.boxZoom.disable();
        instance.dragRotate.disable();
        instance.dragPan.disable();
        instance.keyboard.disable();
        instance.doubleClickZoom.disable();
        instance.touchZoomRotate.disable();
      } else {
        instance.addControl(
          new maplibregl.NavigationControl({ showCompass: false }),
          "top-right",
        );
      }

      marker = new maplibregl.Marker({ element: MarkerElement() })
        .setLngLat([coords.lng, coords.lat])
        .addTo(instance);

      instance.on("load", () => {
        if (!cancelled) instance.resize();
      });
    })();

    return () => {
      cancelled = true;
      marker?.remove();
      map?.remove();
    };
  }, [coords, zoom, interactive]);

  if (failed) return null;

  return (
    <div
      role="img"
      aria-label={title}
      className={cn("relative overflow-hidden bg-[#E7DFD9]", className)}
    >
      {!coords && (
        <div className="absolute inset-0 animate-pulse bg-[#DED6CE]" aria-hidden />
      )}
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}

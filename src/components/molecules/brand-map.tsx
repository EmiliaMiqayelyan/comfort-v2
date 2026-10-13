"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import { useTranslations } from "next-intl";
import { ExternalLink, Navigation } from "lucide-react";
import "leaflet/dist/leaflet.css";
import {
  COMFORT_MAP_MARKER,
  COMFORT_TILE_ATTR,
  COMFORT_TILE_URL,
  googleDirectionsUrl,
  resolveMapCoords,
  yandexDirectionsUrl,
  type MapCoords,
} from "@/lib/maps";
import { cn } from "@/lib/utils";

type BrandMapProps = {
  address?: string | null;
  embedUrl?: string | null;
  className?: string;
  /** Leaflet zoom level (default 15). */
  zoom?: number;
  /** Allow pan/zoom (default true). */
  interactive?: boolean;
  /** Show Google / Yandex directions links (default true). */
  showDirections?: boolean;
  title?: string;
};

function createBrandIcon(L: {
  divIcon: (options: {
    className?: string;
    html?: string;
    iconSize?: [number, number];
    iconAnchor?: [number, number];
  }) => import("leaflet").DivIcon;
}) {
  return L.divIcon({
    className: "comfort-map-marker",
    html: `
      <span class="comfort-map-marker-pulse" aria-hidden="true"></span>
      <svg class="comfort-map-marker-pin" width="28" height="36" viewBox="0 0 28 36" aria-hidden="true">
        <path d="M14 1.5C7.1 1.5 1.5 7.1 1.5 14c0 8.9 10.2 18.6 12.1 20.3a0.9 0.9 0 0 0 1.2 0C16.7 32.6 26.5 22.9 26.5 14 26.5 7.1 20.9 1.5 14 1.5z" fill="${COMFORT_MAP_MARKER}" stroke="#F7F3EF" stroke-width="2.5"/>
        <circle cx="14" cy="14" r="4.5" fill="#F7F3EF"/>
      </svg>
    `,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
  });
}

function focusMap(map: LeafletMap, coords: MapCoords, zoom: number) {
  map.invalidateSize({ animate: false });
  map.setView([coords.lat, coords.lng], zoom, { animate: false });
}

export function BrandMap({
  address,
  embedUrl,
  className,
  zoom = 15,
  interactive = true,
  showDirections = true,
  title = "Map",
}: BrandMapProps) {
  const t = useTranslations("contact");
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
    let map: LeafletMap | undefined;
    let marker: LeafletMarker | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let focusTimers: number[] = [];

    (async () => {
      const leafletMod = await import("leaflet");
      const L = leafletMod.default ?? leafletMod;
      if (cancelled || !containerRef.current) return;

      // Leaflet mutates the container; guard against remount reuse.
      containerRef.current.innerHTML = "";

      const instance = L.map(containerRef.current, {
        center: [coords.lat, coords.lng],
        zoom,
        zoomControl: interactive,
        attributionControl: true,
        dragging: interactive,
        scrollWheelZoom: interactive,
        doubleClickZoom: interactive,
        boxZoom: interactive,
        keyboard: interactive,
        touchZoom: interactive,
      });

      if (cancelled) {
        instance.remove();
        return;
      }

      map = instance;

      L.tileLayer(COMFORT_TILE_URL, {
        attribution: COMFORT_TILE_ATTR,
        maxZoom: 16,
      }).addTo(instance);

      marker = L.marker([coords.lat, coords.lng], {
        icon: createBrandIcon(L),
        interactive: false,
        keyboard: false,
      }).addTo(instance);

      const refocus = () => {
        if (!cancelled) focusMap(instance, coords, zoom);
      };

      instance.whenReady(refocus);
      focusTimers = [
        window.setTimeout(refocus, 50),
        window.setTimeout(refocus, 250),
        window.setTimeout(refocus, 600),
      ];

      if (typeof ResizeObserver !== "undefined" && containerRef.current) {
        resizeObserver = new ResizeObserver(refocus);
        resizeObserver.observe(containerRef.current);
      }
    })();

    return () => {
      cancelled = true;
      focusTimers.forEach((id) => window.clearTimeout(id));
      resizeObserver?.disconnect();
      marker?.remove();
      map?.remove();
    };
  }, [coords, zoom, interactive]);

  if (failed) return null;

  return (
    <div
      role="region"
      aria-label={title}
      className={cn("comfort-brand-map relative overflow-hidden bg-[#E7DFD9]", className)}
    >
      {!coords && (
        <div className="absolute inset-0 animate-pulse bg-[#DED6CE]" aria-hidden />
      )}
      <div ref={containerRef} className="absolute inset-0 z-0 h-full w-full" />

      {coords && showDirections && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-wrap gap-2 p-3 sm:justify-end">
          <a
            href={googleDirectionsUrl(coords)}
            target="_blank"
            rel="noreferrer"
            className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-soft backdrop-blur-sm transition hover:border-accent hover:text-accent"
          >
            <Navigation className="h-3.5 w-3.5" />
            {t("directionsGoogle")}
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
          <a
            href={yandexDirectionsUrl(coords)}
            target="_blank"
            rel="noreferrer"
            className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-soft backdrop-blur-sm transition hover:border-accent hover:text-accent"
          >
            <Navigation className="h-3.5 w-3.5" />
            {t("directionsYandex")}
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
        </div>
      )}
    </div>
  );
}

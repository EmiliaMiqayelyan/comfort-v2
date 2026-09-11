"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  COMFORT_MAP_MARKER,
  COMFORT_TILE_ATTR,
  COMFORT_TILE_URL,
  resolveMapCoords,
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
    html: `<span style="
      display:block;
      width:16px;
      height:16px;
      border-radius:9999px;
      background:${COMFORT_MAP_MARKER};
      border:2.5px solid #E7DFD9;
      box-shadow:0 4px 14px rgba(44,51,62,0.35);
    "></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
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
    let map: LeafletMap | undefined;
    let marker: LeafletMarker | undefined;

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

      // Fix grey tiles when the container was sized after mount.
      requestAnimationFrame(() => {
        if (!cancelled) instance.invalidateSize();
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
      className={cn("comfort-brand-map relative overflow-hidden bg-[#E7DFD9]", className)}
    >
      {!coords && (
        <div className="absolute inset-0 animate-pulse bg-[#DED6CE]" aria-hidden />
      )}
      <div ref={containerRef} className="absolute inset-0 z-0 h-full w-full" />
    </div>
  );
}

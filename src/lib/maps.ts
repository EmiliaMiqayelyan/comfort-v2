/**
 * Map helpers — Leaflet + light tiles, tinted to Comfort brand.
 * Legacy Google Maps embed URLs are still accepted as location hints
 * (query/`q` param), then geocoded for the interactive map.
 */

export const COMFORT_MAP_MARKER = "#203E4B";

/** Light greyscale basemap (no API key) — tinted to Comfort sand in CSS. */
export const COMFORT_TILE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}";

export const COMFORT_TILE_ATTR =
  "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ";

export type MapCoords = {
  lat: number;
  lng: number;
};

/** Last-resort center when geocoding fails but an address exists. */
export const YEREVAN_FALLBACK: MapCoords = { lat: 40.1776, lng: 44.5126 };

function isValidCoords(coords: MapCoords | null | undefined): coords is MapCoords {
  return (
    !!coords &&
    Number.isFinite(coords.lat) &&
    Number.isFinite(coords.lng) &&
    Math.abs(coords.lat) <= 90 &&
    Math.abs(coords.lng) <= 180
  );
}

/** Pull candidate place queries from embed URL and/or address (best → fallback). */
export function locationQueries(
  embedUrl: string | undefined | null,
  address: string | undefined | null,
): string[] {
  const out: string[] = [];
  const add = (value: string | undefined | null) => {
    const trimmed = value?.trim();
    if (trimmed && !out.includes(trimmed)) out.push(trimmed);
  };

  if (embedUrl?.trim()) {
    try {
      const parsed = new URL(embedUrl.trim());
      add(parsed.searchParams.get("q"));

      const placeMatch = parsed.pathname.match(/\/maps\/place\/([^/]+)/);
      if (placeMatch?.[1]) {
        add(decodeURIComponent(placeMatch[1].replace(/\+/g, " ")));
      }
    } catch {
      /* ignore invalid URL — may be raw "lat,lng" or plain text */
      add(embedUrl);
    }
  }

  add(address);
  return out;
}

/** Prefer embed `q`, else address — used for “should we show a map?” checks. */
export function locationQuery(
  embedUrl: string | undefined | null,
  address: string | undefined | null,
): string {
  return locationQueries(embedUrl, address)[0] ?? "";
}

/** Parse "40.15, 44.48" pasted into the map URL field. */
export function coordsFromPair(value: string | undefined | null): MapCoords | null {
  if (!value?.trim()) return null;
  const match = value.trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (!match) return null;
  const coords = { lat: Number(match[1]), lng: Number(match[2]) };
  return isValidCoords(coords) ? coords : null;
}

/** Try to read lat/lng already encoded in a Google Maps URL. */
export function coordsFromMapUrl(url: string | undefined | null): MapCoords | null {
  if (!url?.trim()) return null;

  const asPair = coordsFromPair(url);
  if (asPair) return asPair;

  try {
    const parsed = new URL(url.trim());
    const ll = parsed.searchParams.get("ll") ?? parsed.searchParams.get("center");
    if (ll) {
      const [lat, lng] = ll.split(",").map(Number);
      const coords = { lat, lng };
      if (isValidCoords(coords)) return coords;
    }

    // @lat,lng,zoom in path (share links)
    const at = parsed.pathname.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (at) {
      const coords = { lat: Number(at[1]), lng: Number(at[2]) };
      if (isValidCoords(coords)) return coords;
    }

    // !3dLAT!4dLNG in pb= embeds
    const pb = parsed.searchParams.get("pb") ?? "";
    const pbMatch = pb.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/);
    if (pbMatch) {
      const coords = { lat: Number(pbMatch[1]), lng: Number(pbMatch[2]) };
      if (isValidCoords(coords)) return coords;
    }
  } catch {
    return null;
  }

  return null;
}

/** Only cache successful lookups — never lock in a failed geocode. */
const geocodeCache = new Map<string, MapCoords>();

/** Geocode via same-origin API (Nominatim, server-side). */
export async function geocodeLocation(query: string): Promise<MapCoords | null> {
  const key = query.trim().toLowerCase();
  if (!key) return null;
  if (geocodeCache.has(key)) return geocodeCache.get(key) ?? null;

  try {
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(query.trim())}`);
    if (!res.ok) return null;

    const data = (await res.json()) as { lat?: number; lng?: number };
    const coords = { lat: Number(data.lat), lng: Number(data.lng) };
    if (!isValidCoords(coords)) return null;

    geocodeCache.set(key, coords);
    return coords;
  } catch {
    return null;
  }
}

/**
 * Resolve map center from optional embed URL + address.
 * Tries URL coords, then every location query, then Yerevan fallback when a query exists.
 */
export async function resolveMapCoords(
  embedUrl: string | undefined | null,
  address: string | undefined | null,
): Promise<MapCoords | null> {
  const fromUrl = coordsFromMapUrl(embedUrl);
  if (fromUrl) return fromUrl;

  const queries = locationQueries(embedUrl, address);
  for (const query of queries) {
    const hit = await geocodeLocation(query);
    if (hit) return hit;
  }

  // Still show a map when we know there's a place — pin near Yerevan.
  if (queries.length > 0) return YEREVAN_FALLBACK;
  return null;
}

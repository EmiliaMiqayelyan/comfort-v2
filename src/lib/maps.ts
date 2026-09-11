/**
 * Map helpers — Leaflet + light tiles, tinted to Comfort brand.
 * Accepts Google/Yandex URLs, embed URLs, or raw "lat,lng".
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

/** Last-resort center only when no URL coords and geocoding fails. */
export const YEREVAN_FALLBACK: MapCoords = { lat: 40.1776, lng: 44.5126 };

function isValidCoords(coords: MapCoords | null | undefined): coords is MapCoords {
  return (
    !!coords &&
    Number.isFinite(coords.lat) &&
    Number.isFinite(coords.lng) &&
    Math.abs(coords.lat) <= 90 &&
    Math.abs(coords.lng) <= 180 &&
    !(coords.lat === 0 && coords.lng === 0)
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
      const q = parsed.searchParams.get("q")?.trim();
      // Skip q when it's already coordinates — those are handled by coordsFromMapUrl.
      if (q && !coordsFromPair(q)) add(q);

      const text = parsed.searchParams.get("text")?.trim();
      if (text) add(text);

      const placeMatch = parsed.pathname.match(/\/maps\/place\/([^/]+)/);
      if (placeMatch?.[1]) {
        add(decodeURIComponent(placeMatch[1].replace(/\+/g, " ")));
      }
    } catch {
      if (!coordsFromPair(embedUrl)) add(embedUrl);
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
  if (coordsFromMapUrl(embedUrl)) return embedUrl!.trim();
  return locationQueries(embedUrl, address)[0] ?? "";
}

/** Parse "40.15, 44.48" pasted into the map URL field. */
export function coordsFromPair(value: string | undefined | null): MapCoords | null {
  if (!value?.trim()) return null;
  const match = value
    .trim()
    .match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)(?:\s*\/.*)?$/);
  if (!match) return null;
  const a = Number(match[1]);
  const b = Number(match[2]);
  // Heuristic: in Armenia / Caucasus, lat ~40, lng ~44.
  // Accept either lat,lng or lng,lat when unambiguous.
  if (Math.abs(a) <= 90 && Math.abs(b) <= 180) {
    const asLatLng = { lat: a, lng: b };
    const asLngLat = { lat: b, lng: a };
    if (Math.abs(a) > 90) return isValidCoords(asLngLat) ? asLngLat : null;
    if (Math.abs(b) > 90) return isValidCoords(asLatLng) ? asLatLng : null;
    // Both valid as lat — prefer lat,lng (Google style) when |a| looks like lat.
    if (Math.abs(a) < 70 && Math.abs(b) > 20) return asLatLng;
    return asLatLng;
  }
  return null;
}

/** Extract coords from Google Maps `pb=` embed payloads. */
function coordsFromGooglePb(pb: string): MapCoords | null {
  // Embed center is usually !2dLNG!3dLAT (take the last pair — place, not world view).
  const pairs2d3d = [...pb.matchAll(/!2d(-?\d+\.?\d*)!3d(-?\d+\.?\d*)/g)];
  if (pairs2d3d.length > 0) {
    const last = pairs2d3d[pairs2d3d.length - 1]!;
    const coords = { lng: Number(last[1]), lat: Number(last[2]) };
    if (isValidCoords(coords)) return coords;
  }

  // Marker / place often encoded as !3dLAT!4dLNG
  const pairs3d4d = [...pb.matchAll(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/g)];
  if (pairs3d4d.length > 0) {
    const last = pairs3d4d[pairs3d4d.length - 1]!;
    const coords = { lat: Number(last[1]), lng: Number(last[2]) };
    if (isValidCoords(coords)) return coords;
  }

  return null;
}

/** Try to read lat/lng from Google, Yandex, or raw coordinate strings. */
export function coordsFromMapUrl(url: string | undefined | null): MapCoords | null {
  if (!url?.trim()) return null;

  const asPair = coordsFromPair(url);
  if (asPair) return asPair;

  try {
    const parsed = new URL(url.trim());

    // Yandex: ?ll=LNG,LAT
    const yandexLl = parsed.searchParams.get("ll");
    if (yandexLl && /yandex\./i.test(parsed.hostname)) {
      const [lng, lat] = yandexLl.split(",").map(Number);
      const coords = { lat, lng };
      if (isValidCoords(coords)) return coords;
    }

    // Yandex pt=LNG,LAT
    const yandexPt = parsed.searchParams.get("pt");
    if (yandexPt && /yandex\./i.test(parsed.hostname)) {
      const [lng, lat] = yandexPt.split(",").map(Number);
      const coords = { lat, lng };
      if (isValidCoords(coords)) return coords;
    }

    const ll = parsed.searchParams.get("ll") ?? parsed.searchParams.get("center");
    if (ll) {
      // Google ll is usually lat,lng; Yandex already handled above.
      const parts = ll.split(",").map(Number);
      if (parts.length >= 2) {
        const coords = { lat: parts[0]!, lng: parts[1]! };
        if (isValidCoords(coords)) return coords;
      }
    }

    // q=40.15,44.48
    const q = parsed.searchParams.get("q");
    if (q) {
      const fromQ = coordsFromPair(q);
      if (fromQ) return fromQ;
    }

    // @lat,lng,zoom in path (Google share links)
    const at = parsed.pathname.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (at) {
      const coords = { lat: Number(at[1]), lng: Number(at[2]) };
      if (isValidCoords(coords)) return coords;
    }

    // Google embed pb=
    const pb = parsed.searchParams.get("pb");
    if (pb) {
      const fromPb = coordsFromGooglePb(pb);
      if (fromPb) return fromPb;
    }

    // Some embeds put pb data in the hash or path
    const pbInPath = url.match(/!2d(-?\d+\.?\d*)!3d(-?\d+\.?\d*)/);
    if (pbInPath) {
      const coords = { lng: Number(pbInPath[1]), lat: Number(pbInPath[2]) };
      if (isValidCoords(coords)) return coords;
    }
  } catch {
    return null;
  }

  return null;
}

/** Google Maps directions to a point. */
export function googleDirectionsUrl(coords: MapCoords): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`;
}

/** Google Maps open place. */
export function googleMapsUrl(coords: MapCoords): string {
  return `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
}

/** Yandex Maps directions to a point (rtext=~lat,lng). */
export function yandexDirectionsUrl(coords: MapCoords): string {
  return `https://yandex.com/maps/?rtext=~${coords.lat},${coords.lng}&rtt=auto`;
}

/** Yandex Maps open place (pt=lng,lat). */
export function yandexMapsUrl(coords: MapCoords): string {
  return `https://yandex.com/maps/?pt=${coords.lng},${coords.lat}&z=16&l=map`;
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
 * URL / embed coordinates always win over geocoding.
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

  if (queries.length > 0) return YEREVAN_FALLBACK;
  return null;
}

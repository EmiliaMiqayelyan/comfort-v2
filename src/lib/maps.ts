/**
 * Map helpers — OpenFreeMap + MapLibre with Comfort brand styling.
 * Legacy Google Maps embed URLs are still accepted as location hints
 * (query/`q` param), then geocoded for the interactive map.
 */

export const COMFORT_MAP_STYLE = "/map-styles/comfort.json";

export const COMFORT_MAP_MARKER = "#203E4B";

export type MapCoords = {
  lat: number;
  lng: number;
};

/** Pull a usable place query from an address and/or legacy Google embed URL. */
export function locationQuery(
  embedUrl: string | undefined | null,
  address: string | undefined | null,
): string {
  // Prefer embed `q` when present — often more precise than a city-level address.
  if (embedUrl?.trim()) {
    try {
      const parsed = new URL(embedUrl.trim());
      const q = parsed.searchParams.get("q")?.trim();
      if (q) return q;

      const placeMatch = parsed.pathname.match(/\/maps\/place\/([^/]+)/);
      if (placeMatch?.[1]) {
        return decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
      }
    } catch {
      /* ignore invalid URL */
    }
  }

  return address?.trim() ?? "";
}

/** Try to read lat/lng already encoded in a Google Maps URL. */
export function coordsFromMapUrl(url: string | undefined | null): MapCoords | null {
  if (!url?.trim()) return null;

  try {
    const parsed = new URL(url.trim());
    const ll = parsed.searchParams.get("ll") ?? parsed.searchParams.get("center");
    if (ll) {
      const [lat, lng] = ll.split(",").map(Number);
      if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    }

    // @lat,lng,zoom in path (share links)
    const at = parsed.pathname.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (at) {
      const lat = Number(at[1]);
      const lng = Number(at[2]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    }

    // !3dLAT!4dLNG in pb= embeds
    const pb = parsed.searchParams.get("pb") ?? "";
    const pbMatch = pb.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/);
    if (pbMatch) {
      const lat = Number(pbMatch[1]);
      const lng = Number(pbMatch[2]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    }
  } catch {
    return null;
  }

  return null;
}

const geocodeCache = new Map<string, MapCoords | null>();

/** Geocode a place name via OpenStreetMap Nominatim (browser-friendly). */
export async function geocodeLocation(query: string): Promise<MapCoords | null> {
  const key = query.trim().toLowerCase();
  if (!key) return null;
  if (geocodeCache.has(key)) return geocodeCache.get(key) ?? null;

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    url.searchParams.set("q", query.trim());

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      geocodeCache.set(key, null);
      return null;
    }

    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    const hit = data[0];
    if (!hit) {
      geocodeCache.set(key, null);
      return null;
    }

    const coords = { lat: Number(hit.lat), lng: Number(hit.lon) };
    if (!Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) {
      geocodeCache.set(key, null);
      return null;
    }

    geocodeCache.set(key, coords);
    return coords;
  } catch {
    geocodeCache.set(key, null);
    return null;
  }
}

/** Resolve map center from optional embed URL + address. */
export async function resolveMapCoords(
  embedUrl: string | undefined | null,
  address: string | undefined | null,
): Promise<MapCoords | null> {
  const fromUrl = coordsFromMapUrl(embedUrl);
  if (fromUrl) return fromUrl;

  const query = locationQuery(embedUrl, address);
  if (!query) return null;

  return geocodeLocation(query);
}

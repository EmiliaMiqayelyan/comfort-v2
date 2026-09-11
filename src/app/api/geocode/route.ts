import { NextRequest, NextResponse } from "next/server";

type NominatimHit = { lat: string; lon: string };

/**
 * Server-side geocode proxy — Nominatim blocks/limits bare browser calls.
 * Tries progressive address fallbacks (full → without house number → city).
 */
const cache = new Map<string, { lat: number; lng: number } | null>();

function buildFallbacks(query: string): string[] {
  const out: string[] = [];
  const add = (value: string) => {
    const trimmed = value.replace(/\s+/g, " ").replace(/,\s*,/g, ",").replace(/^,|,$/g, "").trim();
    if (trimmed && !out.includes(trimmed)) out.push(trimmed);
  };

  // Prefer a cleaned street (OSM rarely has house numbers) before the exact string.
  add(
    query
      .replace(/\d+-րդ/gu, "")
      .replace(/\bնրբ\.?/gu, "")
      .replace(/\bстр\.?/giu, "")
      .replace(/\bstreet\b/gi, "")
      .replace(/\s+\d+([/-]\d+)?\.?\s*/gu, " "),
  );
  add(query.replace(/\s+\d+([/-]\d+)?\.?\s*$/u, ""));
  add(query);

  const parts = query
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  for (let n = parts.length - 1; n >= 1; n -= 1) {
    add(parts.slice(0, n).join(", "));
  }

  return out;
}

async function nominatimSearch(q: string): Promise<{ lat: number; lng: number } | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("q", q);

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": "ComfortWebsite/2.0 (https://comfort.am; maps)",
    },
    next: { revalidate: 86400 },
  });

  if (!res.ok) return null;

  const data = (await res.json()) as NominatimHit[];
  const hit = data[0];
  if (!hit) return null;

  const coords = { lat: Number(hit.lat), lng: Number(hit.lon) };
  if (!Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) return null;
  return coords;
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) {
    return NextResponse.json({ error: "Missing q" }, { status: 400 });
  }

  const cacheKey = q.toLowerCase();
  if (cache.has(cacheKey)) {
    const hit = cache.get(cacheKey) ?? null;
    if (!hit) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(hit, {
      headers: { "Cache-Control": "public, max-age=86400" },
    });
  }

  try {
    const variants = buildFallbacks(q);
    for (let i = 0; i < variants.length; i += 1) {
      if (i > 0) {
        // Nominatim usage policy: max ~1 req/sec
        await new Promise((resolve) => setTimeout(resolve, 1100));
      }
      const coords = await nominatimSearch(variants[i]!);
      if (coords) {
        cache.set(cacheKey, coords);
        return NextResponse.json(coords, {
          headers: { "Cache-Control": "public, max-age=86400" },
        });
      }
    }

    cache.set(cacheKey, null);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Geocoder failed" }, { status: 502 });
  }
}

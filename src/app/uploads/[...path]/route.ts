import { NextRequest, NextResponse } from "next/server";
import { getApiOrigin } from "@/lib/api-base-url";

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const target = `${getApiOrigin()}/uploads/${path.map(encodeURIComponent).join("/")}`;

  try {
    const response = await fetch(target, {
      method: request.method,
      cache: "no-store",
      headers: {
        accept: request.headers.get("accept") || "*/*",
      },
    });

    if (!response.ok) {
      return new NextResponse(null, { status: response.status });
    }

    const headers = new Headers();
    const contentType = response.headers.get("content-type");
    const cacheControl = response.headers.get("cache-control");
    if (contentType) headers.set("content-type", contentType);
    headers.set("cache-control", cacheControl || "public, max-age=86400");

    return new NextResponse(response.body, {
      status: response.status,
      headers,
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}

export const GET = proxy;
export const HEAD = proxy;

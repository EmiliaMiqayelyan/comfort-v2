import { NextRequest, NextResponse } from "next/server";

const API_BASE =
  process.env.API_URL?.replace(/\/api\/?$/, "") || "http://127.0.0.1:4000";

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const target = `${API_BASE}/api/${path.join("/")}${request.nextUrl.search}`;

  const headers = new Headers();
  const auth = request.headers.get("authorization");
  const contentType = request.headers.get("content-type");
  if (auth) headers.set("authorization", auth);
  if (contentType) headers.set("content-type", contentType);

  let body: BodyInit | undefined;
  const contentLength = request.headers.get("content-length");
  const isMultipart = contentType?.includes("multipart/form-data");
  const hasBody =
    request.method !== "GET" &&
    request.method !== "HEAD" &&
    ((contentLength != null && Number(contentLength) > 0) || isMultipart);
  if (hasBody) {
    body = isMultipart ? await request.arrayBuffer() : await request.text();
  }

  try {
    const response = await fetch(target, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") || "application/json",
      },
    });
  } catch {
    return NextResponse.json({ message: "Service unavailable" }, { status: 503 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;

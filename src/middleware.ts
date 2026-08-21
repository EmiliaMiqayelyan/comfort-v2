import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const adminLocale = "am";

  // Bare /admin paths must always include a locale prefix
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const url = request.nextUrl.clone();
    url.pathname = `/${adminLocale}${pathname}`;
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/",
    "/(am|ru|en)/:path*",
    "/((?!api|_next|_vercel|icon|apple-icon|favicon|.*\\..*).*)",
  ],
};

import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Gate admin pages — redirect to login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const auth = req.cookies.get("admin_auth")?.value;
    if (auth !== "1") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  // Gate admin APIs — return 401 JSON instead of redirecting
  if (pathname.startsWith("/api/admin")) {
    const auth = req.cookies.get("admin_auth")?.value;
    if (auth !== "1") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

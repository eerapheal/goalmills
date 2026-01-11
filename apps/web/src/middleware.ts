import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Protection for Super Admin only routes
    if (path.startsWith("/admin/users") || path.startsWith("/api/admin/users")) {
      if (token?.role !== "super-admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
    }

    // Protection for Admin/Staful routes
    if (path.startsWith("/admin")) {
      if (token?.role !== "staful" && token?.role !== "super-admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

// Define protected routes that require authentication
const PROTECTED_ROUTES = [
  "/dashboard",
  "/dashboard/:path*",
  "/profile",
  "/settings",
];

const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export async function middleware(request: NextRequest) {
  // Create a Supabase client configured to use cookies
  const { supabase, response } = createClient(request);

  // This gets the session using Supabase's client directly
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Get the path and create a URL for potential redirects
  const path = request.nextUrl.pathname;

  // Check if the current route is an auth route, if so, authenticated users cant access it
  const isAuthRoute = AUTH_ROUTES.includes(path);
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Check if the current route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => {
    // Handle exact matches
    if (!route.includes(":")) {
      return route === path;
    }

    // Handle dynamic routes
    const routeSegments = route.split("/").filter(Boolean);
    const pathSegments = path.split("/").filter(Boolean);

    if (routeSegments.length !== pathSegments.length) {
      return false;
    }

    return routeSegments.every((segment, i) => {
      return segment.startsWith(":") || segment === pathSegments[i];
    });
  });

  // If it's a protected route and not authenticated, redirect to login
  if (isProtectedRoute && !session) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(redirectUrl);
  }

  // Continue with the response if authentication passes
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Middleware logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth routes
        if (req.nextUrl.pathname.startsWith("/api/auth/")) {
          return true;
        }
        
        // For API routes, we'll handle auth in the route handler itself
        // since we're using database sessions
        if (req.nextUrl.pathname.startsWith("/api/")) {
          return true;
        }
        
        // Allow page access
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"
  ]
};
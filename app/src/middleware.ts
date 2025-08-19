import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /analysis, /subscription)
  const pathname = request.nextUrl.pathname;

  // Skip middleware for API routes - let them handle their own logic
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Create response with security headers for non-API routes
  const response = NextResponse.next();

  // Security headers for pages only
  response.headers.set('X-DNS-Prefetch-Control', 'false');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Define protected routes that require authentication
  const protectedRoutes = ['/analysis', '/subscription'];
  
  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // Check for authentication token in cookies or headers
    // Since we're using Firebase Auth, the actual authentication check
    // will be done in the components themselves
    // This middleware is more for route organization
    
    // You could add additional checks here if needed
    // For now, we'll let the components handle authentication
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  // Get the subdomain
  const subdomain = extractSubdomain(hostname);

  // If it's the main domain or localhost without subdomain, continue normally
  if (!subdomain || subdomain === 'www') {
    return NextResponse.next();
  }

  // Rewrite to the subdomain page with the subdomain as a parameter
  const url = request.nextUrl.clone();
  url.pathname = `/sites/${subdomain}${url.pathname}`;

  return NextResponse.rewrite(url);
}

function extractSubdomain(hostname: string): string | null {
  // Remove port if present
  const host = hostname.split(':')[0];

  // Split by dots
  const parts = host.split('.');

  // Handle subdomain.localhost pattern (e.g., mysite.localhost)
  if (parts.length === 2 && parts[1] === 'localhost') {
    return parts[0];
  }

  // For plain localhost or 127.0.0.1, no subdomain
  if (host === 'localhost' || host === '127.0.0.1') {
    return null;
  }

  // If there are more than 2 parts, the first part is the subdomain
  // e.g., abc.xyz.com -> abc
  if (parts.length >= 3) {
    return parts[0];
  }

  return null;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|admin).*)',
  ],
};

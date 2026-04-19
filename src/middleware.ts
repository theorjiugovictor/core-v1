import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/materials',
  '/products',
  '/sales',
  '/expenses',
  '/insights',
  '/ideas',
  '/settings',
  '/help',
];

export default auth((request) => {
  const { pathname } = request.nextUrl;

  // Route protection: verify JWT via auth() — not just cookie presence
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isProtected && !request.auth) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();

  // Security headers for production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // microphone is intentionally allowed — the app uses voice input
    response.headers.set(
      'Permissions-Policy',
      'camera=(), geolocation=(), interest-cohort=()'
    );

    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline'; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: https: blob:; " +
      "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com; " +
      "frame-ancestors 'none';"
    );
  }

  return response;
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

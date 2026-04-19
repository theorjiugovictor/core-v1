import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { NextResponse } from 'next/server';

// Use only the edge-safe config here — importing from auth.ts pulls in
// firebase-admin which is Node.js-only and crashes the Edge runtime.
const { auth } = NextAuth(authConfig);

export default auth((request) => {
  // Route protection is handled by the authorized() callback in auth.config.ts.
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

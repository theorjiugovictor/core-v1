import type { NextAuthConfig } from 'next-auth';

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

/**
 * Edge-safe NextAuth config — no Node.js-only imports (no firebase-admin, no bcrypt).
 * Used by middleware. The full config with providers lives in auth.ts.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected = PROTECTED_PREFIXES.some(prefix =>
        nextUrl.pathname.startsWith(prefix)
      );

      if (isProtected && !isLoggedIn) {
        const loginUrl = new URL('/login', nextUrl.origin);
        loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
        return Response.redirect(loginUrl);
      }

      return true;
    },
  },
};

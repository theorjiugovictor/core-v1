'use server';

import { signIn, signOut } from './auth';
import { usersService } from './firebase/users';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { authLimiter, emailAuthLimiter } from '@/lib/ratelimit';
import { telemetry } from '@/lib/telemetry';

export async function loginAction(email: string, password: string) {
  let ip = 'unknown';

  try {
    const headersList = await headers();
    ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

    const { success: withinIpLimit } = await authLimiter.limit(ip);
    if (!withinIpLimit) {
      telemetry.rateLimitHit(ip, 'auth');
      return { success: false, error: 'Too many login attempts. Please wait 15 minutes before trying again.' };
    }

    const { success: withinEmailLimit } = await emailAuthLimiter.limit(email.toLowerCase());
    if (!withinEmailLimit) {
      telemetry.error('Per-email auth rate limit hit', undefined, {
        'event.name': 'auth.email_lockout',
        'user.email': email.toLowerCase(),
        'http.client_ip': ip,
      });
      return { success: false, error: 'Too many failed attempts for this account. Please wait 30 minutes.' };
    }

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      telemetry.auth('login.failed', ip);
      return { success: false, error: 'Invalid email or password' };
    }

    telemetry.auth('login.success', ip);
    return { success: true };
  } catch (error: any) {
    // If Next.js redirect error, rethrow it so navigation succeeds
    if (error?.digest?.includes('NEXT_REDIRECT') || error?.message === 'NEXT_REDIRECT') {
      throw error;
    }

    console.error('Login error:', error);
    telemetry.auth('login.failed', ip);

    const errMsg = error?.message || error?.cause?.err?.message || '';

    if (errMsg.includes('User not found')) {
      return { success: false, error: 'No account found with this email' };
    }

    if (errMsg.includes('Invalid password')) {
      return { success: false, error: 'Incorrect password' };
    }

    return { success: false, error: 'Invalid email or password' };
  }
}

export async function registerAction(data: {
  email: string;
  password: string;
  name: string;
  businessName: string;
}) {
  try {
    // Validate inputs
    if (!data.email || !data.password || !data.name || !data.businessName) {
      return { success: false, error: 'All fields are required' };
    }

    if (data.password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters' };
    }

    // Create user
    const user = await usersService.create(data);

    if (!user) {
      return { success: false, error: 'Failed to create user' };
    }

    // Auto-login after registration
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      return { success: false, error: 'User created but login failed. Please try logging in.' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Registration error:', error);
    telemetry.error('Registration failed', undefined, {
      'event.name': 'auth.register_failed',
      'error.message': error.message ?? 'unknown',
    });

    if (error.message === 'User with this email already exists') {
      return { success: false, error: 'User with this email already exists' };
    }

    return { success: false, error: 'An error occurred during registration' };
  }
}

export async function logoutAction() {
  await signOut({ redirect: false });
  redirect('/login');
}

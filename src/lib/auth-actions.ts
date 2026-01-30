'use server';

import { signIn, signOut } from './auth';
import { usersService } from './firebase/users';
import { redirect } from 'next/navigation';

export async function loginAction(email: string, password: string) {
  try {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { success: false, error: 'Invalid email or password' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Login error:', error);

    if (error.message.includes('User not found')) {
      return { success: false, error: 'No account found with this email' };
    }

    if (error.message.includes('Invalid password')) {
      return { success: false, error: 'Incorrect password' };
    }

    // NextAuth sometimes wraps errors
    if (error.cause?.err?.message === 'User not found' || error.cause?.err?.message === 'Invalid password') {
      return { success: false, error: error.cause.err.message === 'User not found' ? 'No account found with this email' : 'Incorrect password' };
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

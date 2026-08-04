'use client';

import { Suspense, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { resetPasswordAction } from '@/lib/auth-actions';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    setError(null);
    startTransition(async () => {
      const result = await resetPasswordAction(token, data.password);
      if (result.success) {
        setIsDone(true);
      } else {
        setError(result.error || 'Something went wrong. Please try again.');
      }
    });
  };

  if (!token) {
    return (
      <Card className="mx-auto w-full max-w-sm shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4"><Logo /></div>
          <CardTitle className="text-2xl text-center font-headline">Invalid link</CardTitle>
          <CardDescription className="text-center">
            This password reset link is missing its token. Request a new one from the login page.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link href="/forgot-password" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Request a new link
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (isDone) {
    return (
      <Card className="mx-auto w-full max-w-sm shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center font-headline">Password updated</CardTitle>
          <CardDescription className="text-center">
            Your password has been reset. You can log in with it now.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full h-11 text-sm font-semibold" onClick={() => router.push('/login')}>
            Go to login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-sm shadow-lg">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4"><Logo /></div>
        <CardTitle className="text-2xl text-center font-headline">Choose a new password</CardTitle>
        <CardDescription className="text-center">
          Make it at least 8 characters.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password">New password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="new-password"
                className="h-11 pr-10"
                {...register('password')}
                disabled={isPending}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              className="h-11"
              {...register('confirmPassword')}
              disabled={isPending}
            />
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/8 border border-destructive/20 px-4 py-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full h-11 text-sm font-semibold" disabled={isPending}>
            {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</> : 'Update password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Suspense fallback={<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}

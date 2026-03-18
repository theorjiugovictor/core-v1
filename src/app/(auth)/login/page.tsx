'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { loginAction } from '@/lib/auth-actions';
import { Loader2, Eye, EyeOff, TrendingUp, Boxes, Zap } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    setError(null);
    startTransition(async () => {
      const result = await loginAction(data.email, data.password);
      if (result.success) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    });
  };

  return (
    <div className="flex min-h-screen">
      {/* Left — Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-foreground text-background p-12 relative overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(243,75%,45%,0.4),transparent_50%),radial-gradient(circle_at_80%_80%,hsl(270,50%,30%,0.3),transparent_50%)]" />

        <div className="relative z-10">
          <Logo showText size={36} className="[&_span]:text-background" />
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-sm font-medium text-background/50 uppercase tracking-widest mb-4">Why CORE?</p>
            <h2 className="text-4xl font-bold leading-tight text-background">
              You Sell.<br />We Handle<br />The Rest.
            </h2>
            <p className="mt-4 text-background/60 text-lg leading-relaxed">
              The business accountability partner built for Nigerian SMEs.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Zap, text: 'Record sales in seconds with voice or text' },
              { icon: TrendingUp, text: 'See your true profit on every transaction' },
              { icon: Boxes, text: 'Auto-inventory deduction when you sell' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-background/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-background/80" />
                </div>
                <span className="text-background/70 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-background/30 text-xs">© 2026 CORE · Built for Nigerian Businesses</p>
        </div>
      </div>

      {/* Right — Form Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 bg-background">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <Logo size={36} />
        </div>

        <div className="w-full max-w-sm space-y-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">Log in to your CORE account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="h-11"
                {...register('email')}
                disabled={isPending}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
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

            {error && (
              <div className="rounded-lg bg-destructive/8 border border-destructive/20 px-4 py-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full h-11 text-sm font-semibold" disabled={isPending}>
              {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Logging in...</> : 'Log in'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-foreground hover:text-primary transition-colors">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

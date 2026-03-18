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
import { registerAction } from '@/lib/auth-actions';
import { Loader2, Eye, EyeOff, Check, X } from 'lucide-react';

const registerSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  name: z.string().min(1, 'Your name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'Contains a number', pass: /\d/.test(password) },
    { label: 'Contains a letter', pass: /[a-zA-Z]/.test(password) },
  ];
  if (!password) return null;
  return (
    <div className="flex flex-col gap-1 mt-1">
      {checks.map(({ label, pass }) => (
        <div key={label} className="flex items-center gap-1.5">
          {pass
            ? <Check className="h-3 w-3 text-green-500 shrink-0" />
            : <X className="h-3 w-3 text-muted-foreground/50 shrink-0" />}
          <span className={`text-xs ${pass ? 'text-green-600' : 'text-muted-foreground'}`}>{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = watch('password', '');

  const onSubmit = (data: RegisterFormData) => {
    setError(null);
    startTransition(async () => {
      const result = await registerAction({
        email: data.email,
        password: data.password,
        name: data.name,
        businessName: data.businessName,
      });
      if (result.success) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    });
  };

  return (
    <div className="flex min-h-screen">
      {/* Left — Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-foreground text-background p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(243,75%,45%,0.4),transparent_50%),radial-gradient(circle_at_80%_80%,hsl(270,50%,30%,0.3),transparent_50%)]" />

        <div className="relative z-10">
          <Logo showText size={36} className="[&_span]:text-background" />
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <p className="text-sm font-medium text-background/50 uppercase tracking-widest mb-4">Get started</p>
            <h2 className="text-4xl font-bold leading-tight text-background">
              Every business<br />deserves to be<br />taken seriously.
            </h2>
            <p className="mt-4 text-background/60 text-lg leading-relaxed">
              No matter how small, no matter where you're starting from.
            </p>
          </div>

          <div className="bg-background/5 border border-background/10 rounded-2xl p-6 space-y-1">
            <p className="text-background/40 text-xs uppercase tracking-widest mb-3">Free plan includes</p>
            {[
              'Unlimited sales recording',
              'AI-powered business insights',
              'Inventory auto-management',
              'WhatsApp & Telegram bot',
              'Daily & weekly summaries',
            ].map(feature => (
              <div key={feature} className="flex items-center gap-2.5 py-1">
                <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-background/70 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-background/30 text-xs">© 2026 CORE · Built for Nigerian Businesses</p>
        </div>
      </div>

      {/* Right — Form Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 bg-background overflow-y-auto">
        <div className="lg:hidden mb-8">
          <Logo size={36} />
        </div>

        <div className="w-full max-w-sm space-y-7">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Create your account</h1>
            <p className="mt-1 text-sm text-muted-foreground">Start managing your business for free</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="business-name">Business Name</Label>
              <Input id="business-name" placeholder="Tunde's Provisions" autoComplete="organization" className="h-11" {...register('businessName')} disabled={isPending} />
              {errors.businessName && <p className="text-xs text-destructive">{errors.businessName.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name">Your Name</Label>
              <Input id="name" placeholder="Tunde Adeyemi" autoComplete="name" className="h-11" {...register('name')} disabled={isPending} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" autoComplete="email" className="h-11" {...register('email')} disabled={isPending} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" autoComplete="new-password" className="h-11 pr-10" {...register('password')} disabled={isPending} />
                <button type="button" onClick={() => setShowPassword(v => !v)} tabIndex={-1} aria-label={showPassword ? 'Hide' : 'Show'} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              <PasswordStrength password={passwordValue} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Input id="confirm-password" type={showConfirm ? 'text' : 'password'} placeholder="••••••••" autoComplete="new-password" className="h-11 pr-10" {...register('confirmPassword')} disabled={isPending} />
                <button type="button" onClick={() => setShowConfirm(v => !v)} tabIndex={-1} aria-label={showConfirm ? 'Hide' : 'Show'} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/8 border border-destructive/20 px-4 py-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full h-11 text-sm font-semibold" disabled={isPending}>
              {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</> : 'Create account'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-foreground hover:text-primary transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

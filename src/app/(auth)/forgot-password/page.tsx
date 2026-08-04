'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { forgotPasswordAction } from '@/lib/auth-actions';
import { ArrowLeft, Loader2, MailCheck } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    startTransition(async () => {
      await forgotPasswordAction(data.email);
      // Always show the same confirmation, whether or not the email exists —
      // this endpoint intentionally never confirms account existence.
      setSubmittedEmail(data.email);
    });
  };

  if (submittedEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="mx-auto w-full max-w-sm shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MailCheck className="w-6 h-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center font-headline">Check your email</CardTitle>
            <CardDescription className="text-center">
              If an account exists for <span className="font-medium text-foreground">{submittedEmail}</span>, we've sent a link to reset your password. It expires in 1 hour.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to login
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="mx-auto w-full max-w-sm shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl text-center font-headline">Reset your password</CardTitle>
          <CardDescription className="text-center">
            Enter your email and we'll send you a link to reset it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            <Button type="submit" className="w-full h-11 text-sm font-semibold" disabled={isPending}>
              {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : 'Send reset link'}
            </Button>
          </form>

          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

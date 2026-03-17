'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="mx-auto w-full max-w-sm shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl text-center font-headline">Reset your password</CardTitle>
          <CardDescription className="text-center">
            Password reset is coming soon. For now, contact us for help.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Send an email to{' '}
            <a href="mailto:support@usecoreapp.com" className="text-foreground font-medium underline underline-offset-4 hover:text-primary transition-colors">
              support@usecoreapp.com
            </a>{' '}
            and we&apos;ll reset your password manually within 24 hours.
          </p>
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

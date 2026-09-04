'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Loader2 } from 'lucide-react';

export function EarlyAccessModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', business: '', contact: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.contact) return;
    setLoading(true);

    // Simulate saving or log waitlist signup
    try {
      console.log('Waitlist submission:', form);
      // Wait briefly for smooth feedback
      await new Promise(resolve => setTimeout(resolve, 600));
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) {
      setTimeout(() => setSubmitted(false), 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl">
        {submitted ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-success/10 text-success mx-auto flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-heading font-bold text-primary">
              You&apos;re on the priority list
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed">
              We are onboarding merchants in batches to ensure seamless setup. We will reach out to{' '}
              <span className="font-semibold text-foreground">{form.contact}</span> shortly.
            </DialogDescription>
            <Button
              className="mt-4 rounded-full px-6 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setOpen(false)}
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <DialogHeader>
              <div className="inline-flex items-center text-xs font-mono text-primary bg-primary/10 px-2.5 py-0.5 rounded-full w-fit mb-2">
                Private Beta · Priority Invite
              </div>
              <DialogTitle className="text-2xl font-heading font-extrabold text-primary">
                Request Early Access
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                CORE is currently in private onboarding with select Nigerian SMEs. Leave your details to get early invite access.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs font-medium">Your Name</Label>
                <Input
                  id="name"
                  required
                  placeholder="e.g. Tunde Adeyemi"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="business" className="text-xs font-medium">Business Name & Category</Label>
                <Input
                  id="business"
                  placeholder="e.g. Tunde Provisions / Mini Mart"
                  value={form.business}
                  onChange={e => setForm({ ...form, business: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="contact" className="text-xs font-medium">WhatsApp Phone or Email</Label>
                <Input
                  id="contact"
                  required
                  placeholder="e.g. 0801 234 5678 or tunde@gmail.com"
                  value={form.contact}
                  onChange={e => setForm({ ...form, contact: e.target.value })}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-4 h-11 bg-accent text-accent-foreground font-semibold hover:bg-accent/90 rounded-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                </>
              ) : (
                'Request Invite'
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

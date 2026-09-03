import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Mic, Check } from 'lucide-react';
import { Logo } from '@/components/logo';
import { LandingBackground } from '@/components/landing-background';
import { EarlyAccessModal } from '@/components/early-access-modal';
import { FounderAccessListener } from '@/components/founder-access-listener';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-background text-foreground font-sans selection:bg-accent/30 selection:text-foreground">
      {/* Subtle architectural hairline background */}
      <LandingBackground />

      {/* Founder backdoor listener (Cmd+Shift+L) */}
      <FounderAccessListener />

      {/* Navigation */}
      <header className="px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between border-b border-border/80 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center gap-2" href="/">
          <Logo size="md" />
        </Link>

        <nav className="flex items-center gap-4 sm:gap-6">
          <span className="hidden sm:inline-block text-xs font-mono text-muted-foreground border border-border bg-card px-3 py-1 rounded-full">
            Private Beta
          </span>

          <EarlyAccessModal>
            <Button size="sm" className="rounded-full px-5 shadow-sm bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-xs sm:text-sm">
              Request Access
            </Button>
          </EarlyAccessModal>
        </nav>
      </header>

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="pt-20 pb-16 md:pt-32 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col items-center text-center">
          {/* Eyebrow: Built for the smallest businesses on earth */}
          <div className="mb-6 flex items-center gap-2 text-xs font-mono uppercase tracking-[0.16em] text-muted-foreground">
            <span className="w-2 h-px bg-primary/40" />
            <span>Built for the smallest businesses on earth</span>
            <span className="w-2 h-px bg-primary/40" />
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] text-primary tracking-[-0.05em] leading-[0.95] max-w-4xl">
            You sell. <br className="hidden sm:block" />
            We handle the rest.
          </h1>

          <p className="mt-8 max-w-2xl text-muted-foreground text-lg sm:text-xl leading-relaxed font-normal">
            Speak or type naturally in English, Pidgin, or market shorthand. CORE runs the double-entry accounting, stock deduction, and profit math in real time.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <EarlyAccessModal>
              <Button size="lg" className="h-13 px-8 text-base rounded-full gap-2.5 shadow-xl hover:scale-[1.02] transition-transform bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
                Request Early Access <ArrowRight className="w-4 h-4" />
              </Button>
            </EarlyAccessModal>
          </div>

          <p className="mt-4 text-xs font-mono text-muted-foreground/70">
            Zero accounting knowledge required · Hands-free voice enabled
          </p>

          {/* Single, Super Aesthetic Product Visual */}
          <div className="mt-16 sm:mt-20 w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl p-6 sm:p-8 text-left">
            {/* Input Bar with mic */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-background shadow-inner">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Mic className="w-4 h-4" />
              </div>
              <div className="flex-1 font-heading text-base sm:text-lg font-medium text-foreground tracking-tight">
                &quot;Sold 5 cartons of Indomie for ₦45,000&quot;
              </div>
            </div>

            {/* Instant Output Ledger Breakdown */}
            <div className="mt-6 pt-6 border-t border-border grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Revenue</div>
                <div className="text-xl sm:text-2xl font-bold font-mono tabular text-primary mt-1">₦45,000</div>
                <div className="text-[11px] font-mono text-muted-foreground mt-0.5">5 cartons</div>
              </div>

              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">True Profit</div>
                <div className="text-xl sm:text-2xl font-bold font-mono tabular text-success mt-1">+₦8,500</div>
                <div className="text-[11px] font-mono text-muted-foreground mt-0.5">18.9% margin</div>
              </div>

              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Inventory</div>
                <div className="text-xl sm:text-2xl font-bold font-mono tabular text-foreground mt-1">-5 Cartons</div>
                <div className="text-[11px] font-mono text-muted-foreground mt-0.5">42 remaining</div>
              </div>
            </div>

            {/* Quiet verification footer */}
            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs font-mono text-muted-foreground">
              <span className="flex items-center gap-1.5 text-success">
                <Check className="w-3.5 h-3.5" /> Settled in 48ms
              </span>
              <span>Double-entry ledger · Zero manual forms</span>
            </div>
          </div>
        </section>

        {/* 3 Clean Value Propositions */}
        <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-12">
            <div>
              <div className="font-mono text-xs text-primary font-semibold uppercase tracking-widest mb-2">01 / Input</div>
              <h2 className="font-display-2 text-xl text-primary mb-3">Speak Naturally</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Type or speak in English, Pidgin, or market shorthand. No dropdowns, no chart of accounts, and no complex forms.
              </p>
            </div>

            <div>
              <div className="font-mono text-xs text-primary font-semibold uppercase tracking-widest mb-2">02 / Margins</div>
              <h2 className="font-display-2 text-xl text-primary mb-3">True Profit</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Most merchants confuse turnover with profit. CORE factors in exact FIFO inventory costs so you know your actual take-home pay daily.
              </p>
            </div>

            <div>
              <div className="font-mono text-xs text-primary font-semibold uppercase tracking-widest mb-2">03 / Credit</div>
              <h2 className="font-display-2 text-xl text-primary mb-3">Customer Tabs</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Never lose money on informal credit. CORE remembers customer debts, partial payments, and due dates without lost paper notebooks.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 md:py-24 px-4 max-w-4xl mx-auto">
          <div className="rounded-3xl bg-primary text-primary-foreground p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl max-w-2xl mx-auto leading-[0.98]">
              Every business deserves to be taken seriously.
            </h2>

            <p className="mt-6 text-primary-foreground/75 text-base max-w-lg mx-auto leading-relaxed">
              No matter how small, no matter where you are starting from. CORE gives your business the institutional control it deserves.
            </p>

            <div className="mt-8 flex justify-center">
              <EarlyAccessModal>
                <Button size="lg" className="h-13 px-8 text-base rounded-full shadow-2xl bg-accent text-accent-foreground hover:bg-accent/90 transition-all hover:scale-105 font-semibold">
                  Request Priority Access
                </Button>
              </EarlyAccessModal>
            </div>

            <p className="mt-4 text-xs font-mono text-primary-foreground/50">
              Private beta cohort onboarding now · Free during preview
            </p>
          </div>
        </section>
      </main>

      {/* Modern Minimal Footer */}
      <footer className="py-10 px-4 sm:px-6 lg:px-8 border-t border-border bg-card">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Logo size="sm" dot="accent" />
            <span className="text-xs font-mono text-muted-foreground">© 2026 CORE</span>
          </div>

          <div className="flex items-center gap-6 text-xs font-mono text-muted-foreground">
            <Link className="hover:text-primary transition-colors" href="#">
              Privacy
            </Link>
            <Link className="hover:text-primary transition-colors" href="#">
              Terms
            </Link>
            <Link className="hover:text-primary transition-colors" href="#">
              Support
            </Link>
            {/* Discreet Founder Login Backdoor */}
            <Link 
              href="/login" 
              className="text-muted-foreground/30 hover:text-foreground transition-colors"
              title="Founder & Team Access (or press Cmd+Shift+L)"
            >
              Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

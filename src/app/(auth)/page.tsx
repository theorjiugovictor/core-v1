import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowUpRight, Mic, Check, Sparkles, Shield, Coins, BookOpen } from 'lucide-react';
import { Logo } from '@/components/logo';
import { LandingBackground } from '@/components/landing-background';
import { EarlyAccessModal } from '@/components/early-access-modal';
import { FounderAccessListener } from '@/components/founder-access-listener';
import { DynamicHeroShowcase } from '@/components/dynamic-hero-showcase';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background text-foreground font-sans selection:bg-accent/30 selection:text-foreground">
      {/* Dynamic architectural background with ambient depth */}
      <LandingBackground />

      {/* Founder backdoor keyboard shortcut (Cmd+Shift+L) */}
      <FounderAccessListener />

      {/* Spacious, uncluttered Navigation */}
      <header className="px-6 sm:px-10 lg:px-16 h-20 flex items-center justify-between border-b border-border/70 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center gap-2" href="/">
          <Logo size="md" />
        </Link>

        <nav className="flex items-center gap-6">
          <span className="text-xs font-mono text-muted-foreground border border-border bg-card px-3 py-1.5 rounded-full">
            Private Beta
          </span>
        </nav>
      </header>

      <main className="flex-1 relative z-10">
        {/* Hero Section: Generous Whitespace and Confident Typography */}
        <section className="pt-24 sm:pt-32 md:pt-40 pb-16 md:pb-24 px-6 sm:px-10 lg:px-16 max-w-6xl mx-auto flex flex-col items-center text-center">
          {/* Eyebrow */}
          <div className="mb-6 flex items-center gap-3 text-xs sm:text-sm font-mono uppercase tracking-[0.2em] text-muted-foreground">
            <span className="w-3 h-px bg-primary/40" />
            <span>Built for the smallest businesses on earth</span>
            <span className="w-3 h-px bg-primary/40" />
          </div>

          {/* Bold, Spaced Headline */}
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[5.75rem] text-primary tracking-[-0.04em] leading-[0.96] max-w-4xl">
            You sell. <br className="hidden sm:block" />
            We handle the rest.
          </h1>

          {/* Subtitle with Generous Line Height */}
          <p className="mt-8 max-w-2xl text-muted-foreground text-lg sm:text-xl md:text-2xl leading-relaxed font-normal">
            Type naturally via WhatsApp, Telegram, or in-app — or drop a quick voice note. CORE runs the double-entry accounting, stock deduction, and profit math in real time.
          </p>

          {/* The Single Primary Call to Action in Hero */}
          <div className="mt-10 sm:mt-12 flex flex-col items-center gap-3">
            <EarlyAccessModal>
              <Button size="lg" className="h-14 px-9 text-base rounded-full gap-2.5 shadow-xl hover:scale-[1.02] transition-transform bg-accent text-accent-foreground hover:bg-accent/90 font-semibold cursor-pointer">
                Request Early Access <ArrowRight className="w-4 h-4" />
              </Button>
            </EarlyAccessModal>
            <p className="text-xs font-mono text-muted-foreground/70 tracking-wide mt-1">
              Zero accounting knowledge required · WhatsApp, Telegram & in-app · Voice optional
            </p>
          </div>

          {/* Interactive Dynamic Product Showcase */}
          <div className="mt-20 sm:mt-24 w-full">
            <DynamicHeroShowcase />
          </div>
        </section>

        {/* Section 2: Clear Problem Statement / Editorial Break */}
        <section className="py-24 sm:py-32 border-y border-border/70 bg-card/40 px-6 sm:px-10 lg:px-16">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="font-mono text-xs uppercase tracking-widest text-primary font-semibold">
              The Reality of African Trade
            </div>
            <h2 className="font-display-2 text-3xl sm:text-4xl md:text-5xl text-foreground tracking-tight leading-tight">
              Most merchants know their daily cash inflow, but have no idea what their actual profit is.
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Standard accounting apps expect quiet offices, keyboard forms, and full-time bookkeepers. CORE is built for noisy markets, high customer velocity, and merchants on their feet.
            </p>
          </div>
        </section>

        {/* Section 3: The 3 Core Pillars with Generous Breathing Room */}
        <section className="py-24 sm:py-36 px-6 sm:px-10 lg:px-16 max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
              How It Works
            </div>
            <h2 className="font-display-2 text-3xl sm:text-4xl md:text-5xl text-primary tracking-tight">
              Institutional precision. <br />
              Zero accounting effort.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {/* Pillar 1 */}
            <div className="p-8 sm:p-10 rounded-3xl border border-border bg-card shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between space-y-8">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-mono font-bold text-sm">
                  01
                </div>
                <h3 className="font-display-2 text-2xl text-primary font-bold">
                  Type or Speak Naturally
                </h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Send a quick WhatsApp text, Telegram message, or type shorthand in-app. Or if your hands are full, drop a 5-second voice note in English or Pidgin.
                </p>
              </div>
              <div className="pt-6 border-t border-border/70 text-xs font-mono text-primary font-medium">
                WhatsApp, Telegram & In-App · Voice Optional →
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="p-8 sm:p-10 rounded-3xl border border-border bg-card shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between space-y-8">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-success/10 text-success flex items-center justify-center font-mono font-bold text-sm">
                  02
                </div>
                <h3 className="font-display-2 text-2xl text-primary font-bold">
                  True Net Profit
                </h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Revenue is not profit. CORE instantly recalculates inventory cost using FIFO batch costing on every sale, revealing your exact daily take-home earnings.
                </p>
              </div>
              <div className="pt-6 border-t border-border/70 text-xs font-mono text-success font-medium">
                Automatic Stock Deduction →
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="p-8 sm:p-10 rounded-3xl border border-border bg-card shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between space-y-8">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/20 text-accent-foreground flex items-center justify-center font-mono font-bold text-sm">
                  03
                </div>
                <h3 className="font-display-2 text-2xl text-primary font-bold">
                  Customer Tabs
                </h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Never lose informal customer credit. CORE tracks who owes you, balances partial payments, and helps you recover debts without awkward paper notebooks.
                </p>
              </div>
              <div className="pt-6 border-t border-border/70 text-xs font-mono text-foreground font-medium">
                Living Ledger & Debts →
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Final Spacious Closing CTA */}
        <section className="py-24 sm:py-36 px-6 sm:px-10 max-w-5xl mx-auto">
          <div className="rounded-3xl bg-primary text-primary-foreground p-10 sm:p-16 md:p-20 text-center relative overflow-hidden shadow-2xl">
            {/* Ambient accent background sweep */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

            <h2 className="font-display text-3xl sm:text-5xl md:text-6xl max-w-2xl mx-auto leading-[1.02]">
              Every business deserves to be taken seriously.
            </h2>

            <p className="mt-6 text-primary-foreground/75 text-base sm:text-xl max-w-xl mx-auto leading-relaxed">
              No matter how small, no matter where you are starting from. CORE gives your business the institutional control it deserves.
            </p>

            <div className="mt-10 flex justify-center">
              <EarlyAccessModal>
                <Button size="lg" className="h-14 px-10 text-base rounded-full shadow-2xl bg-accent text-accent-foreground hover:bg-accent/90 transition-all hover:scale-105 font-semibold cursor-pointer">
                  Request Early Access
                </Button>
              </EarlyAccessModal>
            </div>

            <p className="mt-4 text-xs font-mono text-primary-foreground/50">
              Private beta onboarding now · Free during preview
            </p>
          </div>
        </section>
      </main>

      {/* Spacious Footer */}
      <footer className="py-12 sm:py-16 px-6 sm:px-10 lg:px-16 border-t border-border bg-card">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <Logo size="sm" dot="accent" />
            <span className="text-xs font-mono text-muted-foreground">© 2026 CORE Technologies Inc.</span>
          </div>

          <div className="flex items-center gap-8 text-xs font-mono text-muted-foreground">
            <Link className="hover:text-primary transition-colors" href="#">
              Privacy Policy
            </Link>
            <Link className="hover:text-primary transition-colors" href="#">
              Terms of Service
            </Link>
            <Link className="hover:text-primary transition-colors" href="#">
              WhatsApp Support
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

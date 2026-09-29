import Link from 'next/link';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Logo } from '@/components/logo';
import { EarlyAccessModal } from '@/components/early-access-modal';
import { FounderAccessListener } from '@/components/founder-access-listener';
import { DynamicHeroShowcase } from '@/components/dynamic-hero-showcase';
import { RotatingHero } from '@/components/rotating-hero';

export const metadata: Metadata = {
  title: 'CORE | Make every sale make sense',
  description: 'Record a sale with a message or voice note. Know your profit, your stock, and who still owes you. Built for Nigerian business owners.',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden bg-[#f7f7f2] text-foreground font-sans selection:bg-accent/30 selection:text-foreground">

      {/* Founder backdoor keyboard shortcut (Cmd+Shift+L) */}
      <FounderAccessListener />

      <header className="px-5 sm:px-10 lg:px-16 h-16 sm:h-20 flex items-center justify-between border-b border-primary/15 bg-[#f7f7f2]/95 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center gap-2" href="/">
          <Logo size="md" />
        </Link>

        <nav className="flex items-center gap-4 sm:gap-8">
          <span className="hidden sm:inline text-xs font-mono uppercase text-muted-foreground tracking-wide">Private beta</span>
          <Link href="/login" className="text-sm font-semibold text-primary hover:underline underline-offset-4">Log in</Link>
        </nav>
      </header>

      <main className="flex-1">
        <RotatingHero />

        <section className="px-5 pb-16 pt-12 sm:px-10 sm:pb-24 sm:pt-16 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-5 flex items-center justify-between border-b border-primary/20 pb-3 text-[11px] font-mono uppercase tracking-wider text-primary/70 text-left">
              <span>See a sale become a clear picture</span>
              <span className="hidden sm:inline">01 / The product</span>
            </div>
            <DynamicHeroShowcase />
          </div>
        </section>

        <section className="bg-[#142821] text-white px-5 sm:px-10 lg:px-16 py-16 sm:py-24">
          <div className="max-w-6xl mx-auto grid md:grid-cols-[1.2fr_1fr] gap-8 md:gap-20 items-end">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-accent mb-6">The real question</p>
              <h2 className="font-display-2 text-3xl sm:text-5xl lg:text-6xl leading-tight text-balance">You know what came in. <span className="text-accent">But what did you make?</span></h2>
            </div>
            <p className="text-base sm:text-lg leading-relaxed text-white/70 max-w-lg">Sales are only part of the story. Stock costs, expenses, and customer credit can hide the real number. CORE brings it all together as you work.</p>
          </div>
        </section>

        <section className="py-16 sm:py-24 px-5 sm:px-10 lg:px-16 max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-14">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-success mb-4">What changes with CORE</p>
              <h2 className="font-display-2 text-3xl sm:text-5xl text-primary leading-tight">Less bookkeeping.<br />More knowing.</h2>
            </div>
            <p className="text-muted-foreground max-w-sm text-sm sm:text-base">The everyday details, connected in one place.</p>
          </div>
          <div className="grid md:grid-cols-3 border-t border-primary/20">
            <div className="py-8 md:pr-8 md:border-r border-primary/20">
              <span className="font-mono text-xs text-success">01 / RECORD</span>
              <h3 className="font-display-2 text-2xl text-primary mt-6 mb-3">Say it your way.</h3>
              <p className="text-muted-foreground leading-relaxed">Type a quick sale or send a voice note. No accounting forms to fill while customers wait.</p>
            </div>
            <div className="py-8 md:px-8 border-t md:border-t-0 md:border-r border-primary/20">
              <span className="font-mono text-xs text-success">02 / UNDERSTAND</span>
              <h3 className="font-display-2 text-2xl text-primary mt-6 mb-3">See the real number.</h3>
              <p className="text-muted-foreground leading-relaxed">Know what is left after stock costs, not just how much money came in.</p>
            </div>
            <div className="py-8 md:pl-8 border-t md:border-t-0 border-primary/20">
              <span className="font-mono text-xs text-success">03 / STAY AHEAD</span>
              <h3 className="font-display-2 text-2xl text-primary mt-6 mb-3">Keep every detail.</h3>
              <p className="text-muted-foreground leading-relaxed">Stay on top of stock and customer balances without a second notebook.</p>
            </div>
          </div>
        </section>

        <section className="bg-accent text-accent-foreground px-5 sm:px-10 lg:px-16 py-16 sm:py-24">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-9">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest mb-5">Every business deserves to be taken seriously</p>
              <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl leading-tight max-w-2xl">
                Make your next sale count for more.
              </h2>
              <p className="mt-5 text-base sm:text-lg max-w-xl leading-relaxed text-foreground/75">
                Join the private beta and start seeing the whole picture behind your business.
              </p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
              <EarlyAccessModal>
                <Button size="lg" className="h-12 px-7 text-base rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-semibold cursor-pointer gap-2">
                  Request early access <ArrowRight className="w-4 h-4" />
                </Button>
              </EarlyAccessModal>
              <p className="text-xs font-mono text-foreground/65">Private beta · Limited onboarding</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 px-5 sm:px-10 lg:px-16 bg-[#142821] text-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <Logo size="sm" tone="inverse" dot="accent" />
            <span className="text-xs font-mono text-white/55">© 2026 CORE Technologies Inc.</span>
          </div>

          <Link href="/login" className="text-xs font-mono text-white/75 hover:text-white transition-colors">Log in <ArrowUpRight className="inline h-3 w-3" /></Link>
        </div>
      </footer>
    </div>
  );
}

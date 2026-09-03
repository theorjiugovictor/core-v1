import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, Boxes, Sparkles, MessageSquare } from 'lucide-react';
import { Logo } from '@/components/logo';
import { LandingBackground } from '@/components/landing-background';
import { EarlyAccessModal } from '@/components/early-access-modal';
import { FounderAccessListener } from '@/components/founder-access-listener';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-background">
      {/* Dynamic interactive ambient background */}
      <LandingBackground />

      {/* Secret founder backdoor listener (Cmd+Shift+L) */}
      <FounderAccessListener />

      {/* Navigation */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b border-border bg-background/90 backdrop-blur-md sticky top-0 z-50 relative">
        <Link className="flex items-center justify-center gap-2 group" href="/">
          <Logo size="md" />
        </Link>

        <nav className="ml-auto flex items-center gap-3 sm:gap-5">
          {/* Public Status Badge */}
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Private Beta · Coming Soon
          </span>

          {/* Public Early Access CTA */}
          <EarlyAccessModal>
            <Button size="sm" className="rounded-full px-5 shadow-sm bg-accent text-accent-foreground hover:bg-accent/90 font-medium text-xs sm:text-sm">
              Request Access
            </Button>
          </EarlyAccessModal>
        </nav>
      </header>

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-44 px-4 md:px-6 flex flex-col items-center text-center relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 px-3.5 py-1 text-xs font-semibold text-primary bg-primary/8 mb-6 animate-fade-in-up">
            <Sparkles className="w-3.5 h-3.5" />
            Built for Nigerian Businesses
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-display-xl text-primary animate-fade-in-up max-w-[950px] pb-4">
            You Sell. <br className="hidden md:block" /> We Handle The Rest.
          </h1>

          <p className="mt-6 mx-auto max-w-[700px] text-muted-foreground md:text-xl animate-fade-in-up delay-100 leading-relaxed font-sans">
            CORE is your business accountability partner. Focus on growing and building relationships — we handle the numbers, stock, debts, and insights automatically.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 animate-fade-in-up delay-200">
            <EarlyAccessModal>
              <Button size="lg" className="h-14 px-8 text-lg rounded-full gap-2 shadow-xl hover:scale-105 transition-transform bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
                Request Early Access <ArrowRight className="w-5 h-5" />
              </Button>
            </EarlyAccessModal>
            <p className="text-xs text-muted-foreground">Currently onboarding in private batches • Free during beta</p>
          </div>

          {/* Interactive Visual Preview */}
          <div className="mt-16 w-full max-w-5xl mx-auto rounded-xl border border-border bg-card shadow-2xl overflow-hidden animate-fade-in-up delay-300 p-2 md:p-4">
            <div className="rounded-lg bg-background border border-border flex flex-col md:flex-row h-[320px] md:h-[400px] relative overflow-hidden">
              {/* Simulated Sidebar */}
              <div className="w-16 md:w-64 border-r border-border bg-card hidden md:flex flex-col gap-6 p-4">
                <div className="flex items-center gap-2 px-2">
                  <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
                    <div className="w-4 h-4 rounded bg-primary"></div>
                  </div>
                  <div className="h-4 w-20 bg-primary/20 rounded"></div>
                </div>

                <div className="space-y-2">
                  <div className="h-10 w-full bg-primary/10 rounded-lg flex items-center px-3 gap-3 border border-primary/20">
                    <div className="w-4 h-4 rounded bg-primary/40"></div>
                    <div className="h-2 w-24 bg-primary/40 rounded"></div>
                  </div>
                  <div className="h-10 w-full hover:bg-muted/50 rounded-lg flex items-center px-3 gap-3 opacity-60">
                    <div className="w-4 h-4 rounded bg-muted"></div>
                    <div className="h-2 w-16 bg-muted rounded"></div>
                  </div>
                  <div className="h-10 w-full hover:bg-muted/50 rounded-lg flex items-center px-3 gap-3 opacity-60">
                    <div className="w-4 h-4 rounded bg-muted"></div>
                    <div className="h-2 w-20 bg-muted rounded"></div>
                  </div>
                  <div className="h-10 w-full hover:bg-muted/50 rounded-lg flex items-center px-3 gap-3 opacity-60">
                    <div className="w-4 h-4 rounded bg-muted"></div>
                    <div className="h-2 w-18 bg-muted rounded"></div>
                  </div>
                </div>
              </div>

              {/* Simulated Content Screen */}
              <div className="flex-1 p-6 md:p-8 flex flex-col items-center justify-center relative bg-background">
                <div className="relative text-center space-y-4 max-w-md z-10 p-8 rounded-xl border border-border shadow-lg bg-card">
                  <div className="font-mono text-xs text-primary mb-2 uppercase tracking-wider flex items-center justify-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                    </span>
                    Voice Input Active
                  </div>
                  <div className="text-2xl md:text-3xl font-heading font-bold tracking-tight text-primary">&quot;Sold 50 cartons of Indomie&quot;</div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-2 font-mono">
                    Instant Double-Entry Settlement...
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Revenue</div>
                      <div className="font-bold tabular text-success">+₦450k</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Stock</div>
                      <div className="font-bold tabular text-destructive">-50</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Profit</div>
                      <div className="font-bold tabular text-primary">+₦85k</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16 md:py-28 bg-card border-t border-border">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="font-display-2 text-3xl md:text-4xl text-primary mb-4">Everything you need. Nothing you don&apos;t.</h2>
              <p className="text-muted-foreground max-w-[600px] mx-auto">We stripped away the complexity of traditional ERPs and replaced it with clean intelligence.</p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="group relative overflow-hidden p-8 bg-card rounded-xl shadow-sm border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <MessageSquare className="w-24 h-24" />
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="font-display-2 text-xl mb-2 text-primary">AI Assistant</h3>
                <p className="text-muted-foreground leading-relaxed">
                  &quot;Sold 5 bags of rice.&quot; Speak or type naturally. Our AI handles the accounting, inventory deduction, and debt tracking for you.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group relative overflow-hidden p-8 bg-card rounded-xl shadow-sm border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <TrendingUp className="w-24 h-24" />
                </div>
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center text-success mb-6">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="font-display-2 text-xl mb-2 text-primary">Real Profit Tracking</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We calculate True Profit (Revenue - Cost) on every sale. Know your margins instantly, not at the end of the month.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group relative overflow-hidden p-8 bg-card rounded-xl shadow-sm border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Boxes className="w-24 h-24" />
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                  <Boxes className="h-6 w-6" />
                </div>
                <h3 className="font-display-2 text-xl mb-2 text-primary">Auto-Inventory</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Recipes and raw materials are managed automatically. Sell a &quot;Plate of Rice&quot;, and we deduct the ingredients from stock.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-24 lg:py-32 px-4 text-center relative overflow-hidden z-10">
          <div className="container mx-auto max-w-4xl relative">
            <div className="relative rounded-xl bg-primary text-primary-foreground border border-primary/20 shadow-2xl p-10 md:p-16 overflow-hidden">
              <h2 className="font-display text-3xl md:text-5xl mb-6">
                Every business deserves to be taken seriously.
              </h2>
              <p className="mx-auto max-w-[600px] text-primary-foreground/75 md:text-xl mb-10">
                No matter how small, no matter where you&apos;re starting from. CORE has your back.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <EarlyAccessModal>
                  <Button size="lg" className="h-14 px-10 text-xl rounded-full shadow-xl bg-accent text-accent-foreground hover:bg-accent/90 transition-all hover:scale-105 w-full sm:w-auto font-semibold">
                    Request Priority Access
                  </Button>
                </EarlyAccessModal>
              </div>
              <p className="text-sm text-primary-foreground/50 mt-6">Private beta roll-out • Limited merchant slots</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 w-full shrink-0 border-t border-border bg-card relative z-10">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size="sm" dot="accent" />
            <span className="text-xs text-muted-foreground">© 2026</span>
          </div>

          <nav className="flex items-center gap-6">
            <Link className="text-xs text-muted-foreground hover:text-primary transition-colors" href="#">
              Terms
            </Link>
            <Link className="text-xs text-muted-foreground hover:text-primary transition-colors" href="#">
              Privacy
            </Link>
            <Link className="text-xs text-muted-foreground hover:text-primary transition-colors" href="#">
              Contact
            </Link>
            {/* Discreet Founder & Staff Portal Link */}
            <Link 
              href="/login" 
              className="text-xs text-muted-foreground/35 hover:text-foreground transition-colors font-mono"
              title="Founder & Team Access (or press Cmd+Shift+L)"
            >
              Portal
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

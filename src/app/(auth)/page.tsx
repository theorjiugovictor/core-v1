import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Mic, TrendingUp, Boxes, ShieldCheck, Zap, Sparkles, MessageSquare } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* Background Elements (Google-style subtle playground) */}
      <div className="absolute inset-0 z-0 pointer-events-none h-full w-full bg-white dark:bg-black bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:16px_16px] opacity-70"></div>
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-primary/5 to-transparent z-0 pointer-events-none"></div>

      {/* Dynamic Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-[100px] z-0 animate-pulse pointer-events-none"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400/20 rounded-full blur-[100px] z-0 animate-pulse delay-1000 pointer-events-none"></div>

      {/* Navigation */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-background/60 backdrop-blur-md sticky top-0 z-50 relative">
        <Link className="flex items-center justify-center gap-2" href="/">
          <Logo />
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-primary transition-colors flex items-center" href="/login">
            Login
          </Link>
          <Link href="/register">
            <Button size="sm" className="rounded-full px-6 shadow-lg hover:shadow-xl transition-all">Get Started</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-48 px-4 md:px-6 flex flex-col items-center text-center relative">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-6 animate-fade-in-up">
            The Future of Retail is Here
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-gray-500 animate-fade-in-up max-w-[900px] pb-4">
            Run Your Business <br className="hidden md:block" /> Like Magic.
          </h1>
          <p className="mt-6 mx-auto max-w-[700px] text-muted-foreground md:text-xl dark:text-gray-400 animate-fade-in-up delay-100 leading-relaxed">
            Total control over your revenue and expenses. The intelligent operating system that tracks sales, inventory, and profit—just by text and voice.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4 animate-fade-in-up delay-200">
            <Link href="/register">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full gap-2 shadow-xl hover:scale-105 transition-transform bg-primary hover:bg-primary/90">
                Start Free Trial <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-2 hover:bg-secondary/50">
                Live Demo
              </Button>
            </Link>
          </div>

          {/* Interactive Visual */}
          <div className="mt-20 w-full max-w-5xl mx-auto rounded-xl border bg-card/50 backdrop-blur-sm shadow-2xl overflow-hidden animate-fade-in-up delay-300 p-2 md:p-4">
            <div className="rounded-lg bg-background border flex flex-col md:flex-row h-[300px] md:h-[400px] relative overflow-hidden">
              {/* Simulated Sidebar */}
              {/* Simulated Sidebar */}
              <div className="w-16 md:w-64 border-r bg-card/50 hidden md:flex flex-col gap-6 p-4">
                {/* Simulated Logo */}
                <div className="flex items-center gap-2 px-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-primary animate-pulse"></div>
                  </div>
                  <div className="h-4 w-20 bg-primary/20 rounded"></div>
                </div>

                {/* Simulated Nav Items */}
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
              {/* Simulated Content */}
              <div className="flex-1 p-6 md:p-8 flex flex-col items-center justify-center relative bg-gradient-to-br from-background to-muted/10">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
                <div className="relative text-center space-y-4 max-w-md z-10 glass-panel p-8 rounded-2xl border shadow-lg bg-background/80 backdrop-blur-md">
                  <div className="font-mono text-xs text-primary mb-2 uppercase tracking-wider flex items-center justify-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Voice Input Active
                  </div>
                  <div className="text-2xl md:text-3xl font-bold tracking-tight">"Sold 50 cartons of Indomie"</div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-4">
                    Processing...
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Revenue</div>
                      <div className="font-bold text-green-600">+₦450k</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Stock</div>
                      <div className="font-bold text-red-600">-50</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Profit</div>
                      <div className="font-bold text-primary">+₦85k</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Google-style Cards */}
        <section className="w-full py-12 md:py-24 bg-white/50 dark:bg-black/50 backdrop-blur-sm border-t">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl mb-4">Everything you need. Nothing you don't.</h2>
              <p className="text-muted-foreground max-w-[600px] mx-auto">We stripped away the complexity of traditional ERPs and replaced it with intelligence.</p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="group relative overflow-hidden p-8 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <MessageSquare className="w-24 h-24" />
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">AI Assistant</h3>
                <p className="text-muted-foreground leading-relaxed">
                  "Sold 5 bags of rice." Speak or type naturally. Our AI handles the accounting, inventory deduction, and data entry for you.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group relative overflow-hidden p-8 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <TrendingUp className="w-24 h-24" />
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-400 mb-6">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Real Profit Tracking</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We calculate True Profit (Revenue - Cost) on every sale. Know your margins instantly, not at the end of the month.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group relative overflow-hidden p-8 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Boxes className="w-24 h-24" />
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6">
                  <Boxes className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Auto-Inventory</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Recipes and ingredients are managed automatically. Sell a "Plate of Rice", and we deduct the ingredients from stock.
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* CTA Section */}
        <section className="w-full py-24 lg:py-32 px-4 text-center relative overflow-hidden z-10">
          {/* CTA Card */}
          <div className="container mx-auto max-w-4xl relative">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur opacity-50"></div>
            <div className="relative rounded-3xl bg-card border shadow-2xl p-10 md:p-16 overflow-hidden">
              {/* Background flare inside card */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10"></div>

              <h2 className="text-3xl font-bold tracking-tight md:text-5xl mb-6">
                Ready to upgrade your business?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl mb-10">
                Join the new wave of Nigerian businesses using AI to grow faster.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button size="lg" className="h-14 px-10 text-xl rounded-full shadow-xl bg-primary hover:bg-primary/90 transition-all hover:scale-105 w-full sm:w-auto">
                    Get Started Free
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground mt-6">No credit card required • 14-day free trial</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 w-full shrink-0 border-t bg-white/50 dark:bg-black/50 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold">CORE</span>
            <span className="text-xs text-muted-foreground">© 2026</span>
          </div>
          <nav className="flex gap-6">
            <Link className="text-xs hover:text-primary transition-colors" href="#">
              Terms
            </Link>
            <Link className="text-xs hover:text-primary transition-colors" href="#">
              Privacy
            </Link>
            <Link className="text-xs hover:text-primary transition-colors" href="#">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { Logo } from '@/components/logo';

export const metadata: Metadata = {
  title: 'Terms of Service | CORE',
  description: 'Terms for using CORE business tools and messaging channels.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f7f7f2] text-foreground">
      <header className="border-b border-primary/15 px-5 py-5 sm:px-10 lg:px-16">
        <Link href="/" aria-label="CORE home"><Logo size="md" /></Link>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-12 sm:py-20">
        <p className="font-mono text-xs uppercase text-success">Legal</p>
        <h1 className="mt-3 font-display-2 text-4xl text-primary sm:text-5xl">Terms of Service</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: 4 October 2026</p>
        <div className="mt-10 space-y-9 text-sm leading-7 text-foreground/80 sm:text-base">
          <section>
            <h2 className="font-display-2 text-xl text-primary">Using CORE</h2>
            <p className="mt-2">CORE helps you record and review business activity, including sales, inventory and expenses. By creating an account or using the service, you agree to these terms and our <Link className="underline underline-offset-4" href="/privacy">Privacy Policy</Link>. You must provide accurate account information, keep your login credentials secure and use the service only for lawful business purposes.</p>
          </section>
          <section>
            <h2 className="font-display-2 text-xl text-primary">Your records</h2>
            <p className="mt-2">You are responsible for the information you enter, the people you allow to access your account and your compliance with applicable tax, accounting and other laws. You retain your rights in your business records and permit us to process them to provide the service. Keep independent copies of records you need for your business.</p>
          </section>
          <section>
            <h2 className="font-display-2 text-xl text-primary">AI and insights</h2>
            <p className="mt-2">CORE may use AI to interpret requests and generate summaries or suggestions. Outputs may be incomplete or incorrect and are not professional accounting, tax, legal or financial advice. Review important entries and decisions yourself before relying on them.</p>
          </section>
          <section>
            <h2 className="font-display-2 text-xl text-primary">Messaging channels</h2>
            <p className="mt-2">If you connect WhatsApp or Telegram, you authorize CORE to receive your messages and reply through that platform. Only link a number or account you control. Your use of these channels is also subject to the platform&apos;s terms. Channel availability and delivery depend on those third parties; do not use chat as your only copy of an important record.</p>
          </section>
          <section>
            <h2 className="font-display-2 text-xl text-primary">Account and data deletion</h2>
            <p className="mt-2">You can request deletion of your CORE account and associated data at any time. See our <Link className="underline underline-offset-4" href="/data-deletion">User Data Deletion instructions</Link> for how to submit a request, how we verify it and what information may need to be retained.</p>
          </section>
          <section>
            <h2 className="font-display-2 text-xl text-primary">Availability and changes</h2>
            <p className="mt-2">The service may change or be temporarily unavailable, particularly while features are in beta. We may restrict access to protect users, investigate misuse or comply with law. We may update these terms; the date above identifies the current version. Continued use after an update means you accept the revised terms.</p>
          </section>
          <section>
            <h2 className="font-display-2 text-xl text-primary">Contact</h2>
            <p className="mt-2">For questions about these terms or your account, contact <a className="underline underline-offset-4" href="mailto:support@usecoreapp.com">support@usecoreapp.com</a>.</p>
          </section>
        </div>
      </main>
      <footer className="border-t border-primary/15 px-5 py-6 text-sm sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-3xl gap-6">
          <Link className="hover:underline" href="/">Home</Link>
          <Link className="hover:underline" href="/privacy">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}
import type { Metadata } from 'next';
import Link from 'next/link';
import { Logo } from '@/components/logo';

export const metadata: Metadata = {
  title: 'User Data Deletion | CORE',
  description: 'How to request deletion of your CORE account and associated data.',
};

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-[#f7f7f2] text-foreground">
      <header className="border-b border-primary/15 px-5 py-5 sm:px-10 lg:px-16">
        <Link href="/" aria-label="CORE home"><Logo size="md" /></Link>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-12 sm:py-20">
        <p className="font-mono text-xs uppercase text-success">Legal</p>
        <h1 className="mt-3 font-display-2 text-4xl text-primary sm:text-5xl">User Data Deletion</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: 4 October 2026</p>
        <div className="mt-10 space-y-9 text-sm leading-7 text-foreground/80 sm:text-base">
          <section>
            <h2 className="font-display-2 text-xl text-primary">Request deletion</h2>
            <p className="mt-2">Email <a className="underline underline-offset-4" href="mailto:support@usecoreapp.com?subject=CORE%20data%20deletion%20request">support@usecoreapp.com</a> from the email address associated with your CORE account. Use the subject &quot;CORE data deletion request&quot; and tell us whether you want to delete your entire account or specific personal data. If you cannot access that email address, contact us from another address and explain how we can identify your account. Do not send passwords, verification codes or other sensitive credentials.</p>
          </section>
          <section>
            <h2 className="font-display-2 text-xl text-primary">What happens next</h2>
            <p className="mt-2">We may ask for information to verify that you control the account before making changes. Once verified, we will review your request and delete the account-associated data we control, including your profile, linked messaging identifiers and business records, unless we need to retain particular information for legal, security or dispute-resolution reasons. We will confirm the outcome by email. Deleted data may remain temporarily in backups or technical logs until those systems are cleared.</p>
          </section>
          <section>
            <h2 className="font-display-2 text-xl text-primary">WhatsApp and Telegram data</h2>
            <p className="mt-2">Tell us if your request concerns messages sent to CORE via WhatsApp or Telegram so we can identify the linked account. Deleting data held by CORE does not delete copies held independently by Meta or Telegram; manage those through the relevant platform. See our <Link className="underline underline-offset-4" href="/privacy">Privacy Policy</Link> for more about how we handle data.</p>
          </section>
        </div>
      </main>
      <footer className="border-t border-primary/15 px-5 py-6 text-sm sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-3xl flex-wrap gap-6">
          <Link className="hover:underline" href="/">Home</Link>
          <Link className="hover:underline" href="/privacy">Privacy Policy</Link>
          <Link className="hover:underline" href="/terms">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}
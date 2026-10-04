import type { Metadata } from 'next';
import Link from 'next/link';
import { Logo } from '@/components/logo';

export const metadata: Metadata = {
  title: 'Privacy Policy | CORE',
  description: 'How CORE handles account, business and messaging data.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f7f7f2] text-foreground">
      <header className="border-b border-primary/15 px-5 py-5 sm:px-10 lg:px-16">
        <Link href="/" aria-label="CORE home"><Logo size="md" /></Link>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-12 sm:py-20">
        <p className="font-mono text-xs uppercase text-success">Legal</p>
        <h1 className="mt-3 font-display-2 text-4xl text-primary sm:text-5xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: 4 October 2026</p>
        <div className="mt-10 space-y-9 text-sm leading-7 text-foreground/80 sm:text-base">
          <section>
            <h2 className="font-display-2 text-xl text-primary">What we collect</h2>
            <p className="mt-2">CORE collects the details you provide to create and manage your account, such as your name, email address and business name. When you use the service, we store the business records you enter, including sales, expenses, inventory, products and related transaction details. If you connect a messaging channel, we also store the WhatsApp number or Telegram ID you provide and process messages you send to CORE.</p>
          </section>
          <section>
            <h2 className="font-display-2 text-xl text-primary">How we use data</h2>
            <p className="mt-2">We use this information to operate your account, maintain your records, answer your requests, generate business insights, deliver messages, support the service, prevent abuse and troubleshoot errors. Requests to CORE&apos;s assistant may be processed by third-party AI services to interpret your messages and produce responses. AI-generated results can be inaccurate; check important figures against your records.</p>
          </section>
          <section>
            <h2 className="font-display-2 text-xl text-primary">Service providers and channels</h2>
            <p className="mt-2">We use service providers for hosting, data storage, AI processing, email and messaging. Depending on the features you use, these include Firebase/Google, AWS, Upstash, Resend, Meta (WhatsApp) and Telegram. They process information needed to provide their services under their own applicable terms and privacy practices. Messaging platforms may also receive your phone number or account ID and message content when you use those channels. Your data may be processed in countries other than your own.</p>
          </section>
          <section>
            <h2 className="font-display-2 text-xl text-primary">Security and retention</h2>
            <p className="mt-2">We use access controls and other measures intended to protect your information, but no service can guarantee absolute security. We retain information while it is needed to provide the service, meet legal obligations, resolve disputes or protect the service. Some technical logs and backups may remain for a limited period after account data is removed.</p>
          </section>
          <section>
            <h2 className="font-display-2 text-xl text-primary">Your choices</h2>
            <p className="mt-2">You can update connected channel details in Settings and export available business records from the app. To request access or correction of your personal information, contact us at <a className="underline underline-offset-4" href="mailto:support@usecoreapp.com">support@usecoreapp.com</a>. To request deletion, follow our <Link className="underline underline-offset-4" href="/data-deletion">User Data Deletion instructions</Link>. We may need to verify your identity before acting on a request. Your rights depend on applicable law.</p>
          </section>
          <section>
            <h2 className="font-display-2 text-xl text-primary">Updates and contact</h2>
            <p className="mt-2">We may update this policy as the service changes. The date above shows the latest version. For privacy questions, email <a className="underline underline-offset-4" href="mailto:support@usecoreapp.com">support@usecoreapp.com</a>.</p>
          </section>
        </div>
      </main>
      <footer className="border-t border-primary/15 px-5 py-6 text-sm sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-3xl gap-6">
          <Link className="hover:underline" href="/">Home</Link>
          <Link className="hover:underline" href="/terms">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}
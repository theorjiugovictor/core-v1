# CORE

CORE helps small businesses record sales and expenses, manage inventory, and understand their profit. This repository contains the Next.js application and its Firebase, messaging, and AI integrations.

## Stack

Next.js 16, React 18, TypeScript, Firebase Firestore, Auth.js credentials authentication, Tailwind CSS, AWS Bedrock / Gemini, Upstash Redis, and Resend. Production runs on Vercel.

## Local development

1. Install Node.js 22 and copy `.env.example` to `.env.local`. Fill in the Firebase project and service account, `NEXTAUTH_SECRET`, and any integrations you plan to exercise. Never commit `.env.local` or service-account JSON.
2. Install dependencies with `npm ci --legacy-peer-deps`, then run `npm run dev` from the repository root.
3. Open http://localhost:9002.

CI generates Next.js types, then runs `npm run lint` and `npm run typecheck`. The environment variable template in `.env.example` is the source of truth for integration settings.

## Other documentation

- [Brand reference](brand-handoff/README.md) describes the visual identity; the live theme files are authoritative.
- [Product ideas](docs/CORE_MASTER_PLAN.md) collects proposals, not committed delivery dates or shipped features.

## Deployment

- Configure the production environment variables from `.env.example` in Vercel. Keep credentials out of GitHub Actions and pull requests; rotate compromised keys immediately.
- Deploy Firestore indexes to the correct Firebase project before releasing code that queries them: `firebase deploy --only firestore:indexes --project <project-id> --non-interactive`. Wait for new indexes to reach `READY` before expecting dashboards to load.
- Upstash Redis is required for rate limiting in production. Resend email requires a verified sending domain in the same Resend account as the API key.
- The scheduled jobs in `vercel.json` require `CRON_SECRET`. WhatsApp and Telegram webhooks require their respective signing secrets.

## Working on the project

Open a pull request against protected `main`, describe user-visible changes and rollout dependencies, and wait for the CI check. Merged branches are removed automatically. Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md); use issues for non-sensitive bugs and feature requests.

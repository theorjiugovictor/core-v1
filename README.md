# CORE Biz Manager

A modern, production-ready business management platform for small and medium-sized enterprises (SMEs), particularly in the food and catering industries.

## Features

- **AI-Powered Command Console**: Natural language processing for business operations using AWS Bedrock with Claude 3 Haiku
- **Inventory Management**: Track raw materials and finished products
- **Sales Recording**: Record and analyze transactions with multiple payment methods
- **Business Insights**: AI-generated recommendations based on your business data
- **Secure Authentication**: NextAuth.js-powered authentication with password hashing
- **Real-time Database**: Firebase Firestore for scalable data storage
- **Mobile Responsive**: Optimized for all screen sizes
- **Production Ready**: Security headers, rate limiting, and environment variable management

## Tech Stack

- **Framework**: Next.js 16 (App Router, React Server Components)
- **Language**: TypeScript 5
- **UI Library**: Radix UI + shadcn/ui
- **Styling**: Tailwind CSS 3.4
- **Authentication**: NextAuth.js (Auth.js) v5
- **Database**: Firebase Firestore
- **AI Integration**: AWS Bedrock with Claude 3 Haiku
- **Form Handling**: React Hook Form + Zod
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Firebase project (for database)
- AWS account with Bedrock access (for AI features)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd core-v1
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
# AWS Bedrock Configuration for AI features
# Get from: AWS Console > Security Credentials > Access Keys
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1

# Firebase Configuration
# Get from: Firebase Console > Project Settings > Service Accounts
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...","private_key":"..."}'

# NextAuth Configuration
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:9002

# Environment
NODE_ENV=development
```

4. Set up AWS Bedrock (for AI features):

- Sign in to [AWS Console](https://console.aws.amazon.com/)
- Enable AWS Bedrock in your region (us-east-1 recommended)
- Go to IAM > Security Credentials > Access Keys
- Create a new access key with Bedrock permissions
- Copy `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`

5. Set up Firebase:

- Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
- Enable Firestore Database
- Go to Project Settings > Service Accounts
- Click "Generate New Private Key"
- Copy the JSON content and set it as `FIREBASE_SERVICE_ACCOUNT_KEY`

6. Generate NextAuth secret:
```bash
openssl rand -base64 32
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   │   ├── login/
│   │   └── register/
│   ├── (main)/            # Protected application routes
│   │   ├── dashboard/
│   │   ├── materials/
│   │   ├── products/
│   │   ├── sales/
│   │   ├── insights/
│   │   └── settings/
│   └── api/               # API routes
│       └── auth/          # NextAuth endpoints
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utilities and services
│   ├── firebase/         # Firebase services
│   │   ├── config.ts
│   │   ├── users.ts
│   │   ├── materials.ts
│   │   ├── products.ts
│   │   └── sales.ts
│   ├── auth.ts           # NextAuth configuration
│   ├── auth-actions.ts   # Authentication server actions
│   ├── actions.ts        # General server actions
│   ├── bedrock.ts        # AWS Bedrock AI integration
│   ├── command-parser.ts # Enhanced NLP with Nigerian patterns
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Utility functions
├── hooks/                # Custom React hooks
└── middleware.ts         # Next.js middleware (security headers)
```

## Security Features

- **Password Hashing**: bcrypt with salted hashes
- **JWT Sessions**: Secure session management with NextAuth
- **Environment Variables**: All secrets stored in environment variables
- **Security Headers**: CSP, XSS protection, clickjacking prevention
- **Input Validation**: Zod schema validation on all forms
- **SQL Injection Protection**: Firestore NoSQL database
- **Rate Limiting**: Middleware-based rate limiting (production)

## API Documentation

### Authentication Endpoints

- `POST /api/auth/signin` - Sign in with credentials
- `POST /api/auth/signout` - Sign out current user
- `GET /api/auth/session` - Get current session

### Server Actions

- `loginAction(email, password)` - Authenticate user
- `registerAction(data)` - Create new user account
- `logoutAction()` - Sign out user
- `getParsedCommand(command)` - Parse natural language command
- `getBusinessInsights()` - Generate AI insights

## Firebase Collections

- `users` - User accounts and profiles
- `materials` - Raw material inventory
- `products` - Finished products/recipes
- `sales` - Sales transactions
- `insights` - AI-generated business insights

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AWS_ACCESS_KEY_ID` | Yes | AWS access key for Bedrock AI features |
| `AWS_SECRET_ACCESS_KEY` | Yes | AWS secret access key for Bedrock |
| `AWS_REGION` | No | AWS region (defaults to us-east-1) |
| `FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Yes | Firebase service account JSON |
| `NEXTAUTH_SECRET` | Yes | Secret for NextAuth JWT signing |
| `NEXTAUTH_URL` | Yes | Application URL |
| `NODE_ENV` | No | Environment (development/production) |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Yes (prod) | Rate limiting, webhook dedupe, cron dedupe. In production, AI and logins are refused without them |
| `WHATSAPP_APP_SECRET` | Yes (WhatsApp) | Meta app secret; verifies `X-Hub-Signature-256` on every webhook |
| `WHATSAPP_PHONE_NUMBER_ID` / `WHATSAPP_ACCESS_TOKEN` / `WHATSAPP_VERIFY_TOKEN` | Yes (WhatsApp) | Meta Cloud API credentials |
| `TELEGRAM_BOT_TOKEN` | Yes (Telegram) | Bot token |
| `TELEGRAM_WEBHOOK_SECRET` | Yes (Telegram) | Sent by Telegram as `X-Telegram-Bot-Api-Secret-Token`; must match `secret_token` in `setWebhook` |
| `CRON_SECRET` | Yes | Authorizes Vercel Cron requests |

## Deployment

CORE is deployed on **Vercel** (Pro plan, needed for commercial use). Firestore is the database.

### One-time production setup

1. **Firestore indexes.** Sales and expenses are queried by `userId` + `date`. Create the indexes before deploying the code that uses them:
   ```bash
   firebase deploy --only firestore:indexes
   ```
   Wait until they show as *Enabled* in the Firebase console.
2. **Function region.** In Vercel → Project → Settings → Functions, set the region closest to your Firestore location (Firebase console → Firestore → location). Every request makes several Firestore calls, so this matters more than distance to users.
3. **Environment variables.** Set everything in the table above for Production.
4. **Telegram.** After setting `TELEGRAM_WEBHOOK_SECRET`, re-register the webhook so Telegram starts sending the secret:
   ```bash
   curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
     -d "url=https://usecoreapp.com/api/webhooks/telegram" \
     -d "secret_token=$TELEGRAM_WEBHOOK_SECRET"
   ```
5. **Spend limit.** Vercel → Settings → Billing → Spend Management: set a limit so a traffic spike can't run up an unbounded bill.

### How the background work runs

- **Webhooks** (`/api/webhooks/whatsapp`, `/api/webhooks/telegram`) verify the platform signature, dedupe on the message id in Redis, return `200` immediately, and do the AI call and reply in `after()`.
- **Crons** (`vercel.json`) process users 100 per invocation, 10 at a time. When there are more users, the handler starts the next page as a new invocation. Each user is claimed in Redis per job per Lagos day, so retries never send duplicate emails.
- **Dates** are Lagos time (`Africa/Lagos`, UTC+1) everywhere: "today", "this week", KPIs, charts and cron windows. See `src/lib/time.ts`.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For support, create an issue in the repository.

## Roadmap

- [ ] Multi-user support with team collaboration
- [ ] Advanced analytics dashboard
- [ ] Export data to CSV/PDF
- [ ] Integration with accounting software
- [ ] Inventory alerts and notifications
- [ ] Multi-currency support
- [ ] Recipe costing calculator
- [ ] Supplier management

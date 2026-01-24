# CORE Biz Manager

A modern, production-ready business management platform for small and medium-sized enterprises (SMEs), particularly in the food and catering industries.

## Features

- **AI-Powered Command Console**: Natural language processing for business operations using Google Gemini
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
- **AI Integration**: Google Genkit with Gemini 2.5 Flash
- **Form Handling**: React Hook Form + Zod
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Firebase project (for database)
- Google Gemini API key (for AI features)

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
# Google Gemini API Key for AI features
# Get from: https://ai.google.dev/
GEMINI_API_KEY=your_gemini_api_key_here

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

4. Set up Firebase:

- Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
- Enable Firestore Database
- Go to Project Settings > Service Accounts
- Click "Generate New Private Key"
- Copy the JSON content and set it as `FIREBASE_SERVICE_ACCOUNT_KEY`

5. Generate NextAuth secret:
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
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Utility functions
├── ai/                   # AI/Genkit integration
│   ├── genkit.ts         # Genkit configuration
│   └── flows/            # AI flows
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
| `GEMINI_API_KEY` | Yes | Google Gemini API key for AI features |
| `FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Yes | Firebase service account JSON |
| `NEXTAUTH_SECRET` | Yes | Secret for NextAuth JWT signing |
| `NEXTAUTH_URL` | Yes | Application URL |
| `NODE_ENV` | No | Environment (development/production) |

## Deployment

### Firebase App Hosting

The project is configured for Firebase App Hosting:

```bash
firebase deploy --only hosting
```

### Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

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

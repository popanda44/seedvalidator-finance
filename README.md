# SeedValidator Finance

AI-powered financial command center for startups. Track your runway, optimize burn rate, and make data-driven decisions with intelligent insights.

![SeedValidator](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind](https://img.shields.io/badge/Tailwind%20CSS-4.0-38B2AC)
![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 Live Demo

**Production URL:** [https://potent-fin.vercel.app](https://potent-fin.vercel.app)

## ✨ Features

### Core FP&A
- **Real-time Dashboard** - Track cash balance, burn rate, runway, and MRR at a glance
- **Cash Flow Analysis** - Monitor all transactions with category filtering and search
- **Expense Tracking** - Category-wise breakdown with vendor analysis and trends
- **Revenue Forecasting** - Scenario-based projections with configurable assumptions
- **Smart Alerts** - Automated notifications for runway warnings, spending spikes, and opportunities

### Bank Integration
- **Plaid Connect** - Securely link bank accounts for automatic transaction sync
- **Multi-account Support** - Aggregate data from multiple checking and savings accounts
- **Real-time Sync** - Automatic background synchronization of transactions

### AI Insights
- **Intelligent Analysis** - AI-powered recommendations for burn optimization
- **Anomaly Detection** - Automatic flagging of unusual spending patterns
- **Growth Opportunities** - Data-driven suggestions for revenue acceleration

### User Experience
- **Dark/Light Mode** - System-aware theme with manual toggle
- **Responsive Design** - Optimized for desktop, tablet, and mobile
- **Onboarding Flow** - Guided setup for new users
- **Real-time Updates** - SWR-powered data fetching with auto-refresh

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL (Neon) |
| ORM | Prisma 6 |
| Auth | NextAuth.js 5 (Auth.js) |
| Banking | Plaid API |
| Payments | Stripe (coming soon) |
| Analytics | PostHog |
| Error Tracking | Sentry |
| Hosting | Vercel |

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/       # Protected dashboard pages
│   │   └── dashboard/
│   │       ├── alerts/
│   │       ├── cash-flow/
│   │       ├── expenses/
│   │       ├── forecasts/
│   │       └── settings/
│   ├── api/               # API routes
│   │   ├── alerts/
│   │   ├── dashboard/
│   │   ├── expenses/
│   │   ├── forecasts/
│   │   ├── plaid/
│   │   └── transactions/
│   ├── contact/
│   └── pricing/
├── components/            # React components
│   ├── charts/           # Chart components
│   ├── dashboard/        # Dashboard widgets
│   ├── layout/           # Layout components
│   ├── onboarding/       # Onboarding flow
│   ├── plaid/            # Plaid integration
│   └── ui/               # UI primitives
├── lib/                  # Utilities and services
│   ├── auth.ts           # NextAuth config
│   ├── plaid.ts          # Plaid client
│   ├── prisma.ts         # Database client
│   └── utils.ts          # Helper functions
└── prisma/
    └── schema.prisma     # Database schema
```

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Neon account)
- Plaid account (sandbox for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/popanda44/seedvalidator-finance.git
   cd seedvalidator-finance
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure your `.env.local`**
   ```env
   # Database
   DATABASE_URL="postgresql://..."

   # NextAuth
   AUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"

   # OAuth (optional)
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."
   GITHUB_CLIENT_ID="..."
   GITHUB_CLIENT_SECRET="..."

   # Plaid
   PLAID_CLIENT_ID="..."
   PLAID_SECRET="..."
   PLAID_ENV="sandbox"
   ```

5. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open [http://localhost:3000](http://localhost:3000)**

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Prisma Studio |

## 🔐 Authentication

SeedValidator supports multiple authentication methods:

- **Email/Password** - Traditional signup with email verification
- **Google OAuth** - Sign in with Google
- **GitHub OAuth** - Sign in with GitHub

Configure OAuth providers in your environment variables and corresponding developer consoles.

## 💳 Bank Integration

Plaid integration allows users to securely connect their bank accounts:

1. **Sandbox Mode** - Use Plaid sandbox for testing without real bank data
2. **Development Mode** - Test with real bank data in development
3. **Production Mode** - Full production access requires Plaid approval

### Test Credentials (Sandbox)
- Username: `user_good`
- Password: `pass_good`

## 🎨 Design System

SeedValidator uses a "High-End Minimalist" design language:

- **Colors**: True black backgrounds with subtle gradients
- **Typography**: Inter font family with clear hierarchy
- **Components**: Glassmorphism effects with smooth animations
- **Dark Mode**: First-class dark mode support

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/dashboard` | GET | Dashboard summary data |
| `/api/transactions` | GET | Transaction list with filtering |
| `/api/expenses` | GET | Expense breakdown by category |
| `/api/forecasts` | GET | Revenue projections |
| `/api/alerts` | GET, PATCH | Alert management |
| `/api/plaid/create-link-token` | POST | Create Plaid Link token |
| `/api/plaid/exchange-token` | POST | Exchange public token |
| `/api/plaid/sync` | POST | Sync transactions |

## 🌐 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy

```bash
vercel --prod
```

### Environment Variables for Production

Ensure these are set in your Vercel project:

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID` (optional)
- `GOOGLE_CLIENT_SECRET` (optional)
- `GITHUB_CLIENT_ID` (optional)
- `GITHUB_CLIENT_SECRET` (optional)
- `PLAID_CLIENT_ID`
- `PLAID_SECRET`
- `PLAID_ENV`

## 🗺️ Roadmap

- [x] Core dashboard with real-time data
- [x] Plaid bank integration
- [x] Authentication (Email, Google, GitHub)
- [x] Cash flow tracking
- [x] Expense analysis
- [x] Revenue forecasting
- [x] Alert system
- [x] Contact page
- [x] Onboarding flow
- [ ] Stripe subscription billing
- [ ] Email notifications (Resend)
- [ ] Team collaboration
- [ ] Mobile app

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Prisma](https://prisma.io/) - Database ORM
- [Plaid](https://plaid.com/) - Banking API
- [Vercel](https://vercel.com/) - Deployment platform

---

Built with ❤️ for startups

# MVP Technical Specification
## SeedValidator Finance - Phase 1 (Months 1-3)

**Version:** 1.0  
**Date:** December 17, 2024  
**Status:** Implementation Ready

---

## 1. MVP Feature Scope

### 1.1 RICE Prioritization Summary

| Feature | Reach | Impact | Confidence | Effort | RICE Score | Priority |
|---------|-------|--------|------------|--------|------------|----------|
| Real-Time Cash Dashboard | 10 | 3 | 90% | 2 | 13.5 | 🔴 P0 |
| Runway Calculator + Alerts | 10 | 3 | 95% | 1 | 28.5 | 🔴 P0 |
| Bank Integration (Plaid) | 10 | 3 | 85% | 3 | 8.5 | 🔴 P0 |
| Expense Tracking | 9 | 2 | 90% | 2 | 8.1 | 🔴 P0 |
| Revenue Forecasting | 8 | 2 | 80% | 3 | 4.3 | 🟡 P1 |
| Alert System | 9 | 2 | 90% | 2 | 8.1 | 🟡 P1 |
| Executive Dashboard | 10 | 2 | 90% | 2 | 9.0 | 🔴 P0 |
| PDF Export | 7 | 1 | 95% | 1 | 6.7 | 🟢 P2 |

---

## 2. MVP Feature Breakdown

### 2.1 Feature 1: Real-Time Cash Flow Dashboard

**User Story:** As a startup CEO, I want to see my cash position at a glance so I know exactly where we stand financially.

#### Components:
```
┌─────────────────────────────────────────────────────────────────┐
│                    CASH FLOW DASHBOARD                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ CASH BALANCE │  │ BURN RATE    │  │ RUNWAY       │          │
│  │   $842,500   │  │  $68,000/mo  │  │ 12.4 months  │          │
│  │   ▲ +$12K    │  │  ▼ -$3K      │  │ ▲ +0.5 mo    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    BURN RATE TREND                       │   │
│  │    $80K ┤                                                │   │
│  │    $70K ┤        ╭──╮      ╭──╮                          │   │
│  │    $60K ┤   ╭────╯  ╰──────╯  ╰────╮                     │   │
│  │    $50K ┤───╯                       ╰───                 │   │
│  │         └────┴────┴────┴────┴────┴────                   │   │
│  │           Jul  Aug  Sep  Oct  Nov  Dec                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 RECENT TRANSACTIONS                      │   │
│  │  ───────────────────────────────────────────────────     │   │
│  │  Dec 15  AWS                         -$12,450   Infra    │   │
│  │  Dec 14  Stripe Deposit              +$28,700   Revenue  │   │
│  │  Dec 12  Gusto Payroll               -$45,200   Payroll  │   │
│  │  Dec 10  Google Workspace            -$890      SaaS     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Technical Requirements:
| Requirement | Implementation |
|-------------|----------------|
| Bank Sync | Plaid API integration |
| Update Frequency | Daily automated sync |
| Data Retention | 24 months history |
| Categorization | Auto + manual override |

---

### 2.2 Feature 2: Runway Calculator with Alerts

**User Story:** As a founder, I want to know exactly when we'll run out of cash so I can plan fundraising.

#### Calculation Logic:
```typescript
// Runway Calculation
runway_months = current_cash / average_burn_rate

// Where:
average_burn_rate = sum(last_6_months_expenses) / 6

// Gross Burn = All expenses
// Net Burn = Expenses - Revenue
```

#### Alert Thresholds:
| Runway | Alert Level | Action |
|--------|-------------|--------|
| < 6 months | 🔴 Critical | Email + SMS + Dashboard banner |
| < 9 months | 🟠 Warning | Email + Dashboard badge |
| < 12 months | 🟡 Caution | Dashboard badge |
| ≥ 12 months | 🟢 Healthy | No alert |

---

### 2.3 Feature 3: Expense Tracking & Categorization

**User Story:** As a Finance Manager, I want expenses auto-categorized so I know where money is going.

#### Category Taxonomy:
```
├── 💼 Payroll & Benefits
│   ├── Salaries
│   ├── Bonuses
│   ├── Health Insurance
│   └── Payroll Taxes
├── 🖥️ Technology & Infrastructure
│   ├── Cloud Hosting (AWS, GCP, Azure)
│   ├── SaaS Subscriptions
│   ├── Software Licenses
│   └── Equipment
├── 📢 Sales & Marketing
│   ├── Advertising
│   ├── Events
│   ├── Content & Design
│   └── Tools
├── 🏢 Operations
│   ├── Office & Rent
│   ├── Utilities
│   ├── Insurance
│   └── Legal & Accounting
├── 🔧 Professional Services
│   ├── Contractors
│   ├── Consultants
│   └── Agencies
└── 📦 Other
    └── Miscellaneous
```

---

### 2.4 Feature 4: Basic Revenue Forecasting

**User Story:** As a CEO, I want to project revenue so I can plan growth.

#### Forecasting Methods (MVP):
1. **Linear Projection** - Based on historical growth rate
2. **Manual Override** - User-defined targets
3. **Seasonal Adjustment** - Optional modifier

#### Metrics Calculated:
| Metric | Formula |
|--------|---------|
| MRR | Sum of monthly recurring revenue |
| ARR | MRR × 12 |
| Growth Rate | (Current MRR - Previous MRR) / Previous MRR |
| Projected Revenue | Linear extrapolation |

---

### 2.5 Feature 5: Alert System

**User Story:** As a CEO, I want proactive alerts so I never get surprised by financial issues.

#### Alert Types:
| Alert Type | Trigger | Channel |
|------------|---------|---------|
| Runway Critical | < 6 months | Email, SMS, In-App |
| Spending Spike | > 50% MoM increase in category | Email, In-App |
| Large Transaction | > $10K single transaction | In-App |
| Payment Due | Bill due in 7 days | Email |
| Weekly Digest | Every Monday 8am | Email |

---

### 2.6 Feature 6: Executive Dashboard

**User Story:** As a CEO, I want all key metrics on one screen so I can quickly assess company health.

#### 6 Key Metrics:
```
┌─────────────────────────────────────────────────────────────────┐
│                   EXECUTIVE DASHBOARD                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐    ┌──────────────────┐                  │
│  │   💵 CASH         │    │   🔥 BURN RATE    │                  │
│  │    $842,500      │    │    $68,000/mo    │                  │
│  │    ▲ +5.2%       │    │    ▼ -4.2%       │                  │
│  └──────────────────┘    └──────────────────┘                  │
│                                                                 │
│  ┌──────────────────┐    ┌──────────────────┐                  │
│  │   🛤️ RUNWAY       │    │   📈 MRR          │                  │
│  │   12.4 months    │    │    $125,000      │                  │
│  │   ▲ +0.5 mo      │    │    ▲ +12%        │                  │
│  └──────────────────┘    └──────────────────┘                  │
│                                                                 │
│  ┌──────────────────┐    ┌──────────────────┐                  │
│  │   👥 TEAM SIZE    │    │   💰 NET BURN     │                  │
│  │      24          │    │    -$57,000/mo   │                  │
│  │   ▲ +2 this mo   │    │    ▼ improved    │                  │
│  └──────────────────┘    └──────────────────┘                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Technical Architecture

### 3.1 Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | Next.js 14 (App Router) | SSR, API routes, modern React |
| **Language** | TypeScript | Type safety, better DX |
| **Styling** | Tailwind CSS | Rapid UI development |
| **Database** | PostgreSQL (Neon) | Reliable, scalable |
| **ORM** | Prisma | Type-safe database access |
| **Auth** | NextAuth.js | OAuth, credentials |
| **Bank Data** | Plaid API | Industry standard |
| **Charts** | Recharts | React-native charting |
| **State** | React Query (TanStack) | Server state management |
| **Forms** | React Hook Form + Zod | Validation |
| **Email** | Resend | Transactional emails |
| **Hosting** | Vercel | Optimal for Next.js |

### 3.2 Database Schema (Core)

```prisma
// Core Models for MVP

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  company       Company?  @relation(fields: [companyId], references: [id])
  companyId     String?
  role          UserRole  @default(MEMBER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Company {
  id              String          @id @default(cuid())
  name            String
  users           User[]
  bankAccounts    BankAccount[]
  transactions    Transaction[]
  snapshots       FinancialSnapshot[]
  alerts          Alert[]
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

model BankAccount {
  id              String          @id @default(cuid())
  company         Company         @relation(fields: [companyId], references: [id])
  companyId       String
  plaidItemId     String?
  plaidAccountId  String?
  name            String
  type            AccountType
  currentBalance  Float           @default(0)
  lastSyncedAt    DateTime?
  transactions    Transaction[]
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

model Transaction {
  id              String          @id @default(cuid())
  company         Company         @relation(fields: [companyId], references: [id])
  companyId       String
  bankAccount     BankAccount     @relation(fields: [bankAccountId], references: [id])
  bankAccountId   String
  plaidTransactionId String?      @unique
  date            DateTime
  description     String
  amount          Float
  category        Category        @relation(fields: [categoryId], references: [id])
  categoryId      String
  isManualCategory Boolean        @default(false)
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

model Category {
  id              String          @id @default(cuid())
  name            String
  slug            String          @unique
  icon            String?
  color           String?
  parentId        String?
  parent          Category?       @relation("CategoryToCategory", fields: [parentId], references: [id])
  children        Category[]      @relation("CategoryToCategory")
  transactions    Transaction[]
  createdAt       DateTime        @default(now())
}

model FinancialSnapshot {
  id              String          @id @default(cuid())
  company         Company         @relation(fields: [companyId], references: [id])
  companyId       String
  date            DateTime
  cashBalance     Float
  burnRate        Float
  runway          Float
  mrr             Float?
  arr             Float?
  createdAt       DateTime        @default(now())
  
  @@unique([companyId, date])
}

model Alert {
  id              String          @id @default(cuid())
  company         Company         @relation(fields: [companyId], references: [id])
  companyId       String
  type            AlertType
  severity        AlertSeverity
  title           String
  message         String
  isRead          Boolean         @default(false)
  isDismissed     Boolean         @default(false)
  createdAt       DateTime        @default(now())
}

enum UserRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

enum AccountType {
  CHECKING
  SAVINGS
  CREDIT_CARD
  INVESTMENT
  OTHER
}

enum AlertType {
  RUNWAY_WARNING
  SPENDING_SPIKE
  LARGE_TRANSACTION
  PAYMENT_DUE
  WEEKLY_DIGEST
}

enum AlertSeverity {
  CRITICAL
  WARNING
  INFO
}
```

### 3.3 API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/*` | - | NextAuth routes |
| `/api/plaid/link-token` | POST | Get Plaid link token |
| `/api/plaid/exchange-token` | POST | Exchange public token |
| `/api/plaid/webhook` | POST | Plaid webhook handler |
| `/api/accounts` | GET | List bank accounts |
| `/api/accounts/[id]/sync` | POST | Trigger account sync |
| `/api/transactions` | GET | List transactions |
| `/api/transactions/[id]` | PATCH | Update category |
| `/api/dashboard` | GET | Dashboard metrics |
| `/api/forecasts` | GET, POST | Revenue forecasts |
| `/api/alerts` | GET | List alerts |
| `/api/alerts/[id]/dismiss` | POST | Dismiss alert |
| `/api/reports/pdf` | GET | Generate PDF report |

### 3.4 Folder Structure

```
seedvalidator-finance/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── cash-flow/page.tsx
│   │   │   ├── expenses/page.tsx
│   │   │   ├── forecasts/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── plaid/
│   │   │   ├── accounts/
│   │   │   ├── transactions/
│   │   │   ├── dashboard/
│   │   │   └── alerts/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                  # Shadcn/UI components
│   │   ├── dashboard/           # Dashboard-specific
│   │   ├── charts/              # Chart components
│   │   ├── alerts/              # Alert components
│   │   └── layout/              # Layout components
│   ├── lib/
│   │   ├── prisma.ts            # Prisma client
│   │   ├── plaid.ts             # Plaid client
│   │   ├── auth.ts              # Auth config
│   │   ├── utils.ts             # Utilities
│   │   └── calculations/        # Financial calculations
│   ├── hooks/                   # Custom React hooks
│   ├── types/                   # TypeScript types
│   └── config/                  # App configuration
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
├── tests/
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 4. MVP Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Beta Users | 100 | User signups |
| Weekly Active Rate | 60% | WAU/MAU |
| NPS Score | 8/10 | User survey |
| MRR (Month 6) | $50K | Revenue |
| Time to First Value | < 5 min | Onboarding time |
| Core Feature Adoption | 80% | % using runway calc |

---

## 5. Deferred Features (Post-MVP)

| Feature | Reason for Deferral | Target Phase |
|---------|---------------------|--------------|
| AI Scenario Planning | Complex ML infrastructure | Phase 2 |
| Vendor Cost Optimization | Requires benchmark data | Phase 2 |
| Customer Profitability | Needs CRM deep integration | Phase 3 |
| Fundraising Intelligence | Advanced feature | Phase 3 |
| Advanced ML Forecasting | Requires historical data | Phase 2 |
| Multi-Currency | International complexity | Phase 3 |
| Public API | Stability needed first | Phase 2 |

---

*Document maintained by Engineering Team. Last updated: December 17, 2024*

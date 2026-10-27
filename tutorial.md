# FinanceSimulator — Complete Masterclass Tutorial & Technical Guide

Welcome to the comprehensive, long-form technical guide and tutorial for **FinanceSimulator**. This document covers every architectural decision, mathematical model, frontend component, backend endpoint, database schema, and operational workflow powering the application.

---

## Table of Contents
1. [Project Overview & Philosophy](#1-project-overview--philosophy)
2. [Complete Tech Stack](#2-complete-tech-stack)
3. [Repository Directory Structure](#3-repository-directory-structure)
4. [Frontend Architecture (React Native & Expo)](#4-frontend-architecture-react-native--expo)
   - [Zustand State Machine (`useSimulationStore.ts`)](#zustand-state-machine)
   - [Minimalist Black & White Design System](#minimalist-black--white-design-system)
   - [Screen Flows & User Journeys](#screen-flows--user-journeys)
   - [Ground Zero Profile Builder](#ground-zero-profile-builder)
   - [The "Switch Profile" Navigation Flow](#the-switch-profile-navigation-flow)
5. [Core Simulation & Mathematical Engines](#5-core-simulation--mathematical-engines)
   - [Monthly Compounding & Cash Flow Engine](#monthly-compounding--cash-flow-engine)
   - [Financial Health Scoring (0–100)](#financial-health-scoring-0100)
   - [Career & Promotion Engine (`CareerEngine.ts`)](#career--promotion-engine)
   - [Stochastic Event Engine (`EventEngine.ts`)](#stochastic-event-engine)
   - [100+ Culturally Nuanced Life Scenarios](#100-culturally-nuanced-life-scenarios)
6. [Backend Architecture (Node.js & Express)](#6-backend-architecture-nodejs--express)
   - [Server Pipeline & Lifecycle](#server-pipeline--lifecycle)
   - [Sliding-Window Rate Limiter Middleware](#sliding-window-rate-limiter-middleware)
   - [JWT Authentication & Token Rotation](#jwt-authentication--token-rotation)
   - [Complete 22 REST API Specifications](#complete-22-rest-api-specifications)
7. [Database Architecture & ORM (PostgreSQL & Prisma)](#7-database-architecture--orm-postgresql--prisma)
   - [Data Models & Relationships](#data-models--relationships)
   - [High-Speed B-Tree Indexing Strategy](#high-speed-b-tree-indexing-strategy)
   - [Seeding & Initial Community Data](#seeding--initial-community-data)
8. [Step-by-Step Developer Runbook](#8-step-by-step-developer-runbook)
9. [Troubleshooting & FAQs](#9-troubleshooting--faqs)

---

## 1. Project Overview & Philosophy

**FinanceSimulator** is a mobile-first financial life simulation game designed to teach real-world wealth accumulation, debt management, career velocity, and behavioral psychology in the Indian socioeconomic context.

### Core Architectural Pillars
1. **Zero Hardcoded Constraints**: Players can choose between 6 rich playable character archetypes, start from a true **Ground Zero Canvas (₹0 Net Worth)** with custom job and earnings, or configure custom sandboxes.
2. **True Stochastic Non-Linearity**: Life does not happen in sequential order. Events are sampled using dynamic weighted probability distributions taking into account current liquidity, debt stress, and calendar seasonality.
3. **Realistic Career & Lifestyle Creep Mechanics**: Promotions deliver meaningful base salary hikes (+22% to +38%) and bonuses, but challenge players with the **Lifestyle Inflation Dilemma** (the primary destroyer of wealth velocity).
4. **Minimalist Black & White Aesthetic**: Elimination of chaotic neon AI templates in favor of a distraction-free, high-contrast monochrome design inspired by Scandinavian and Apple luxury fintech standards.
5. **Decoupled Client-Server Sync**: The frontend operates 100% offline with zero crash risk, batching simulation state snapshots to a PostgreSQL database whenever network connectivity is present.

---

## 2. Complete Tech Stack

### Frontend Mobile Client
- **Framework**: [React Native](https://reactnative.dev/) `0.88.0` with [Expo SDK](https://expo.dev/) `v58.0.0` (100% compatible with Expo Go on Android and iOS).
- **Language**: [TypeScript](https://www.typescriptlang.org/) `5.7+` (Strict type safety across models, props, and stores).
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) `v5.0.15` (Lightweight, hook-based, reactive state machine).
- **Animation & Gestures**: [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) `4.7.1` and [Expo Haptics](https://docs.expo.dev/versions/latest/sdk/haptics/) `~58.0.7`.
- **Vector Graphics**: [React Native SVG](https://github.com/software-mansion/react-native-svg) `15.16.0` and [@expo/vector-icons](https://icons.expo.fyi/) `^15.0.2` (Ionicons).

### Backend Server
- **Runtime**: [Node.js](https://nodejs.org/) `v20+ / v22+`.
- **Server Framework**: [Express.js](https://expressjs.com/) `4.21.2` (RESTful API architecture).
- **ORM & Database Client**: [Prisma ORM](https://www.prisma.io/) `v6.2.0`.
- **Authentication & Security**: [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) `9.0.2` (Access tokens + 30-day Refresh tokens), [bcryptjs](https://github.com/dcodeIO/bcrypt.js) `2.4.3` (10-round salted password hashing).
- **Validation**: [Zod](https://zod.dev/) `3.24.1` (Strict request payload schema parsing and sanitization).
- **Execution & Hot Reload**: `tsx watch` (TypeScript execution without separate compile step).

### Database & Infrastructure
- **Database**: [PostgreSQL](https://www.postgresql.org/) `16-alpine` running inside an isolated Docker container (`finance_sim_postgres`).
- **Data Persistence**: Docker named volume `cslab_postgres_data`.
- **Cross-Origin Resource Sharing**: `cors` configured for local LAN and mobile emulators.

---

## 3. Repository Directory Structure

```
d:\CSLAB
├── package.json                   # Root Expo / React Native dependencies & scripts
├── tsconfig.json                  # Root TypeScript configuration
├── App.tsx                        # Root app component & tab navigation coordinator
├── index.ts                       # Expo root registration entry point
├── docker-compose.yml             # PostgreSQL 16 Alpine service definition
├── COMPLETE_SYSTEM_GUIDE.md       # Technical architecture reference guide
├── walkthrough.md                 # Visual walkthrough and verification report
├── tutorial.md                    # THIS TUTORIAL GUIDE
│
├── src/                           # Mobile Frontend Source Code
│   ├── core/                      # Pure Business Logic & Simulation Engines
│   │   ├── career/
│   │   │   └── CareerEngine.ts    # 4-track promotion engine & lifestyle creep dilemmas
│   │   ├── debt/
│   │   │   └── DebtEngine.ts      # Loan amortization, interest, and payoff calculator
│   │   ├── events/
│   │   │   ├── EventEngine.ts     # Dynamic weighted stochastic random event sampler
│   │   │   └── scenarios.ts       # 100+ comprehensive Indian financial dilemmas
│   │   ├── health/
│   │   │   └── HealthEngine.ts    # 4-pillar financial health scoring engine (0-100)
│   │   ├── simulation/
│   │   │   └── SimulationEngine.ts# Monthly cash flow, SIP compounding, and balance sheet
│   │   └── types/
│   │       ├── characters.ts      # 6 playable character archetypes & Ground Zero preset
│   │       └── profile.ts         # UserProfile, LifeStage, and budget interfaces
│   │
│   ├── services/
│   │   └── apiClient.ts           # Axios/Fetch HTTP client with token refresh & LAN IP auto-detection
│   │
│   ├── store/
│   │   ├── useSimulationStore.ts  # Master simulation state machine (Zustand)
│   │   └── useAuthStore.ts        # Cloud authentication and sync manager
│   │
│   └── ui/                        # Presentation & User Interface
│       ├── components/
│       │   ├── AuthModal.tsx      # Sign In / Register / LAN connection manager
│       │   ├── PromotionModal.tsx # Minimalist B&W career promotion celebration modal
│       │   ├── HealthGauge.tsx    # Circular SVG financial health score meter
│       │   ├── InteractiveAvatar.tsx # Dynamic emotional avatar reacting to financial stress
│       │   ├── SwipeDilemmaCard.tsx  # Interactive swipeable dilemma decision cards
│       │   ├── CurrencyText.tsx   # Indian Rupee (₹) number formatting utility
│       │   └── WhatIfChart.tsx    # Counterfactual financial trajectory comparison
│       │
│       ├── screens/
│       │   ├── OnboardingScreen.tsx # Archetype selector & Ground Zero Profile Builder
│       │   ├── DashboardScreen.tsx  # Mission control (Net Worth, Budget, Advance Month, Switch Profile)
│       │   ├── LifeScreen.tsx       # Active stochastic dilemma arena & choice history
│       │   ├── PortfolioScreen.tsx  # Asset allocation, mutual fund SIPs, gold, and debt
│       │   ├── WhatIfScreen.tsx     # Time-machine financial scenario simulator
│       │   └── CoachScreen.tsx      # AI financial mentor conversation interface
│       │
│       └── theme/
│           └── colors.ts          # Minimalist Black & White design tokens
│
└── server/                        # Express + PostgreSQL Backend
    ├── package.json               # Backend dependencies & Prisma scripts
    ├── tsconfig.json              # Server TypeScript compiler options
    ├── .env.example               # Template environment configuration
    ├── prisma/
    │   ├── schema.prisma          # Authoritative PostgreSQL schema & indexes
    │   ├── seed.ts                # Database seeding script for community leaderboards
    │   └── migrations/            # Version-controlled SQL migration history
    │
    ├── scripts/
    │   └── test-api.ts            # Automated 22-endpoint verification test suite
    │
    └── src/
        ├── index.ts               # Express server bootstrap, middleware, graceful shutdown
        ├── lib/
        │   ├── prisma.ts          # Shared Prisma client instance
        │   └── jwt.ts             # Token issuance and verification helpers
        ├── middleware/
        │   ├── auth.ts            # Bearer JWT extraction and route protection
        │   └── rateLimit.ts       # Sliding window in-memory rate limiter
        └── routes/
            ├── auth.ts            # Register, Login, Refresh, Profile, Password, Delete
            ├── game.ts            # State Sync, Promotions, Saves, Achievements, Market Pulse, Export
            ├── analytics.ts       # Health diagnostic audit and peer benchmarking
            ├── leaderboard.ts     # Global Net Worth, Health Score, and Longevity rankings
            └── coach.ts           # AI Coach chat persistence and history
```

---

## 4. Frontend Architecture (React Native & Expo)

### Zustand State Machine (`useSimulationStore.ts`)
The entire mobile client state is orchestrated by a single reactive store:

```ts
interface SimulationStore {
  // State variables
  isInitialized: boolean;
  activeTab: AppTab;
  profile: UserProfile;
  balanceSheet: BalanceSheet;
  budget: MonthlyBudget;
  healthScore: FinancialHealthScore;
  currentEvent: SimulationEvent | null;
  activePromotionOffer: PromotionOffer | null;
  monthsInCurrentRole: number;
  gamification: GamificationState;

  // Actions
  initializeSimulation: (options: SimulationInitOptions) => void;
  advanceMonth: () => void;
  makeDecision: (optionId: string) => void;
  acceptPromotion: (optionId: string) => void;
  resetSimulation: () => void;
  restoreCloudSave: (saveData: any) => void;
}
```

#### Why Zustand over Redux?
* **Zero Boilerplate**: No actions, reducers, or dispatch wrappers. State mutations occur directly via immutable setters.
* **Granular Subscriptions**: Screens subscribe only to the specific slices of state they render (e.g. `useSimulationStore(s => s.balanceSheet.netWorth)`), preventing unnecessary full-tree re-renders during high-frequency animations.
* **Offline First**: All simulation actions update local state immediately. Cloud sync runs asynchronously in the background.

---

### Minimalist Black & White Design System
Following strict product guidelines, all competing neon colors and multi-border cards ("Card Inception") were removed:

| Token Name | Color Value | Applied Context |
| :--- | :--- | :--- |
| `background` | `#000000` | Pure pitch-black application canvas |
| `card` | `#121212` | Elevated dark charcoal card containers |
| `cardBorder` | `#262626` | 1px razor-sharp borders on cards |
| `text` | `#FFFFFF` | Bold headings, primary values, and Net Worth |
| `textSecondary` | `#888888` | Microcopy, labels, and timestamps |
| `accentGreen` | `#00FF66` | Minimalist indicator for positive cash flow / health |
| `buttonBg` | `#FFFFFF` | Solid white high-contrast primary action buttons |
| `buttonText` | `#000000` | Bold black text on white primary buttons |

---

### Ground Zero Profile Builder
Located inside [`src/ui/screens/OnboardingScreen.tsx`](file:///d:/CSLAB/src/ui/screens/OnboardingScreen.tsx), the **Start from ₹0** mode gives players complete freedom to build their starting profile:

```
+-------------------------------------------------------+
|  GROUND ZERO PROFILE BUILDER    [ ₹0 NET WORTH ]      |
+-------------------------------------------------------+
|  Name: [ Vidhut ]                Age: [ 21 ]          |
+-------------------------------------------------------+
|  QUICK JOB PRESETS:                                   |
|  [ Junior SDE ] [ UI Designer ] [ Analyst ] [ Intern ]|
+-------------------------------------------------------+
|  JOB TITLE: [ Junior Software Engineer              ] |
|  CATEGORY:  (•) Full-Time Job   ( ) Freelance         |
|             ( ) Side Business   ( ) Job Hunting (₹0)  |
+-------------------------------------------------------+
|  MONTHLY EARNING:  [ ₹45,000 ]                        |
|  LIVING EXPENSES:  [ ₹20,000 ]                        |
+-------------------------------------------------------+
|  Monthly Compounding Surplus: ₹25,000/mo (Surplus)    |
+-------------------------------------------------------+
|  Starting Cash: ₹0 | Savings: ₹0 | Initial Debt: ₹0   |
+-------------------------------------------------------+
|         [ LAUNCH GROUND ZERO SIMULATION -> ]          |
+-------------------------------------------------------+
```

1. **Custom Job & Role**: Choose from 8 quick-select presets or type any role.
2. **Income Structure**: Select salary, freelance gigs, small business, or internship stipend.
3. **Living Expenses Baseline**: Automatically calculates monthly investable surplus (`Income - Expenses`).
4. **The Ground Zero Guarantee**: Starting cash, savings, and debt are all strictly initialized to **₹0**, giving the player a true zero-net-worth starting line.

---

### The "Switch Profile" Navigation Flow
Players can return to the character selection screen at any point without restarting the app:
1. **Dashboard Top Bar**: Tapping the **`[ ⇄ Switch Profile ]`** button prompts:
   *"Return to the first page to choose a different character archetype or start from zero with a new profile?"*
2. **Store Action**: Confirming triggers `resetSimulation()`, which sets `isInitialized = false`.
3. **App Coordinator**: `App.tsx` immediately unmounts the dashboard tabs and renders `OnboardingScreen`, allowing the player to select another character or create a new profile.

---

## 5. Core Simulation & Mathematical Engines

### Monthly Compounding & Cash Flow Engine
Every time the player advances a month, [`SimulationEngine.ts`](file:///d:/CSLAB/src/core/simulation/SimulationEngine.ts) resolves the complete financial ledger:

$$\text{Net Cash Flow} = \text{Monthly Salary} - \text{Fixed Needs} - \text{Discretionary Wants} - \sum \text{EMIs} - \sum \text{SIPs}$$

1. **Surplus Cash Allocation**: Positive net cash flows are credited to `liquidCash`. If `liquidCash` exceeds 2 months of expenses, excess cash auto-allocates to the emergency fund until 6 months of buffer is reached.
2. **Deficit Resolution**: If expenses exceed income, the engine withdraws from liquid cash. If liquid cash reaches ₹0, emergency reserves are liquidated. If all reserves hit ₹0, a high-interest credit card debt penalty is triggered.
3. **Equity Appreciation**: Mutual fund SIP investments compound monthly based on the prevailing economic climate:
   $$\text{Portfolio}_{t+1} = \left(\text{Portfolio}_t + \text{Monthly SIP}\right) \times \left(1 + \frac{r}{12}\right)$$
   *(Where $r = 14\%$ in Bull markets, $11\%$ in Stagnant markets, and $-18\%$ in Bear dips)*.
4. **Debt Amortization**: Loans accrue interest monthly and reduce principal by the scheduled EMI amount.

---

### Financial Health Scoring (0–100)
[`HealthEngine.ts`](file:///d:/CSLAB/src/core/health/HealthEngine.ts) grades financial resilience across 4 weighted pillars:

$$\text{Health Score} = S_{\text{emergency}} + S_{\text{dti}} + S_{\text{savings}} + S_{\text{networth}}$$

| Pillar | Max Score | Ideal Benchmark | Scoring Formula |
| :--- | :---: | :--- | :--- |
| **Emergency Buffer** | 30 pts | 6+ months of living expenses | $\min\left(30, \frac{\text{Liquid Cash + Emergency Fund}}{\text{Monthly Needs + Wants}} \times 5\right)$ |
| **Debt-to-Income (DTI)** | 25 pts | 0% debt (No EMIs) | $25 \times \max\left(0, 1 - \frac{\text{Total EMIs}}{\text{Monthly Income} \times 0.5}\right)$ |
| **Savings Rate** | 25 pts | $\ge 40\%$ of monthly income | $\min\left(25, \frac{\text{Monthly Savings + SIP}}{\text{Monthly Income}} \times 62.5\right)$ |
| **Net Worth Margin** | 20 pts | Assets exceed liabilities by 2x | $20 \times \min\left(1, \frac{\text{Total Assets}}{\max(1, \text{Total Liabilities} \times 2)}\right)$ |

- **Letter Grades**: `A+` ($\ge 90$), `A` ($80–89$), `B` ($70–79$), `C` ($50–69$), `D` ($< 50$).

---

### Career & Promotion Engine (`CareerEngine.ts`)
Career growth is modeled across 4 seniority tiers for 4 career tracks:
* **Tech Track**: Junior Software Engineer ➔ SDE-2 ➔ Senior Staff Lead ➔ Principal Architect / VP Eng.
* **Business Track**: Bootstrapped Hustler ➔ Early Stage Operator ➔ Growth Business Owner ➔ Managing Director.
* **Creative Track**: Junior Freelancer ➔ Independent Consultant ➔ Agency Founder ➔ Executive Creative Director.
* **Corporate General Track**: Entry Associate ➔ Operations Manager ➔ Strategy Director ➔ Chief Operating Officer.

#### Promotion Eligibility
Evaluated monthly based on role duration and performance score:
$$\text{Eligibility Score} = \min\left(1.0, \frac{\text{tenureMonths}}{\text{requiredTenure}}\right) \times \left(\frac{\text{HealthScore}}{100}\right)$$

When promoted, the player receives:
1. **Base Salary Hike**: +22% to +38% increase in monthly earnings.
2. **Performance Bonus**: One-time lump sum (e.g. ₹55,000).
3. **The Lifestyle Inflation Dilemma**:
   * *Option A (The Compounding Machine)*: 80% of hike invested into index funds, 20% into lifestyle.
   * *Option B (Balanced Growth)*: 50% invested, 50% upgraded living.
   * *Option C (Full Upgrade)*: 100% of hike absorbed into rent and luxury lifestyle.

---

### Stochastic Event Engine (`EventEngine.ts`)
Instead of fixed sequential events, scenarios are chosen via **Dynamic Weighted Random Sampling**:
```ts
const weighted = unplayed.map((event) => {
  let weight = 100;
  // Low cash increases likelihood of emergency scenarios
  if (event.category === 'emergency' && context.liquidCash < 50000) weight += 80;
  // High portfolio increases market and tax scenarios
  if (event.category === 'markets' && context.netWorth > 1000000) weight += 70;
  // Seasonal Indian calendar triggers
  if (event.category === 'taxes' && context.currentMonth === 3) weight += 150; // March FY End
  if (event.category === 'lifestyle' && (context.currentMonth === 10 || context.currentMonth === 11)) weight += 90; // Diwali
  return { event, weight };
});
```

### 100+ Culturally Nuanced Life Scenarios
[`scenarios.ts`](file:///d:/CSLAB/src/core/events/scenarios.ts) includes 100+ comprehensive dilemmas:
* **Career**: Moonlighting startup offers, client retainer negotiations, equity vs cash bonuses.
* **Housing**: Buying a 3BHK flat on a 20-year home loan vs investing the down payment in Nifty 50.
* **Lifestyle**: Luxury car on 7-year EMI vs pre-owned vehicle, destination weddings.
* **Emergencies**: Critical illness in family without health insurance, emergency root canal, laptop damage.
* **Scams**: WhatsApp pump-and-dump stock groups, unregistered chit funds, instant loan app traps.
* **Markets**: Panic-selling during a 20% Nifty crash vs deploying cash into the dip.
* **Taxes**: Old vs New Tax Regime optimization, Section 80C rush.
* **Family Pressures**: Buying physical gold for family weddings vs Sovereign Gold Bonds.

---

## 6. Backend Architecture (Node.js & Express)

### Server Pipeline & Lifecycle
The Express backend ([`server/src/index.ts`](file:///d:/CSLAB/server/src/index.ts)) listens on port `4000`:
1. **CORS**: Configured to accept incoming connections from web browsers, Android emulators, and local Wi-Fi devices.
2. **Body Parser**: Handles up to `10mb` JSON payloads to support large ledger export and import syncs.
3. **Request Logger**: Logs all HTTP methods, URLs, and timestamps.
4. **Sliding Window Rate Limiter**: Protects auth endpoints from brute-force attempts.
5. **Route Mounting**: `/api/auth`, `/api/game`, `/api/analytics`, `/api/leaderboard`, `/api/coach`.
6. **Graceful Shutdown**: Traps `SIGINT` to safely disconnect Prisma connection pools.

---

### Sliding-Window Rate Limiter Middleware
Implemented in [`server/src/middleware/rateLimit.ts`](file:///d:/CSLAB/server/src/middleware/rateLimit.ts):
* Tracks IP request timestamps in an in-memory Map.
* Filters timestamps older than the sliding window (`15 minutes`).
* If requests exceed `50`, returns HTTP `429 Too Many Requests` with a `Retry-After: <seconds>` header.
* Features background garbage collection every 5 minutes with `.unref()` to prevent event loop blocking.

---

### JWT Authentication & Token Rotation
* **Access Tokens**: Short-lived (15 minutes), signed with `JWT_ACCESS_SECRET`.
* **Refresh Tokens**: Long-lived (30 days), stored in the PostgreSQL `RefreshToken` table with cascade delete.
* **Rotation**: Calling `POST /api/auth/refresh` issues a fresh access token without requiring re-login.

---

### Complete 22 REST API Specifications

#### System & Discovery
1. `GET /` — Root service discovery returning full endpoint directory.
2. `GET /api/health` — Executes `SELECT 1` on PostgreSQL, returning database connection status.

#### Authentication (`/api/auth`)
3. `POST /api/auth/register` — Registers player account with salted bcrypt hash (min 6 char password).
4. `POST /api/auth/login` — Authenticates email and password, issuing access & refresh tokens.
5. `POST /api/auth/refresh` — Validates refresh token and issues a new access token.
6. `GET /api/auth/me` — Returns authenticated profile and total game saves count.
7. `PUT /api/auth/profile` — Updates player display name.
8. `PUT /api/auth/password` — Verifies current password and updates to new password.
9. `DELETE /api/auth/account` — Permanently deletes user account and cascades all game saves.

#### Game Simulation (`/api/game`)
10. `POST /api/game/sync` — Upserts simulation snapshot, updating indexed net worth and health score.
11. `POST /api/game/promotion` — Permanently records salary hike, title upgrade, and lifestyle inflation choice.
12. `GET /api/game/saves` — Lists all active character slots for the user.
13. `GET /api/game/state/:id?` — Retrieves specific save slot or latest active game save with decision history.
14. `GET /api/game/achievements` — Returns master catalog of all in-game badges with XP rewards.
15. `POST /api/game/achievement/unlock` — Server-verified badge unlock with level-up calculations.
16. `GET /api/game/market-pulse` — Simulated macroeconomic indicators (inflation 5.2%, repo rate 6.5%).
17. `GET /api/game/export/:id` — Exports full JSON ledger for download.
18. `DELETE /api/game/save/:id` — Deletes a specific character save slot.

#### Analytics & Diagnostics (`/api/analytics`)
19. `GET /api/analytics/:gameSaveId` — Computes financial health grade (A+, A, B, C, D), emergency buffer months, savings rate, and actionable financial advice.
20. `GET /api/analytics/peer-benchmark/:gameSaveId` — Computes exact wealth percentile rank vs database community averages.

#### Leaderboards (`/api/leaderboard`)
21. `GET /api/leaderboard/wealth` — Top 25 players ranked by Net Worth.
22. `GET /api/leaderboard/health` — Top 25 players ranked by Financial Health Score.
23. `GET /api/leaderboard/streaks` — Top 25 players ranked by simulation longevity (months survived).

#### AI Coach (`/api/coach`)
24. `POST /api/coach/message` — Persists financial advisor Q&A interactions linked to the game save.
25. `GET /api/coach/history/:gameSaveId` — Retrieves historical coach discussions.

---

## 7. Database Architecture & ORM (PostgreSQL & Prisma)

### Data Models & Relationships
Defined in [`server/prisma/schema.prisma`](file:///d:/CSLAB/server/prisma/schema.prisma):

```prisma
model User {
  id            String         @id @default(uuid())
  email         String         @unique
  passwordHash  String
  displayName   String
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  gameSaves     GameSave[]
  refreshTokens RefreshToken[]
}

model GameSave {
  id                   String         @id @default(uuid())
  userId               String
  user                 User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  characterName        String         @default("Player")
  characterArchetype   String         @default("custom")
  currentAge           Int            @default(22)
  currentMonth         Int            @default(1)
  currentStage         String         @default("first_job")
  totalMonthsSimulated Int            @default(0)
  
  // Indexed metrics for lightning-fast leaderboard queries
  netWorth             Float          @default(0)
  healthScoreValue     Float          @default(50)
  level                Int            @default(1)
  isActive             Boolean        @default(true)

  // JSONB Document Fields
  balanceSheet         Json
  budget               Json
  healthScore          Json
  gamification         Json

  decisionLogs         DecisionLog[]
  promotionLogs        PromotionLog[]
  coachChatLogs        CoachChatLog[]

  createdAt            DateTime       @default(now())
  updatedAt            DateTime       @updatedAt

  @@index([userId])
  @@index([netWorth])
  @@index([healthScoreValue])
  @@index([totalMonthsSimulated])
  @@index([isActive])
}
```

### High-Speed B-Tree Indexing Strategy
The `GameSave` model includes B-Tree indexes on `netWorth`, `healthScoreValue`, `totalMonthsSimulated`, and `isActive`. This allows leaderboard queries such as:
```sql
SELECT * FROM "GameSave" WHERE "isActive" = true ORDER BY "netWorth" DESC LIMIT 25;
```
to execute in **< 1 millisecond** using index scans, even with hundreds of thousands of active game saves.

### Seeding & Initial Community Data
Running `npx tsx prisma/seed.ts` populates realistic benchmark players:
1. **Vikram Reddy** (`Startup Founder`, Age 29, Net Worth ₹42,00,000, 48 months simulated).
2. **Kabir Mehta** (`Senior SDE`, Age 27, Net Worth ₹18,50,000, 38 months simulated).
3. **Priya Deshmukh** (`Conservative Saver`, Age 25, Net Worth ₹12,20,000, 24 months simulated).

---

## 8. Step-by-Step Developer Runbook

### Step 1: Start the PostgreSQL Docker Container
Make sure Docker Desktop is running, then run from `d:\CSLAB`:
```powershell
docker start finance_sim_postgres
```
*(If starting for the first time: `docker compose up -d`)*

### Step 2: Database Migration & Seeding
```powershell
cd server
npm install
npx prisma generate
npx prisma migrate dev
npx tsx prisma/seed.ts
```

### Step 3: Run Full Backend Test Suite
Verify that all 22 API endpoints pass against PostgreSQL:
```powershell
npx tsx scripts/test-api.ts
```

### Step 4: Start the Backend Server
```powershell
npm run dev
```
Server starts on `http://localhost:4000` (or `http://<your-wifi-ip>:4000`).

### Step 5: Start the Mobile Application
In a separate terminal from project root (`d:\CSLAB`):
```powershell
npm start
```
- **Android Emulator**: Press `a`.
- **Physical Device**: Scan the QR code using the **Expo Go** app on Android or iOS.
- **LAN Wi-Fi Connection**: If running on a physical phone, tap the **Server** toggle inside the auth modal and select the `Wi-Fi (10.208.114.144)` preset, then tap **"Test Connection"** to verify connectivity!

---

## 9. Troubleshooting & FAQs

### Q1: `java.net.ConnectException` / `Failed to fetch` on physical phone
* **Root Cause**: The phone is trying to reach `localhost:4000` (its own loopback) or an outdated Wi-Fi IP address.
* **Fix**: Open the **Server** dropdown in `AuthModal.tsx` and select your current computer Wi-Fi IP (e.g. `http://10.208.114.144:4000/api`), then tap **"Test Connection"** to verify the green checkmark before signing in.

### Q2: Windows Prisma DLL Lock (`EPERM: query_engine-windows.dll.node`)
* **Root Cause**: Running `npx prisma generate` while the server process (`tsx watch`) is actively holding the DLL in memory.
* **Fix**: Terminate the running server with `Ctrl+C`, run `npx prisma generate`, then restart `npm run dev`.

### Q3: `409 Conflict: Email already exists`
* **Root Cause**: Attempting to register an email address that is already recorded in PostgreSQL.
* **Fix**: Tap the **"Switch to Sign In →"** shortcut on the error banner to log in with your password.

---

*Authored for the FinanceSimulator engineering repository.*

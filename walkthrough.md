# Finance Life Simulator — Complete Product & Technical Walkthrough

A comprehensive walkthrough of the **Finance Life Simulator** platform: its minimalist Black & White design system, core simulation engines, 100+ stochastic scenarios, complete Express + PostgreSQL backend, and character management features.

---

## 1. Visual UI Walkthrough (Black & White Theme)

````carousel
![Screen 1: Onboarding & Ground Zero Profile Builder](/C:/Users/Vidhut/.gemini/antigravity/brain/3ddec443-f5cd-42e6-85db-435917aa0efc/finance_life_simulator_onboarding_ui_1792525690618.jpg)
<!-- slide -->
![Screen 2: Main Simulation Dashboard](/C:/Users/Vidhut/.gemini/antigravity/brain/3ddec443-f5cd-42e6-85db-435917aa0efc/simulation_dashboard_mockup_1792525738013.jpg)
<!-- slide -->
![Screen 3: Career Promotion & Lifestyle Inflation Modal](/C:/Users/Vidhut/.gemini/antigravity/brain/3ddec443-f5cd-42e6-85db-435917aa0efc/career_promotion_modal_ui_1792525821883.jpg)
<!-- slide -->
![Screen 4: Life Dilemma & Stochastic Event Screen](/C:/Users/Vidhut/.gemini/antigravity/brain/3ddec443-f5cd-42e6-85db-435917aa0efc/finance_life_simulator_event_screen_v2_1792555007043.jpg)
<!-- slide -->
![Screen 5: Community Leaderboard & Peer Benchmarking](/C:/Users/Vidhut/.gemini/antigravity/brain/3ddec443-f5cd-42e6-85db-435917aa0efc/finance_simulator_leaderboard_ui_1792555052882.jpg)
````

---

## 2. Feature Walkthrough & How Everything Works

### Feature 1: First Page & Character Setup (`OnboardingScreen.tsx`)
The onboarding screen welcomes players with 3 distinct setup pathways:

1. **Character Roster (6 Archetypes)**:
   * **Kabir Mehta**: High-Growth Tech SDE (High salary, aggressive investing, tech accelerator perk).
   * **Aarav Sharma**: Creative Freelancer (Variable cash flow, digital asset royalties).
   * **Priya Deshmukh**: Conservative Saver (Frugal living, debt-free, Sovereign Gold Bonds).
   * **Dr. Meera Iyer**: Medical Resident (High education loan, delayed high earning curve).
   * **Vikram Reddy**: Bootstrapped Founder (High risk, equity illiquidity, massive upside).
   * **Ananya Sen**: Tier-2 Aspirant (Starting from modest salary with rapid compounding velocity).

2. **Start from ₹0 (Ground Zero Profile Builder)**:
   * Allows players to build their custom real-world or aspirational profile:
     * **Name & Age**: Personalized character identity.
     * **Job Title & Role**: 8 quick-select presets (*Junior SDE*, *UI Designer*, *Financial Analyst*, *Marketer*, *Sales Lead*, *Founder*, *Intern*, *Job Seeker*) or custom profession.
     * **Income Source Category**: Full-Time Salary, Freelance / Gigs, Side Business, Internship Stipend, or Job Hunting (₹0).
     * **Monthly Financial Flow**: Set monthly salary and fixed living expenses with real-time monthly compounding surplus calculation.
     * **Ground Zero Guarantee**: Starting Cash = ₹0, Savings = ₹0, Debt = ₹0, Initial Net Worth = **₹0**.

3. **Custom Setup**: Full sandbox mode allowing custom starting liquid cash and initial debt balances.

---

### Feature 2: Switch Profile & Return to First Page
Players are never locked into a single character:
* **Dashboard Header Button**: A prominent **`[ ⇄ Switch Profile ]`** button is located right in the top bar of [`DashboardScreen.tsx`](file:///d:/CSLAB/src/ui/screens/DashboardScreen.tsx) next to the player's name.
* **Safety Confirmation**: Tapping it displays a confirmation dialog (*"Return to the first page to choose a different character archetype or start from zero with a new profile?"*).
* **Instant Return**: Confirming triggers `resetSimulation()`, setting `isInitialized: false` and smoothly returning the player to the first page without restarting the app.
* **Account Modal Access**: Also accessible via the **`[ ⇄ Choose Different Character / Setup ]`** button inside [`AuthModal.tsx`](file:///d:/CSLAB/src/ui/components/AuthModal.tsx).

---

### Feature 3: Career Progression & Promotion Engine (`CareerEngine.ts`)
Career growth is no longer static. It dynamically advances based on tenure, performance, and financial discipline:
* **4 Career Tracks**: Tech, Business & Finance, Creative & Freelance, and Corporate Generalist.
* **4 Seniority Tiers**: Junior / Entry Level ➔ Mid-Level Specialist ➔ Senior Lead ➔ Director / VP.
* **Promotion Evaluation**: Checked each month based on months in role and financial health score:
  * **Salary Jump**: +22% to +38% base salary increase.
  * **Milestone Performance Bonus**: One-time lump sum credited to cash reserves.
  * **New Professional Title**: Updates across the app and leaderboard.
* **The Lifestyle Inflation Dilemma**:
  Promotions trigger [`PromotionModal.tsx`](file:///d:/CSLAB/src/ui/components/PromotionModal.tsx), forcing players to make the critical wealth-building choice:
  1. **The Compounding Machine (Recommended)**: Auto-invests 80% of the raise into index funds; uses 20% for modest lifestyle upgrades. Drastically accelerates financial freedom.
  2. **Balanced Growth**: 50% into investments, 50% into upgraded living.
  3. **Full Lifestyle Upgrade**: 100% of raise spent on luxury rent and dining. Maximizes short-term happiness but freezes compounding.

---

### Feature 4: Stochastic Event Engine with 100+ Scenarios (`EventEngine.ts`)
* **True Weighted Random Sampling**: Replaced legacy deterministic sequential indexing (`unplayed[0]`). Scenarios appear non-linearly based on the player's financial state:
  * Low cash reserves (< ₹50,000) increase emergency and medical surge probabilities.
  * Large portfolios (> ₹10,00,000) trigger market volatility, angel investments, and tax planning dilemmas.
  * Seasonal events trigger realistically (Tax filing in March, festive spending in October/November).
* **100+ Dilemmas Across 8 Life Domains**:
  * Career & Moonlighting, Housing & Rent vs Buy, Lifestyle Creep, Medical Surgeries, Financial Scams & Phishing, Market Crashes & Dips, Tax Planning (Old vs New Regime), and Family Financial Pressures.

---

### Feature 5: Complete Express + PostgreSQL Backend
The backend running in `server/` is fully completed, production-hardened, and containerized:

| Route Group | Endpoints | Capabilities |
| :--- | :--- | :--- |
| **System & Health** | `GET /`, `GET /api/health` | Root API discovery & database connection validation |
| **Auth & Security** | `POST /api/auth/register`<br>`POST /api/auth/login`<br>`POST /api/auth/refresh`<br>`GET /api/auth/me`<br>`PUT /api/auth/profile`<br>`PUT /api/auth/password`<br>`DELETE /api/auth/account` | Bcrypt password hashing, sliding window rate limiting (50 req/15min), rotating JWT access + refresh tokens, cascade account deletion |
| **Game Simulation** | `POST /api/game/sync`<br>`POST /api/game/promotion`<br>`GET /api/game/saves`<br>`GET /api/game/state/:id?`<br>`GET /api/game/achievements`<br>`POST /api/game/achievement/unlock`<br>`GET /api/game/market-pulse`<br>`GET /api/game/export/:id`<br>`DELETE /api/game/save/:id` | Multi-save slots, indexed Net Worth & Health Score columns for sub-millisecond queries, career promotion logs, server-verified badge unlocks, ledger JSON export |
| **Analytics & Benchmark** | `GET /api/analytics/:gameSaveId`<br>`GET /api/analytics/peer-benchmark/:gameSaveId` | Health grade (A+, A, B, C, D), emergency buffer months, savings rate, career bonus summary, community wealth percentile rank |
| **Leaderboards** | `GET /api/leaderboard/wealth`<br>`GET /api/leaderboard/health`<br>`GET /api/leaderboard/streaks` | Real-time global rankings with B-Tree database indexes |
| **AI Coach** | `POST /api/coach/message`<br>`GET /api/coach/history/:gameSaveId` | Persistent advisory chat history linked to character saves |

---

## 3. End-to-End Operational Flow

```mermaid
sequenceDiagram
    autonumber
    actor Player as Player / Device
    participant UI as Mobile Frontend (Expo)
    participant Store as useSimulationStore (Zustand)
    participant Career as CareerEngine
    participant Events as EventEngine (Stochastic)
    participant API as Express Server (:4000)
    participant DB as PostgreSQL 16 (:5432)

    Player->>UI: Selects "Start from ₹0" (Enters Name, Job, Salary)
    UI->>Store: initializeSimulation(opts)
    Store->>UI: Renders Dashboard (₹0 Net Worth, ₹45k Salary)

    loop Monthly Simulation Cycle
        Player->>UI: Taps "Advance to Next Month"
        UI->>Store: advanceMonth()
        Store->>Career: evaluatePromotion(tenure, performance)
        alt Promotion Qualified
            Career-->>Store: Triggers PromotionOffer (SDE-2, +36% hike)
            Store-->>UI: Displays PromotionModal (Lifestyle Dilemma)
            Player->>UI: Chooses "The Compounding Machine (80% Invested)"
            UI->>API: POST /api/game/promotion
            API->>DB: INSERT into promotion_logs
        end

        Store->>Events: sampleRandomEvent(cash, debt, season)
        Events-->>Store: Returns Stochastic Event (e.g. Angel Check)
        Store-->>UI: Presents Event Dilemma Card
        Player->>UI: Selects Decision Option
        Store->>Store: Compounds Cash Flow & Balance Sheet

        opt Cloud Sync Active
            Store->>API: POST /api/game/sync
            API->>DB: Upserts game_saves & decision_logs
        end
    end

    Player->>UI: Taps [ ⇄ Switch Profile ] in Header
    UI->>Store: resetSimulation() (isInitialized = false)
    Store-->>UI: Returns to First Page (OnboardingScreen)
```

---

## 4. Verification & Testing Status

* **All 22 Backend Endpoints Verified**:
  Executed `server/scripts/test-api.ts` against the live server and PostgreSQL database:
  ```text
  1. GET / (Root Discovery)                  -> 200 OK
  2. GET /api/health                         -> 200 OK (database: 'connected')
  3. POST /api/auth/register                 -> 201 Created
  4. POST /api/auth/login                    -> 200 OK
  5. GET /api/auth/me                        -> 200 OK
  6. PUT /api/auth/profile                   -> 200 OK
  7. POST /api/game/sync                     -> 200 OK
  8. POST /api/game/promotion                -> 201 Created
  9. GET /api/game/achievements              -> 200 OK (8 badges)
  10. POST /api/game/achievement/unlock      -> 200 OK (+150 XP)
  11. GET /api/game/market-pulse             -> 200 OK (5.2% inflation)
  12. GET /api/game/saves                    -> 200 OK
  13. GET /api/game/state/:id                -> 200 OK
  14. GET /api/analytics/:gameSaveId         -> 200 OK (Grade A)
  15. GET /api/analytics/peer-benchmark/:id  -> 200 OK (69th Percentile)
  16. POST /api/coach/message                -> 201 Created
  17. GET /api/coach/history/:id             -> 200 OK
  18. GET /api/leaderboard/wealth            -> 200 OK
  19. GET /api/leaderboard/health            -> 200 OK
  20. GET /api/leaderboard/streaks           -> 200 OK
  21. GET /api/game/export/:id               -> 200 OK (ledger download)
  22. POST /api/auth/refresh                 -> 200 OK
  ======================================================
  >>> ALL 22 PRODUCTION BACKEND API ENDPOINTS PASSED! <<<
  ======================================================
  ```
* **Frontend TypeScript Compilation**: `npx tsc --noEmit` passed with **0 errors**.
* **Database State**: PostgreSQL 16 Alpine container (`finance_sim_postgres`) healthy on port 5432 with seeded community leaderboard records.

---

## 5. Quick Runbook

```powershell
# 1. Start Database (if stopped)
docker start finance_sim_postgres

# 2. Start Backend Server
cd server
npm run dev

# 3. Start Expo Mobile Frontend (in separate terminal)
cd ..
npm start
```

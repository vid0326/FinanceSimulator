# FinanceSimulator
## THIS WHOLE IS VIBE CODED SO SORRRYYYYYYYYYYYYYYYYYYYYY

> A mobile-first, realistic financial life simulation game built with React Native (Expo v58), Express.js, PostgreSQL, and Prisma ORM.

---

## 🌟 Highlights & Features

- **Minimalist Black & White Theme**: High-contrast, calm, distraction-free fintech aesthetic inspired by Apple and luxury Scandinavian design.
- **Start from ₹0 (Ground Zero Profile Builder)**: Define your custom profession, monthly earnings, and living expenses, beginning from ₹0 initial net worth.
- **6 Rich Playable Characters**: Kabir (High-growth SDE), Aarav (Freelance Designer), Priya (Conservative Saver), Meera (Medical Doctor), Vikram (Bootstrapped Founder), Ananya (Tier-2 Aspirant).
- **Dynamic Switch Profile System**: Seamlessly return to the character selection screen anytime via the `[ ⇄ Switch Profile ]` button.
- **Career Ladder & Promotion Engine**: 4 tracks (Tech, Business, Creative, General) with +22% to +38% salary hikes, milestone bonuses, and the 3-option **Lifestyle Inflation Dilemma**.
- **Stochastic Life Event Engine**: Dynamic weighted random sampling across 100+ scenarios based on cash reserves, debt ratios, and seasonality.
- **Production-Ready Backend**: Complete Express + PostgreSQL backend with sliding-window rate limiting, JWT token rotation, and 22 verified REST API endpoints.
- **Community Leaderboards & Peer Benchmarks**: Real-time Net Worth, Health Score, and Longevity rankings powered by PostgreSQL B-Tree indexes.

---

## 📚 Complete Guides & Documentation

- [📖 **tutorial.md** — Exhaustive Masterclass Tutorial](tutorial.md): In-depth walkthrough of every feature, tech stack details, mathematical compounding models, and full API specifications.
- [🏛️ **COMPLETE_SYSTEM_GUIDE.md** — Technical Architecture Guide](COMPLETE_SYSTEM_GUIDE.md): Complete system guide with sequence diagrams, Prisma schema models, and operational runbook.
- [📱 **walkthrough.md** — Product & Visual Walkthrough](walkthrough.md): Visual walkthrough with UI mockups, screen-by-screen breakdown, and verification proofs.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js v20+ or v22+
- Docker Desktop
- Expo Go on Android / iOS (or Android Emulator)

### 2. Start PostgreSQL Database
```powershell
docker compose up -d
# Or: docker start finance_sim_postgres
```

### 3. Start Backend Server
```powershell
cd server
npm install
npx prisma generate
npx prisma migrate dev
npx tsx prisma/seed.ts
npm run dev
```
*(Server listens on `http://localhost:4000`)*

### 4. Start Mobile Application
In a separate terminal from project root:
```powershell
npm install
npm start
```
- Press `a` for Android Emulator.
- Or scan QR code with **Expo Go** on your physical phone.

---

## 🧪 Testing Backend Endpoints
Run the automated 22-endpoint verification test suite:
```powershell
cd server
npx tsx scripts/test-api.ts
```

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

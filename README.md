# 🧠 UNIFI – Context-Aware Explainable AI for Intelligent Personal Financial Decision Support

> A full-stack, production-ready AI-powered financial intelligence platform built with Hono + TypeScript + Cloudflare Pages.

[![GitHub](https://img.shields.io/badge/GitHub-raman179%2FUnifi-blue?logo=github)](https://github.com/raman179/Unifi)
[![Tech](https://img.shields.io/badge/Stack-Hono%20%7C%20TypeScript%20%7C%20Chart.js-6366f1)](https://hono.dev)
[![Database](https://img.shields.io/badge/Database-MySQL%20%7C%20Cloudflare%20D1-orange)](https://developers.cloudflare.com/d1/)

---

## 📋 Project Overview

**UNIFI** is a smart AI-powered financial assistant platform featuring:
- **Explainable AI (XAI)** – Every recommendation shows WHY it's given (SHAP-style factor importance)
- **Context-Aware AI Chatbot** – Conversational financial assistant with your full financial profile as context
- **Predictive Analytics** – 6-month income/expense/savings forecasting
- **Anomaly Detection** – Real-time alerts for unusual spending patterns
- **What-If Simulation** – Scenario planning with interactive sliders
- **Risk Profiling** – Dynamic risk assessment (Low / Medium / High)

---

## 🌐 Pages & URLs

| Page | Path | Description |
|------|------|-------------|
| Home | `/` | Landing page with features & architecture |
| Login | `/login` | Secure authentication |
| Register | `/register` | Account creation with risk preference |
| **Dashboard** | `/dashboard` | Financial overview, charts, transactions |
| **AI Chatbot** | `/chatbot` | WhatsApp-style AI financial assistant |
| **Analytics** | `/analytics` | Forecasting, anomaly detection, trends |
| **Recommendations** | `/recommendations` | XAI-powered personalized strategies |
| **Simulation** | `/simulation` | What-if scenario planner |
| About | `/about` | Problem/solution + CIA Triad security |
| Contact | `/contact` | Contact form |
| Privacy | `/privacy` | Privacy policy & data security |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User authentication |
| POST | `/api/auth/register` | Account creation |
| GET | `/api/dashboard/summary` | Financial summary + transactions |
| GET | `/api/analytics/forecast` | 6-month AI forecast + anomalies |
| GET | `/api/recommendations` | XAI-powered recommendations with factors |
| POST | `/api/chat` | AI chatbot (context-aware responses) |
| POST | `/api/simulate` | What-if scenario computation |
| POST | `/api/contact` | Contact form submission |

---

## 🗄️ Data Architecture

### Storage Services
- **Cloudflare D1** (SQLite) – Transactions, users, recommendations
- **Cloudflare KV** – Session management, caching
- **MySQL** – Full relational schema (for XAMPP/self-hosted)

### Database Tables (MySQL Schema → `/database/schema.sql`)
| Table | Purpose |
|-------|---------|
| `users` | User accounts with risk preferences |
| `accounts` | Bank/investment accounts |
| `categories` | Transaction categories (17 defaults) |
| `transactions` | Full transaction history with AI anomaly score |
| `budgets` | Monthly budget limits per category |
| `financial_goals` | Savings goal tracking |
| `risk_profiles` | AI-calculated risk scores |
| `recommendations` | AI recommendations with XAI data (JSON) |
| `simulations` | Saved simulation scenarios |
| `chat_messages` | Full conversation history |
| `anomaly_logs` | AI-detected anomalies with reasoning |
| `audit_log` | CIA Triad integrity logging |

---

## 🛡️ Security – CIA Triad

| Principle | Implementation |
|-----------|----------------|
| **Confidentiality** | AES-256 encryption at rest, TLS 1.3 in transit, no data selling |
| **Integrity** | Audit log for all data changes, cryptographic hashing |
| **Availability** | Cloudflare edge deployment, 99.9% uptime SLA |

---

## 🚀 Quick Start (Local with XAMPP/Laragon)

### Prerequisites
- Node.js 18+
- MySQL 8.0+ or XAMPP
- npm

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/raman179/Unifi.git
cd Unifi

# 2. Install dependencies
npm install

# 3. Set up database (XAMPP/phpMyAdmin)
# Open phpMyAdmin → Import → Select: database/schema.sql

# 4. Build the project
npm run build

# 5. Start with PM2 (recommended)
pm2 start ecosystem.config.cjs

# OR start directly
npx wrangler pages dev dist --ip 0.0.0.0 --port 3000

# 6. Open in browser
# http://localhost:3000
```

### Demo Login
- **Email:** `alex@unifi.ai`
- **Password:** any value (demo mode)

---

## 🧱 Project Structure

```
Unifi/
├── src/
│   ├── index.tsx          # Main Hono app – all routes & API endpoints
│   └── renderer.tsx       # JSX renderer
├── public/
│   ├── static/
│   │   ├── style.css      # Complete fintech UI stylesheet (~1500 lines)
│   │   └── app.js         # Frontend logic – charts, chatbot, simulation
│   └── favicon.ico
├── database/
│   └── schema.sql         # Complete MySQL schema with seed data
├── ecosystem.config.cjs   # PM2 configuration
├── wrangler.jsonc         # Cloudflare Workers config
├── vite.config.ts         # Vite build config
├── tsconfig.json          # TypeScript config
└── package.json
```

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Hono (TypeScript) on Cloudflare Workers |
| **Frontend** | Vanilla HTML/CSS/JS |
| **Charts** | Chart.js |
| **Styling** | Custom CSS (fintech dark theme + Inter font) |
| **Icons** | Font Awesome 6 |
| **HTTP Client** | Axios |
| **Build Tool** | Vite |
| **Deployment** | Cloudflare Pages / XAMPP |
| **Database** | MySQL 8.0 / Cloudflare D1 |
| **Process Manager** | PM2 |

---

## ✨ Key Features

- ✅ **XAI Module** – Feature importance bars + human-readable reasoning on every recommendation
- ✅ **AI Chatbot** – Handles budget, investment, savings, debt, emergency fund, risk queries
- ✅ **Dashboard** – Income/expense bar chart, doughnut breakdown, risk gauge, anomaly alerts
- ✅ **6-Month Forecast** – AI-predicted financial trends with confidence intervals
- ✅ **Anomaly Detection** – Severity scoring + visual indicators
- ✅ **What-If Simulation** – 3 preset scenarios + custom sliders with real-time chart updates
- ✅ **PDF Report Export** – Downloadable financial reports (print-to-PDF)
- ✅ **Voice Input** – Voice button in chatbot interface
- ✅ **Notification System** – Bell icon with badge + notification panel
- ✅ **Responsive Design** – Full mobile support with collapsible sidebar

---

## 📦 Deployment to Cloudflare Pages

```bash
# 1. Set Cloudflare API token
npx wrangler login

# 2. Build & deploy
npm run deploy

# Production URL: https://unifi.pages.dev
```

---

## 📄 License

MIT License – © 2026 UNIFI. Built with Explainable AI Technology.

---

*UNIFI provides educational financial insights. Always consult a licensed financial advisor for personalized investment advice.*

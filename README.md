# AI-Powered Code Review Bot 🤖

> An enterprise-grade, multi-tenant GitHub App that automatically reviews pull requests using AI, enforces team-specific coding standards, learns from developer feedback, and delivers real-time Slack notifications — all backed by a React dashboard.

<div align="center">

![CI/CD Status](https://img.shields.io/github/actions/workflow/status/your-org/your-repo/test.yml?branch=main&style=for-the-badge&label=Tests)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-BullMQ-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=for-the-badge&logo=openai&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#️-architecture--decoupled-execution)
- [Key Capabilities](#-key-capabilities)
- [Tech Stack](#️-tech-stack)
- [Database Schema](#-database-schema)
- [Project Structure](#-project-structure)
- [Configuration](#️-configuration-setup)
- [Running the Platform](#-running-the-platform)
- [REST API Reference](#-rest-api-reference)
- [Dashboard (Frontend)](#-dashboard-frontend)

---

## 🌟 Overview

This project is a full-stack, **production-ready SaaS platform** that integrates directly with GitHub as a GitHub App. When a pull request is opened or updated, the bot:

1. Receives a signed webhook event from GitHub
2. Queues it asynchronously for AI analysis
3. Filters noise (lock files, binaries, etc.) and extracts only the meaningful diff hunks
4. Sends the cleaned diff to OpenAI for structured code review
5. Posts inline comments directly on the PR with severity-tagged issues
6. Tracks developer feedback to improve future reviews via a sentiment loop
7. Sends a summary notification to Slack

Organizations can configure custom review rules per repo, manage subscription tiers, and monitor usage — all through a React-based dashboard.

---

## 🏗️ Architecture & Decoupled Execution

The system uses an asynchronous **producer-consumer queue architecture** built on **BullMQ** and **Redis**. This decouples webhook ingestion from heavy LLM analysis, ensuring webhooks always respond in `< 10ms`.

```
                  ┌──────────────────────┐
                  │   GitHub Webhook     │
                  └──────────┬───────────┘
                             │ (HMAC-SHA256 Signature verified)
                             ▼
                  ┌──────────────────────┐
                  │    Express Server    │ (Fast Response <10ms)
                  └──────────┬───────────┘
                             │
                             ▼
                    [ webhook-queue ]
                             │
                             ▼
                  ┌──────────────────────┐
                  │    webhookWorker     │
                  └──────────┬───────────┘
                             │ (Determines Event Type)
                             ▼
                    [  review-queue ] ◄─────── [ usageService ]
                             │                 (Limits & Quota check)
                             ▼
                  ┌──────────────────────┐
                  │     reviewWorker     │ ◄─────── [ aiService ]
                  └──────────┬───────────┘          (Diff Batcher / Prompter)
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
┌──────────────────────┐            ┌──────────────────────┐
│  GitHub PullRequest  │            │    [ slack-queue ]   │
│  (Comments Posted)   │            └──────────┬───────────┘
└──────────────────────┘                       ▼
                                    ┌──────────────────────┐
                                    │     slackWorker      │
                                    └──────────────────────┘
```

---

## ⚡ Key Capabilities

### 🛡️ Multi-Tenant SaaS Architecture
- Each **Organization** is an isolated tenant with its own rules, repositories, usage tracking, and billing plan.
- Role-based membership (`OWNER`, `ADMIN`, `MEMBER`) per organization.
- Full **Audit Log** trail for every tenant action, suitable for compliance and security monitoring.

### 💰 Cost-Optimized AI Engine
- **Intelligent File Filtering** — Excludes `package-lock.json`, binaries, media, and `.env` files before LLM calls.
- **Hunk-Based Diff Parsing** — Custom unified patch parser extracts only changed/added line blocks (not the entire file).
- **Batched Reviews** — Consolidates all changed files in a single structured LLM prompt to minimize token usage.
- **Line Validation** — Validates AI comment line numbers against the actual modified lines to prevent invalid inline comments.

### 🧠 Developer Sentiment Feedback Loop
- Monitors developer replies to bot comments on GitHub.
- Classifies replies as `APPROVED` (fix confirmed) or `REJECTED` (false positive) using sentiment analysis.
- Approved/rejected examples are fed back as few-shot examples in future prompts so the bot adapts to team preferences over time.

### 📊 Subscription & Usage Billing
- Three billing tiers: `FREE`, `PRO`, `ENTERPRISE` — each with configurable monthly PR limits.
- Monthly usage is tracked per organization; reviews are blocked when quotas are exceeded.
- Stripe customer ID field ready for payment integration.

### 📏 Custom Team Rules Engine
- Organizations can define rules per repository pattern (e.g., `owner/repo` or `*`).
- Rule types: `BUG`, `PERFORMANCE`, `SECURITY`, `STYLE`, `GENERAL`.
- Rules are injected directly into the AI prompt as enforceable guidelines.

### 🔔 Slack Notifications
- Summary of every completed review posted to a configured Slack webhook.
- Delivered via a dedicated `slack-queue` to keep the review pipeline non-blocking.

---

## 🛠️ Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js 18+, TypeScript 5+ |
| HTTP Framework | Express, CORS, Morgan |
| ORM & Database | Prisma ORM, PostgreSQL 15 |
| Background Queues | BullMQ, ioredis (Redis) |
| GitHub Integration | Octokit (REST & Webhook APIs) |
| AI / LLM | OpenAI SDK (GPT-4o / structured JSON completions) |
| Env Validation | Zod |

### Frontend (Dashboard)
| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| Routing | React Router DOM v7 |
| Charts | Recharts |
| Icons | Lucide React |

### Infrastructure
| Service | Technology |
|---|---|
| Containerization | Docker, Docker Compose |
| Database | PostgreSQL 15 (Docker) |
| Cache / Queue Broker | Redis Alpine (Docker) |

---

## 🗄️ Database Schema

```
┌───────────────┐       ┌─────────────────────┐       ┌──────────────┐
│     User      │──────▶│ OrganizationMember  │◀──────│ Organization │
│               │       └─────────────────────┘       │              │
│ id (uuid)     │                                      │ id (uuid)    │
│ email         │                                      │ name         │
│ githubId      │                                      │ githubOrgId  │
│ githubToken   │                                      │ billingPlan  │
└───────────────┘                                      └──────┬───────┘
                                                              │
                   ┌──────────────────────────────────────────┤
                   │                  │                        │
                   ▼                  ▼                        ▼
           ┌──────────────┐   ┌──────────────┐       ┌──────────────────┐
           │  Repository  │   │   TeamRule   │       │  UsageTracking   │
           │              │   │              │       │                  │
           │ githubRepoId │   │ ruleType     │       │ prReviewedCount  │
           │ fullName     │   │ description  │       │ tokensUsed       │
           │ isActive     │   │ repoPattern  │       │ currentMonth     │
           └──────┬───────┘   └──────────────┘       └──────────────────┘
                  │
                  ▼
          ┌──────────────┐
          │  PullRequest │
          │              │
          │ prNumber     │
          │ title        │
          │ author       │
          │ state        │
          └──────┬───────┘
                 │
                 ▼
          ┌──────────────┐
          │    Review    │
          │              │
          │ status       │
          │ stats (JSON) │
          │ cost         │
          └──────┬───────┘
                 │
                 ▼
        ┌────────────────┐
        │ ReviewComment  │
        │                │
        │ filePath       │
        │ line           │
        │ explanation    │
        │ suggestion     │
        │ severity       │  ← CRITICAL | WARNING | SUGGESTION
        │ commentType    │  ← BUG | SECURITY | PERFORMANCE | STYLE
        │ status         │  ← PENDING | APPROVED | REJECTED
        │ feedbackText   │
        └────────────────┘
```

---

## 📁 Project Structure

```
AI-Powered-Code-Review-Bot/
├── client/                        # React dashboard (Vite + TypeScript)
│   └── src/
│       ├── api/                   # API client functions
│       ├── components/            # Reusable UI components
│       ├── pages/                 # Route-level page components
│       ├── App.tsx                # Router setup
│       └── main.tsx               # Entry point
│
├── src/                           # Express backend (TypeScript)
│   ├── config/                    # Environment & app config (Zod validated)
│   ├── middlewares/               # Auth, error handling, logging
│   ├── queues/                    # BullMQ queue definitions & workers
│   ├── routes/                    # REST API route handlers
│   ├── services/
│   │   ├── aiService.ts           # OpenAI prompt builder + reviewer
│   │   ├── diffParser.ts          # Unified diff hunk extractor
│   │   ├── feedbackService.ts     # Sentiment classification loop
│   │   └── usageService.ts        # Monthly quota enforcement
│   ├── webhooks/                  # GitHub webhook event handlers
│   ├── app.ts                     # Express app setup
│   └── index.ts                   # Server entry point + worker bootstrap
│
├── prisma/
│   └── schema.prisma              # Full Prisma data model
│
├── Dockerfile                     # Production container image
├── docker-compose.yml             # Local dev: PostgreSQL + Redis + App
├── seed.ts                        # Database seed script
├── .env.example                   # Environment variable template
└── package.json
```

---

## ⚙️ Configuration Setup

Copy `.env.example` to `.env` and fill in your values:

```env
# Server
PORT=3000
NODE_ENV="development"

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/review_bot?schema=public"

# Redis (BullMQ broker)
REDIS_URL="redis://localhost:6379"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"
OPENAI_MODEL="gpt-4o-mini"

# GitHub App
GITHUB_APP_ID="your-github-app-id"
GITHUB_PRIVATE_KEY="base64-encoded-private-key"
GITHUB_WEBHOOK_SECRET="your-github-webhook-secret"

# Slack
SLACK_WEBHOOK_URL="your-slack-webhook-url"
```

> **Note:** `GITHUB_PRIVATE_KEY` must be the Base64-encoded version of the `.pem` file downloaded from your GitHub App settings.

---

## 🚀 Running the Platform

### Prerequisites
- **Node.js** >= 18
- **Docker Desktop** (must be running to start containers)

---

### Step 1 — Start Infrastructure

Spin up PostgreSQL and Redis in Docker:

```bash
docker-compose up db redis -d
```

---

### Step 2 — Install Dependencies

```bash
# Backend
npm install

# Frontend
cd client && npm install && cd ..
```

---

### Step 3 — Generate Prisma Client & Migrate DB

```bash
npm run prisma:generate
npm run prisma:migrate
```

---

### Step 4 — Run the App

**Backend (with hot-reload):**
```bash
npm run dev
```

**Frontend Dashboard:**
```bash
cd client && npm run dev
```

**Production Build:**
```bash
npm run build
npm start
```

**Full Docker Stack (App + DB + Redis):**
```bash
docker-compose up --build
```

---

## 📡 REST API Reference

### Health Diagnostics
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Returns status of PostgreSQL and Redis connections |

### Team Rules Engine
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/rules?organizationId=<id>` | Fetch all rules for an organization |
| `POST` | `/api/rules` | Create a new custom rule |
| `PUT` | `/api/rules/:id` | Update an existing rule |
| `DELETE` | `/api/rules/:id` | Delete a rule |

### Metrics & Sentiment History
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/feedback/stats` | Aggregate review counts and AI accuracy metrics |
| `GET` | `/api/feedback/history` | Paginated sentiment classification history |

### Billing & Subscription Management
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/billing/usage/:orgId` | Monthly PR review usage vs. subscription limit |
| `POST` | `/api/billing/tier/:orgId` | Update plan (`FREE` \| `PRO` \| `ENTERPRISE`) |

### Security & Audit
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/audit/:orgId` | Tenant action history for compliance monitoring |

---

## 🖥️ Dashboard (Frontend)

The React dashboard (located in `client/`) connects to the backend API and provides:

- **Overview** — Live stats: PRs reviewed, comments posted, tokens used, accuracy rate
- **Feedback History** — Paginated table of AI comments with developer sentiment outcomes
- **Rules Manager** — CRUD interface to manage team-specific review rules per organization
- **Billing** — View monthly usage and upgrade subscription tier
- **Audit Logs** — Security trail of all organization-level actions

---

## 🧪 Testing Strategy

This repository employs a unified, end-to-end testing approach using **Playwright** for both API and UI test suites.

- **API Testing (`tests/api/`)**: Validates REST endpoints, checking HTTP status codes, JSON structures, error handling, and pagination without relying on the browser.
- **UI Testing (`tests/ui/`)**: Ensures core frontend flows work as expected (e.g., authentication flow, dashboard rendering, navigation, form validation). Tests are categorized using tags like `@smoke` and `@regression`.
- **CI/CD Integration**: The `.github/workflows/test.yml` GitHub Actions pipeline automatically provisions a PostgreSQL + Redis environment, seeds the database, starts the app, and runs the full test suite on every PR and push to `main`.
- **Artifacts & Proof**: Upon failure, Playwright captures **screenshots and video recordings**. An HTML report is automatically uploaded as a CI artifact.

### How to Run Tests Locally

```bash
# Ensure your backend and frontend are running, then execute:
npm run test:e2e
```

To view the generated report (includes screenshots/videos of failures):
```bash
npx playwright show-report
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request — the bot will review it! 🤖

---

## 📄 License

This project is private and proprietary.

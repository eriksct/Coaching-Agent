# FinCoach — AI-Powered Personal Finance Coaching Platform

An AI-driven coaching app that combines the personalization and accountability of a human financial coach with the accessibility and scalability of software.

**Live:** [https://eriksct.github.io/Coaching-Agent/](https://eriksct.github.io/Coaching-Agent/)

---

## What It Does

FinCoach provides ongoing, personalized financial coaching through AI-powered conversations. Unlike generic financial advice, it remembers your goals, tracks your progress, and holds you accountable across sessions.

- **Onboarding conversation** — the AI learns your financial situation, goals, and coaching preferences
- **Coaching sessions** — empathetic, framework-driven conversations tailored to your context
- **Goal tracking** — set, monitor, and update financial goals with status tracking
- **Session memory** — the coach remembers what you discussed and committed to

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript (Vite) |
| Hosting | GitHub Pages |
| Backend | Supabase (Postgres + Auth + Edge Functions) |
| AI | OpenAI GPT-4o via Supabase Edge Function |
| Auth | Supabase Auth (email/password) |

## Architecture

```
Browser (React SPA)
  ├── Chat Interface ──► Supabase Edge Function ──► OpenAI GPT-4o
  ├── Goals Dashboard ──► Supabase (Postgres + RLS)
  └── Auth ──► Supabase Auth
```

### Three-Tier Memory System

| Tier | Purpose | Storage |
|------|---------|---------|
| **Tier 1 — Short-Term** | Current conversation context | LLM context window (in-memory) |
| **Tier 2 — Mid-Term** | Session summaries injected into system prompt | `session_summaries` table |
| **Tier 3 — Long-Term** | User profile, goals, insights | `users`, `goals`, `user_insights` tables |

### Database Schema

- **`users`** — profile, financial situation, literacy level, coaching preferences
- **`goals`** — title, target value, deadline, status, domain (budgeting/debt/saving/investing/income)
- **`sessions`** — tracks coaching sessions with timestamps
- **`session_summaries`** — structured recaps (topics, tone, action items, frameworks used)
- **`user_insights`** — coaching observations and behavioral patterns

All tables have Row-Level Security (RLS) policies enforcing strict per-user data isolation.

## Coaching Frameworks

The AI coach draws from these frameworks during conversations:

- **50/30/20 Budget Rule** — needs, wants, savings allocation
- **Zero-Based Budgeting** — assign every dollar a job
- **Debt Snowball vs. Avalanche** — choosing a debt payoff strategy
- **Emergency Fund Milestone Ladder** — phased savings targets
- **Spending Awareness 7-Day Challenge** — track every purchase for a week
- **Values-Based Spending Alignment** — map spending to personal values

## Development

### Prerequisites

- Node.js 20+
- A Supabase project
- An OpenAI API key

### Local Setup

```bash
git clone https://github.com/eriksct/Coaching-Agent.git
cd Coaching-Agent
npm install
npm run dev
```

### Environment

The Supabase URL and anon key are configured in `src/lib/supabase.ts`. The OpenAI API key is stored as a Supabase Edge Function secret (`OPENAI_API_KEY`).

### Build & Deploy

```bash
npm run build    # outputs to dist/
```

Deployment to GitHub Pages is automated via GitHub Actions on every push to `main`.

## Roadmap

| Phase | Status | Scope |
|-------|--------|-------|
| Month 1 — Foundation | Done | Schema, auth, chat UI, LLM integration, onboarding, goals dashboard |
| Month 2 — Intelligence | Planned | RAG pipeline, agent tools, dynamic memory injection, session summaries |
| Month 3 — Polish | Planned | Post-session summarization, retrieval tuning, UX polish, beta launch |

### Planned Agent Tools (Month 2)

| Tool | Purpose |
|------|---------|
| `search_knowledge_base(query, domain)` | RAG retrieval over coaching content |
| `get_user_history(topic)` | Search past session summaries |
| `update_user_profile(field, value)` | Update goals and preferences mid-conversation |
| `log_insight(insight)` | Save coaching observations for future reference |

## Disclaimer

This app provides **educational financial coaching**, not licensed financial advice. It is not a substitute for a certified financial advisor.

---

Built by [Erik Schjoth](https://github.com/eriksct)

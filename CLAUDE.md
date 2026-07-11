# CLAUDE.md — Miyar (Meyar) Codebase Guide

## Project Overview

**Miyar** is an Arabic-first, RTL pre-employment decision platform built with Next.js 14, TypeScript, and Tailwind CSS. It converts the hiring decision for persons with disabilities in Saudi Arabia from abstract policy into a structured, explainable operational output:

```
Job × Proven Capabilities + Priced Accommodation = More Sustainable Hire
```

The app is a **pure client-side static export** — no server, no database, no environment variables. All computation runs in the browser against mock data. The demo works with a fixed case (visual-impairment candidate in an admin/data-entry role).

Live deployments:
- GitHub Pages: `https://azoz20121234-ui.github.io/Miyar/`
- Vercel: via `npm run deploy:preview` or `npm run deploy:prod`

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (`output: "export"` — static) |
| Language | TypeScript 5.7 (strict) |
| Styling | Tailwind CSS 3.4 with custom design tokens |
| Fonts | IBM Plex Sans Arabic (body) + Tajawal (headings) |
| State | React Context (no Redux, no Zustand) |
| Persistence | `localStorage` for session, `sessionStorage` for handoffs |
| Deployment | Vercel (primary) + GitHub Pages (static export) |

---

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production static export → /out
npm run lint         # ESLint (next lint)

npm run deploy:preview  # Deploy to Vercel preview
npm run deploy:prod     # Deploy to Vercel production
```

No environment variables are required for local dev or demo operation.

**GitHub Pages note:** When `GITHUB_ACTIONS=true`, the build automatically adds `basePath: /Miyar` and `assetPrefix: /Miyar`.

---

## Directory Structure

```
src/
├── app/                     # Next.js App Router pages (all client-rendered)
│   ├── layout.tsx           # Root layout: RTL html, fonts, context providers
│   ├── page.tsx             # Root "/" → ExternalEntryGateway
│   ├── home/page.tsx        # Role-hub landing after login
│   ├── workspace/page.tsx   # Case list / initiator workspace
│   ├── job-analysis/        # Job & task intake/review
│   ├── candidate-profile/   # Capability profile editor
│   ├── matching/            # Task-fit matching view
│   ├── accommodation-plan/  # Accommodation plan builder
│   ├── readiness-report/    # Executive decision report
│   ├── dashboard/           # Executive portfolio dashboard
│   ├── external/            # External portal (employer/candidate entry)
│   │   ├── page.tsx         # Gateway landing
│   │   ├── employer/        # Employer intake form
│   │   ├── candidate/       # Candidate intake form
│   │   └── submit/          # Handoff submission
│   └── portal/[slug]/       # Dynamic role-based portal pages
│
├── components/              # Shared UI components
│   ├── app-shell.tsx        # Page wrapper with sidebar + nav
│   ├── role-sidebar.tsx     # Role-aware left/right nav sidebar
│   ├── role-switcher.tsx    # Demo role picker widget
│   ├── portal-page-client.tsx # Dynamic portal slug renderer
│   ├── external/            # External portal flow components
│   └── ...                  # Domain cards: decision-*, financial-*, section-*, etc.
│
├── lib/                     # Pure business logic (no React)
│   ├── scoring.ts           # Orchestrator: assembles AssessmentBundle
│   ├── task-engine.ts       # Task × Capability scoring → TaskFitResult[]
│   ├── barrier-engine.ts    # Derives Barrier[] from task results + environment
│   ├── accommodation-engine.ts # Matches accommodations to barriers → AccommodationPlan
│   ├── report-engine.ts     # Builds ReadinessReport + Saudi-first signals
│   ├── decision-explainer.ts # Builds DecisionExplainability (drivers, scenarios, thresholds)
│   ├── decision-logic.ts    # Builds DecisionLogicSummary (narrative layer)
│   ├── standards-engine.ts  # Evaluates CaseStandardsEvaluation from standards catalog
│   ├── evidence-strength.ts # Builds EvidenceStrengthModel
│   ├── financial-model.ts   # Builds FinancialImpactModel (SAR cost ranges)
│   ├── case-state.ts        # CaseRecord state machine + timeline events
│   ├── case-transitions.ts  # Role-gated state transitions
│   ├── case-guards.ts       # Guard evaluation for transitions/stage-actions
│   ├── role-model.ts        # AppRole definitions, permissions, page access, nav configs
│   ├── external-handoff.ts  # External portal payload validation + transformation
│   ├── financial-assumptions.ts # SAR cost constants used by financial model
│   ├── decision-thresholds.ts   # Readiness threshold logic
│   ├── decision-scenarios.ts    # What-if decision shift scenarios
│   ├── decision-block.ts        # Decision block data builders
│   ├── microcopy.ts         # Arabic UI copy helpers
│   ├── display-copy.ts      # Label/status display helpers
│   ├── experience-roles.ts  # Roles used in experience/timeline views
│   └── accommodation-engine.ts
│
├── models/types.ts          # Central TypeScript domain types (source of truth)
│
├── types/                   # Supplementary type files
│   ├── financial.ts         # FinancialImpactModel
│   ├── evidence.ts          # EvidenceStrengthModel
│   ├── decision-logic.ts    # DecisionLogicSummary
│   └── decision-block.ts    # DecisionBlock types
│
├── data/                    # Static mock data (demo fixtures)
│   ├── demo-case.ts         # demoJob, demoCapabilityProfile, defaultLibrary
│   ├── roles.ts             # roleCatalog (available job templates)
│   ├── task-bank.ts         # Full AtomicTask library
│   ├── accommodations.ts    # Accommodation library entries
│   ├── standards-catalog.ts # Standards definitions
│   ├── standards-mapping.ts # Standards → check mappings
│   ├── dashboard.ts         # Executive dashboard mock data
│   └── role-content.ts      # Role-specific portal content
│
└── store/                   # React Context providers
    ├── assessment-context.tsx   # Primary state: job, profile, case, all computed models
    ├── role-session-context.tsx # Active role selection + page access
    └── external-intake-context.tsx # External portal form state
```

---

## Architecture: Decision Pipeline

All scoring is deterministic and synchronous. No AI/LLM calls. The pipeline runs on every render of `AssessmentProvider`:

```
Job + CapabilityProfile + Accommodation Library
    ↓
task-engine.ts        → TaskFitResult[] (per-task scores)
    ↓
barrier-engine.ts     → Barrier[] (derived from task gaps + environment)
    ↓
accommodation-engine.ts → AccommodationPlan (barrier → accommodation matching)
    ↓
report-engine.ts      → ReadinessReport (status, readiness %, signals)
    ↓
scoring.ts            → AssessmentBundle (everything above, assembled)
    ↓
decision-explainer.ts → DecisionExplainability (drivers, scenarios, thresholds)
standards-engine.ts   → CaseStandardsEvaluation (Saudi governance checks)
financial-model.ts    → FinancialImpactModel (SAR ranges, ROI)
evidence-strength.ts  → EvidenceStrengthModel
decision-logic.ts     → DecisionLogicSummary (narrative)
```

The `AssessmentBundle` type in `src/models/types.ts` is the canonical output shape.

---

## State Management

### AssessmentContext (`src/store/assessment-context.tsx`)
The primary context. Holds and derives all case data:

- **Mutable state:** `job`, `profile`, `caseRecord` (all plain objects, no class instances)
- **Derived (computed on render):** `bundle`, `standards`, `explainability`, `financialImpact`, `evidenceStrength`, `decisionLogic`
- **Persistence:** `localStorage` key `miyar-demo-assessment`
- **External handoff:** ingested via `sessionStorage` key `meyar-pending-external-handoff` or a CustomEvent `meyar-apply-external-handoff`

Key mutations exposed to UI:
- `selectRoleTemplate(jobId)` — swap job from role catalog
- `toggleTaskEssential(taskId)` / `toggleTaskAdaptable(taskId)` — adjust task flags
- `setEnvironmentField(field, value)` — edit work environment
- `updateDimensionScore(dimensionId, delta)` — nudge capability scores
- `transitionCase(transitionId)` — advance case state machine
- `completeStageAction(actionId)` — complete a role stage action
- `resetDemo()` — clear all state

### RoleSessionContext (`src/store/role-session-context.tsx`)
Holds the active `AppRole` (persisted to `localStorage` key `miyar-role-session`). Exposes `setRole`, `canAccess(pageId)`, and role metadata.

### ExternalIntakeContext (`src/store/external-intake-context.tsx`)
Manages the multi-step external portal form state.

---

## Role System

Six roles defined in `src/lib/role-model.ts`:

| Role | Arabic | Responsibility |
|---|---|---|
| `case-initiator` | مبادر الحالة | Creates and submits cases |
| `assessor` | المقيّم | Builds capability profile, barriers, accommodation plan |
| `hiring-manager` | مدير التوظيف | Reviews job reality and task essentials |
| `compliance-reviewer` | مراجع الامتثال | Reviews standards and approves/rejects |
| `executive-viewer` | المشاهد التنفيذي | Read-only portfolio and reports |
| `platform-admin` | مدير المنصة | Full access, manages templates/standards |

Each role has: `ROLE_PERMISSIONS`, `ROLE_CONFIGS` (nav items, defaultHref, primaryAction), and page access is gated by `canAccessPage(role, pageId)`.

---

## Case State Machine

States defined in `src/lib/case-state.ts`:

```
DRAFT → UNDER_ASSESSMENT → MANAGER_REVIEW → COMPLIANCE_REVIEW → APPROVED
                                                              ↘ REJECTED
                                                              ↘ NEEDS_REVISION → (back to UNDER_ASSESSMENT)
```

Each state has an `ownerRole` that determines who can take action. Transitions are role-gated via `evaluateTransitionGuard()` in `case-guards.ts`.

---

## RTL / Arabic Conventions

- **HTML direction:** `<html lang="ar" dir="rtl">` — always RTL, never toggled
- **Fonts:** IBM Plex Sans Arabic (body weight 400/500/600/700) + Tajawal (headings 400/500/700/800)
- **All UI copy** in Arabic (`src/lib/microcopy.ts`, `src/lib/display-copy.ts`)
- **Tailwind:** Use `rtl:` prefix if directional logic is needed; most layouts use flex/grid which respect RTL automatically
- **Numbers:** `tabular-nums` font variant applied globally for score display

---

## Design System

Custom Tailwind tokens in `tailwind.config.ts`:

| Token | Value | Use |
|---|---|---|
| `ink` | `#080a0d` | Page background |
| `panel` | `#11151b` | Card/panel background |
| `panelSoft` | `#161b23` | Softer panel variant |
| `line` | `#232a36` | Border/divider |
| `accent` | `#98aee9` | Primary accent (blue-lavender) |
| `accentSoft` | `#1b2232` | Accent background tint |
| `gold` | `#c7b28a` | Secondary highlight |
| `success` | `#6cb49b` | Positive/fit state |
| `warning` | `#d5ab63` | Caution/watch state |
| `danger` | `#da7e7b` | Risk/blocker state |
| `mist` | `#a7b1c2` | Muted text |

**CSS custom properties** (in `globals.css`) provide surface variants (`--surface-border`, `--surface-muted`, `--surface-elevated`, `--surface-glass-*`) and shadow tokens. The design is dark-only (no light mode).

**Background:** Cinematic gradient — `bg-cinematic` utility class uses `radial-gradient` overlays on near-black.

---

## Key Domain Types (src/models/types.ts)

```typescript
AtomicTask         // A single job task with sensory/motor/cognitive requirements
WorkEnvironment    // Physical/digital environment properties
Job                // Role definition: tasks + environment + metadata
CapabilityProfile  // Candidate capabilities across sensory/motor/cognitive dimensions
Barrier            // Detected friction point: type, severity, affected tasks
Accommodation      // Intervention: cost (SAR), effort, effectiveness, barrier links
AccommodationPlan  // Assembled plan: total cost, feasibility, items[]
TaskFitResult      // Per-task score, fitLevel, blockerCodes
ReadinessReport    // Final decision: status, readiness %, signals, checklist
AssessmentBundle   // Everything above combined
DecisionExplainability // Drivers, scenarios, thresholds, next actions
```

---

## External Portal

The external portal at `/external` provides a public entry point for employers and candidates to submit pre-assessment data. It uses `ExternalHandoffInput` (defined in `src/lib/external-handoff.ts`) which is validated via `isExternalHandoffInput()` and transformed by `buildExternalHandoffRecord()` before being ingested into the main `AssessmentContext`.

---

## Pages & Routes

| Path | Description |
|---|---|
| `/` | External entry gateway (public landing) |
| `/home` | Role hub — personalized landing per role |
| `/workspace` | Case initiator workspace |
| `/job-analysis` | Job intake and task editor |
| `/candidate-profile` | Capability profile editor |
| `/matching` | Task fit matching review |
| `/accommodation-plan` | Accommodation plan builder |
| `/readiness-report` | Executive readiness/decision report |
| `/dashboard` | Executive portfolio dashboard |
| `/external` | Public external gateway |
| `/external/employer` | Employer job intake form |
| `/external/candidate` | Candidate capability intake form |
| `/external/submit` | Handoff submission confirmation |
| `/portal/[slug]` | Dynamic role-gated portal pages (cases, compliance, reports, etc.) |

---

## Important Conventions

1. **No server-side code.** Everything in `src/lib/` is pure TypeScript with no Node.js-only APIs. All pages use `"use client"` or render client components.

2. **No real AI calls.** The `ai-insights.ts` file generates deterministic insight text, not LLM output.

3. **Scores are clamped 0–100.** All engine functions use a local `clamp(value)` helper.

4. **Mock data is the source of truth for demo.** Do not replace mock data with API calls without migrating the context providers to async.

5. **Fonts load via `next/font/google`.** Do not add `<link>` tags for fonts manually.

6. **Static export constraint.** No dynamic server routes, no API routes, no `getServerSideProps`. Use `output: "export"` behavior — all pages must be statically renderable.

7. **Arabic text is inline, not in i18n files.** Microcopy lives in `src/lib/microcopy.ts` and `src/lib/display-copy.ts`. Do not introduce an i18n library without migrating existing copy.

8. **Context reads are hooks only.** Use `useAssessment()` and `useRoleSession()` — never import context directly. Both throw if used outside their providers.

9. **Tailwind only — no CSS modules, no styled-components.** Inline styles are allowed only for dynamic values (e.g., `style={{ width: \`${score}%\` }}`).

10. **All amounts in SAR.** Financial values use `CostRange { min, max, midpoint }` typed in SAR.

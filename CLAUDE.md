# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server
npm run build      # TypeScript compile + Vite production build
npm run lint       # ESLint
npm run preview    # Preview production build locally
```

No test suite is configured.

## Environment

Requires a `.env` file with:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Architecture

**Stack:** React 18 + TypeScript + Vite, Tailwind CSS (dark mode via `class`), Supabase (auth + DB), Framer Motion, Recharts, Capacitor (Android).

**Routing:** Single-page app with three route zones — `/` (landing or redirect), `/auth`, `/dashboard` (protected). Navigation between dashboard tabs is done via `window.dispatchEvent(new CustomEvent('tabChange', { detail: tab }))` from `Layout` to `Dashboard`, not via router.

**Auth:** `AuthProvider` (wraps the whole app) exposes `useAuth()`. All Supabase calls go through the singleton in `src/lib/supabase.ts`. Core DB types (`Bank`, `Goal`, `Transaction`, `TransactionWithDetails`) are also exported from that file; component-local types live in `src/types/`.

**Dashboard tabs:** `overview | goals | banks | transactions | history | dca | stocks`. Each tab renders a dedicated feature component; data is loaded once in `Dashboard` and passed down as props.

**Services pattern:** `src/services/` contains plain-object services (e.g. `bankService`, `goalService`, `stockPriceService`) that wrap Supabase queries. `src/hooks/` contains React hooks (e.g. `useBankManager`, `useDCAPlans`) that call these services and hold component state.

**Stock prices:** `stockPriceService` fetches real-time data from `casablanca-bourse.com` API, caches prices in the `moroccan_companies` Supabase table (5-min TTL), and broadcasts updates via `stockPriceEventBus` (`src/utils/stockPriceEventBus.ts`) so multiple components stay in sync without prop drilling.

**Styling:** Tailwind with an extended theme (`primary`, `accent`, `success`, `warning`, `danger`, `dark` color scales). Custom utility classes like `glass-card` are defined in global CSS. Dark mode is toggled by adding/removing the `dark` class on `<html>`; `DarkModeProvider` manages this.

**Database schema** (Supabase migrations in `supabase/migrations/`): `banks`, `goals`, `transactions`, `transaction_goals`, `objectives_transactions`, `allocations`, `dca_plans`, `stock_portfolio`, `moroccan_companies`.

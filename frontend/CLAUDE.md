# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server with HMR
npm run build      # Type-check (tsc -b) then build for production
npm run lint       # Run ESLint
npm run preview    # Preview production build locally
npm test           # Run Vitest unit tests
```

## Architecture

Reddflix is a Netflix-style Reddit media browser — a React 19 + TypeScript SPA using Vite, Redux Toolkit (RTK Query), and React Router v7.

### Data Flow

```
Reddit public JSON API (no auth)
  → redditApi.ts (RTK Query with custom rate-limit base query)
  → Redux store (persisted via redux-persist → localForage → IndexedDB)
  → React components
  ↕
localAppApi.ts (RTK Query over IndexedDB for app state: subreddits, seenPosts, requestMonitor)
```

### Key Directories

- `src/features/reddit/` — Reddit API integration (`redditApi.ts`), types (`redditTypes.ts`), and post-level components
- `src/features/localApp/` — IndexedDB CRUD via RTK Query (`localAppApi.ts`) and rate-limit utilities
- `src/app/store.ts` — Redux store with RTK Query + Redux Persist configuration
- `src/components/` — Reusable UI: `ScrollContainer` (horizontal row per subreddit), `PostModal`, media renderers (`VideoContent`, `GalleryContent`, `ImageContent`, `EmbedContent`)
- `src/pages/` — Route-level components; `Root.tsx` handles app init and the rate-limit request manager
- `src/utils/` — `router.tsx` (React Router v7 config), `db.ts` (idb IndexedDB wrapper), `helpers.ts` (markdown rendering, time formatting)
- `src/data/` — Static defaults for subreddits, and fallback /posts /comments.

### Rate Limiting

Reddit's public API has no authentication but enforces rate limits. `redditApi.ts` uses a custom RTK Query `baseQuery` that:

- Tracks a ban state in memory (25 min in production, 1 min in dev) triggered by 403 responses
- Coordinates in-flight request counts through `localAppApi` (the `requestMonitor` IndexedDB store)
- `Root.tsx` manages the queue and retry logic via a `useEffect` watching the monitor state

### IndexedDB Schema

`reddflix-db` (v2) — managed via `src/utils/db.ts` using the `idb` library:

- `subreddits` — per-subreddit state (enabled/disabled, TTL)
- `seenPosts` — post view history
- `requestMonitor` — only for the bannedUntil timestamp for 403's

### State Persistence

Redux Persist serializes the RTK Query cache (Reddit API responses) to IndexedDB via localForage. App-specific state (subreddits, etc.) bypasses Redux and goes directly to IndexedDB through `localAppApi`.

### Styling

Tailwind CSS v3 with `@tailwindcss/typography` (markdown rendering) and a fixed dark theme (background `#212121`). Framer Motion handles animations.

### Deployment

Firebase Hosting (`firebase.json`) with an SPA rewrite rule — all routes redirect to `index.html`. Build output goes to `/dist`.

# Instructions

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

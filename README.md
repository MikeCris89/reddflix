# Reddflix

A Netflix-style Reddit media browser. Browse posts by subreddit category, search for content, and read threaded comments — all in a clean, dark-themed interface.

Built as a portfolio project to work through real-world patterns in TypeScript, Redux Toolkit, and browser-side data persistence.

---

## Demo

![Wireframe](./frontend/docs/main-page-wireframe.svg)

---

## Stack

**Frontend**

- React 19 + TypeScript (Vite)
- Redux Toolkit — state management
- RTK Query — data fetching and cache
- Redux Persist + localForage — RTK cache persisted to IndexedDB
- React Router v7
- Tailwind CSS v3
- Framer Motion — animations
- HLS.js — video playback
- DOMPurify — safe HTML rendering for Reddit markdown
- Jest + React Testing Library — unit tests

**Backend** _(in progress)_  
An Express proxy server is being built to handle Reddit API requests server-side, which will simplify rate limiting and avoid exposing the public JSON API directly from the client.

---

## Project Structure

```
reddflix/
├── frontend/     # React SPA
├── backend/      # Express proxy (in progress)
└── shared/       # Shared types
```

---

## Getting Started

```bash
git clone https://github.com/YOUR_USERNAME/reddflix.git
cd reddflix/frontend
npm install
npm run dev
```

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the Vite dev server            |
| `npm run build`   | Type-check and build for production  |
| `npm run lint`    | Run ESLint                           |
| `npm run preview` | Preview the production build locally |
| `npm test`        | Run Jest unit tests                  |

---

## Features

- Browse Reddit posts in a horizontal, per-subreddit row layout
- Search across subreddits
- Expand posts to view full content, images, video, and comments
- Reddit markdown rendered safely via DOMPurify
- Client-side rate limiting with ban state tracked in IndexedDB, shared across tabs
- RTK Query cache persisted to IndexedDB — fast reloads without re-fetching

---

## Author

**Michael Cristofaro**
Built as part of a portfolio project to master API integration, Redux, and TypeScript in React.
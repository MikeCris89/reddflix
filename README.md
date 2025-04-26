# 🎬 Reddflix

**Reddflix** is a Reddit-powered media browser styled like a streaming service. Inspired by platforms like Netflix, users can scroll through posts by subreddit categories, search for content, and view threaded comments — all in a clean, mobile-friendly interface.

---

## 📸 Wireframes

![Wireframe](./docs/main-page-wireframe.svg)

```
+-------------------------------------------+
|                Header                     |
| [Logo]   [Search Bar]   [Filter Tags]     |
+-------------------------------------------+

| Subreddit: r/movies                       |
| [Post 1] [Post 2] [Post 3] →              |

| Subreddit: r/pics                         |
| [Post 1] [Post 2] [Post 3] →              |

| Footer with links                         |
+-------------------------------------------+
```

---

## ⚙️ Technologies Used

- ⚛️ React 18+ (with TypeScript)
- 🔁 Redux Toolkit (RTK)
- 🚀 RTK Query for API data fetching & caching
- 🧭 React Router v6
- 📦 Reddit JSON API (unofficial, read-only)
- 🎨 Tailwind CSS for styling
- ✅ Jest + React Testing Library (for unit tests)

---

## ✨ Features

- 🔎 Search for posts across subreddits
- 🧵 View Reddit posts in a Netflix-style layout
- 🎯 Filter content by subreddit
- 📖 Expand posts to view full content and comments
- ✅ Render Markdown properly in post content
- ⚙️ Responsive design (mobile to desktop)
- 🎬 Clean animations & transitions

---

## 🛠 Setup Instructions

```bash
git clone https://github.com/YOUR_USERNAME/reddflix.git
cd reddflix
npm install
npm run dev
```

---

## 🧪 Testing

- Mock API responses for testing UI states
- Lighthouse score ≥ 90 across all categories
- Unit tests with **Jest** and **React Testing Library**
- End-to-end tests (planned) with **Playwright** or **Cypress**

---

## 💡 Future Enhancements

- ⭐ Add favorites/bookmarks (localStorage)
- 🌙 Dark mode toggle
- 📱 Mobile gesture support
- 🎯 Sorting options (top, new, rising)
- 🧠 Smart loading skeletons
- ⚙️ Deploy with CI/CD (GitHub Actions / Vercel)
- 🔐 Optional auth system for saved preferences

---

## 👤 Author

**Mike Cris**  
Built as part of a portfolio project to master API integration, Redux, and TypeScript in React.

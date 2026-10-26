# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # install dependencies
npm run dev       # dev server at http://localhost:5173/blog/
npm run build     # production build → dist/
npm run preview   # preview the production build locally
```

No lint or test scripts are configured.

## Architecture

This is a React 18 + Vite SPA deployed to GitHub Pages at `wsnh2022.github.io/blog/`. The `base` in `vite.config.js` is `/blog/`, so all asset and routing references must account for that prefix.

**Post pipeline (the core mechanic):**

- `src/posts/*.md`: all blog posts live here. Drop a `.md` file and it appears automatically; no registry to update.
- `src/posts.js` is the single parser: it uses `import.meta.glob('./posts/*.md', { query: '?raw', import: 'default', eager: true })`, parses every post once, sorts newest first, and exports `posts`, `getPost`, `groupByMonth` and `formatDate`. `Home.jsx`, `Post.jsx` and the footer all read from it.
- Frontmatter (`title`, `date`, `image`, optional `description`) is parsed with simple regex; no YAML library is used. Missing title falls back to the first `#` header, then the filename. `description` feeds the index excerpt, the post summary line and the meta description; without it, local posts use their first paragraph.
- **Remote posts:** if the first line of a post's content is a `https://github.com/` URL, `Post.jsx` fetches the raw file from `raw.githubusercontent.com` at runtime and rewrites relative asset URLs to absolute ones. The title, date and cover render immediately from local frontmatter; only the body waits on GitHub.

**Routing:** React Router v5 (`BrowserRouter` with `basename="/blog"`). Routes: `/` → `Home`, `/post/:id` → `Post`. SPA deep-link support on GitHub Pages is handled via a `404.html` redirect trick (see the most recent commit).

**Shared page parts:** `src/site.jsx` holds the top bar (`SiteBar`), the photograph footer, `setPageMeta` (per-page `<title>` and meta description) and `useReveal` (scroll entrances: elements with `data-reveal` get `data-in` when they enter the viewport; the hidden start state only applies under `prefers-reduced-motion: no-preference` and the `motion` class set in `index.html`).

**Home layout:** a split stage. The left column scrolls (hero, then the index grouped by month); the right column is a sticky preview of the post being pointed at or scrolled past. Below 860px it collapses to one column with the preview after the hero.

**Design rules:** styling is plain CSS with tokens in `src/index.css` (`--accent` `#4f46e5` is the brand colour; five type steps; square corners; no gradients, glass or resting shadows).

**Theme:** `ThemeToggle.jsx` (rendered inside `SiteBar`) writes `data-theme` on `<html>` and persists the value in `localStorage`. `Post.jsx` polls `localStorage` every 500ms to sync the syntax-highlighter theme (Prism One Dark / One Light).

**Deployment:** pushing to `main` triggers `.github/workflows/deploy.yml`, which runs `npm run build` and uploads `dist/` to GitHub Pages via the official Actions. No manual deploy step needed.

## Adding a post

Create `src/posts/my-post-slug.md`. Frontmatter is optional but recommended:

```markdown
---
title: "Post Title"
date: "2026-01-15"
image: "https://..."   # optional hero image URL
description: "One sentence on what the post is."   # optional
---
```

For a remote-synced post, omit frontmatter body and put the raw GitHub blob URL as the very first line of content.

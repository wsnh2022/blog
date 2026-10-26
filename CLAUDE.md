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

**Shared page parts:** `src/site.jsx` holds the sticky top bar (`SiteBar`, whose search box writes `?q=` on the home URL), the author details (`AUTHOR`), `Byline`, `AboutCard`, the footer, `setPageMeta` (per-page `<title>` and meta description) and `useReveal` (scroll entrances: elements with `data-reveal` get `data-in` when they enter the viewport; the hidden start state only applies under `prefers-reduced-motion: no-preference` and the `motion` class set in `index.html`). `App.jsx` renders the bar and footer once around every route.

**Home layout:** a dev.to-style feed of white cards on a grey page. The newest post gets a full-width cover; the rest show a thumbnail. A sidebar holds the about card and, once posts have tags, a Topics list (the six most-used topics also appear as tabs above the feed). Below 860px the sidebar is hidden.

**Post layout:** a left action rail (copy link, source, top), the article card (cover, byline with read time, extra-bold title, tags, then the Markdown body in `.prose`) and a right sidebar (author card, more posts, sticky "On this page"). h2/h3 get slug ids that feed the contents lists. For remote posts the README's first `#` heading and any copy of the cover image are dropped, since the card already shows both. Fenced code renders through `CodeBlock`: always dark (Prism One Dark), with a language label and Copy button. `mermaid` blocks render as diagrams instead; the mermaid library is loaded on demand (its own chunk) and redraws when the theme changes.

**Design rules:** plain CSS with tokens in `src/index.css`. System UI font stack (no web fonts), 19px body text, extra-bold titles, `--accent` `#4f46e5` as the brand colour and only accent, 8px radius, 1px borders instead of shadows, no gradients or glass.

**Theme:** `ThemeToggle.jsx` (rendered inside `SiteBar`) writes `data-theme` on `<html>` and persists the value in `localStorage`; `index.html` applies the saved value before first paint.

**Deployment:** pushing to `main` triggers `.github/workflows/deploy.yml`, which runs `npm run build` and uploads `dist/` to GitHub Pages via the official Actions. No manual deploy step needed.

## Adding a post

Create `src/posts/my-post-slug.md`. Frontmatter is optional but recommended:

```markdown
---
title: "Post Title"
date: "2026-01-15"
image: "https://..."   # optional hero image URL
description: "One sentence on what the post is."   # optional, shown on the home card
tags: "autohotkey, tools"   # optional, comma-separated
---
```

For a remote-synced post, omit frontmatter body and put the raw GitHub blob URL as the very first line of content.

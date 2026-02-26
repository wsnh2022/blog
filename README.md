# 🖋️ Modern Markdown Blog

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind Friendly](https://img.shields.io/badge/CSS-Vanilla-f34b7d?logo=css3)](https://www.w3.org/TR/CSS/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A high-performance, professional-grade static blog engine designed for developers. This project transforms simple Markdown files into a premium reading experience with **zero configuration** required for new posts.

🔗 **Live Demo:** [wsnh2022.github.io/blog](https://wsnh2022.github.io/blog/)

---

## ✨ Key Features

### 🌑 Premium Theme System
-   **One-Click Publish:** Includes a `publish.bat` script to stage, commit, and push your posts instantly.
-   **Dark & Light Modes:** Seamlessly switch between themes with a glassmorphism toggle.
-   **Persistence:** Your theme preference is saved locally for a consistent experience.
-   **Smooth UI:** Beautiful transitions and micro-animations throughout.

### 📜 Automated Content Pipeline
-   **Dynamic Post Discovery:** No need to update index files! Drop any `.md` file into `src/posts/` and the blog detects it automatically using Vite's dynamic glob importing.
-   **Markdown Excellence:** Full support for GFM (GitHub Flavored Markdown), including tables, lists, and links.

### 💻 Developer Experience (DX)
-   **Syntax Highlighting:** Professional, theme-aware code highlighting using Prism.js (One Dark/Light themes).
-   **Performance First:** Built with Vite for near-instant HMR (Hot Module Replacement) and ultra-lean production builds.
-   **Zero Bloat:** Minimal dependency tree for maximum security and ease of maintenance.

### 🚀 CI/CD Ready
-   **Automated Deployment:** Includes a pre-configured GitHub Actions workflow for zero-touch publishing to GitHub Pages.

---

## 🛠️ Tech Stack

-   **Frontend:** [React 18](https://reactjs.org/)
-   **Build Tool:** [Vite](https://vitejs.dev/)
-   **Styling:** Custom Vanilla CSS (Design Tokens & Glassmorphism)
-   **Markdown Rendering:** [React Markdown](https://github.com/remarkjs/react-markdown)
-   **Syntax Highlighting:** [React Syntax Highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter)

---

## 🏗️ Getting Started

### 1. Installation

```bash
npm install
```

### 2. Local Development

```bash
npm run dev
```
Navigate to `http://localhost:5173/blog/` to see your changes in real-time.

### 3. Adding a New Post

Simply create a `.md` file in the `src/posts/` directory. You can optionally include frontmatter:

```markdown
---
title: "My Amazing Journey"
date: "2026-02-27"
---
# Content starts here...
```

### 4. Production Build

```bash
npm run build
```

---

## 🚢 Deployment

The blog is configured for **GitHub Pages**. Every push to the `main` branch triggers a GitHub Action that builds and deploys the site automatically.

1.  Push your code to GitHub.
2.  Enable GitHub Pages in **Settings > Pages** by choosing **GitHub Actions** as the source.

---

*Built with passion for the developer community. Feel free to fork and customize!*

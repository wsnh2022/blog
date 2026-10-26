import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const ABOUT_ID = 'virtual:repo-about';

// Reads the About text of every public wsnh2022 repo once per build, so project posts
// can show it. If GitHub can't be reached, posts fall back to their own description.
const repoAbout = () => ({
    name: 'repo-about',
    resolveId: (id) => (id === ABOUT_ID ? `\0${ABOUT_ID}` : null),
    async load(id) {
        if (id !== `\0${ABOUT_ID}`) return null;
        const about = {};
        try {
            const headers = process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {};
            const res = await fetch('https://api.github.com/users/wsnh2022/repos?per_page=100', { headers });
            if (!res.ok) throw new Error(`GitHub answered ${res.status}`);
            for (const repo of await res.json()) {
                if (repo.description) about[repo.full_name.toLowerCase()] = repo.description.trim();
            }
        } catch (err) {
            this.warn(`Repo About texts unavailable, using post descriptions: ${err.message}`);
        }
        return `export default ${JSON.stringify(about)};`;
    },
});

export default defineConfig({
    plugins: [react(), repoAbout()],
    base: '/blog/',
});

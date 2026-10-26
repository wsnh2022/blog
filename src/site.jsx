import React, { useEffect } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import logo from '../logo.png';
import { posts, formatDate } from './posts';

const SITE = 'wsnh2022';
const DEFAULT_DESCRIPTION =
    'Write-ups of the tools I build and notes on what I learn, each project post read live from its GitHub README.';

export const AUTHOR = {
    name: 'Yoghesh',
    avatar: 'https://github.com/wsnh2022.png?size=96',
    github: 'https://github.com/wsnh2022',
    bio: 'I build small automation tools: AutoHotkey, n8n, Electron and AI helpers.',
};

export const setPageMeta = (title, description = DEFAULT_DESCRIPTION) => {
    document.title = title ? `${title} | ${SITE} blog` : `${SITE} blog: tools I build and what I learn`;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
    }
    meta.content = description;
};

export const useReveal = (key, tagSelector) => {
    useEffect(() => {
        if (!('IntersectionObserver' in window)) return undefined;
        document.documentElement.classList.add('motion');
        if (tagSelector) document.querySelectorAll(tagSelector).forEach((el) => { el.dataset.reveal = ''; });
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        e.target.dataset.in = '';
                        io.unobserve(e.target);
                    }
                });
            },
            { threshold: 0 }
        );
        document.querySelectorAll('[data-reveal]:not([data-in])').forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, [key]);
};

export const SiteBar = () => {
    const history = useHistory();
    const location = useLocation();
    const query = new URLSearchParams(location.search).get('q') || '';

    const search = (value) => {
        const to = { pathname: '/', search: value ? `?q=${encodeURIComponent(value)}` : '' };
        if (location.pathname === '/') history.replace(to);
        else history.push(to);
    };

    return (
        <header className="bar">
            <nav className="bar-inner" aria-label="Site">
                <Link to="/" className="logo">
                    <img src={logo} alt="Yoghesh's blog, home" width="40" height="40" />
                </Link>
                <div className="search" role="search">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-3.5-3.5" />
                    </svg>
                    <input
                        type="search"
                        placeholder="Search posts..."
                        aria-label="Search posts"
                        value={query}
                        onChange={(e) => search(e.target.value)}
                    />
                </div>
                <div className="bar-links">
                    <a href="https://wsnh2022.github.io" className="hide-sm">Portfolio</a>
                    <a href={AUTHOR.github} className="hide-sm">GitHub</a>
                    <ThemeToggle />
                </div>
            </nav>
        </header>
    );
};

export const Byline = ({ post, extra }) => (
    <div className="byline">
        <img className="avatar" src={AUTHOR.avatar} alt="" width="36" height="36" loading="lazy" />
        <div>
            <strong>{AUTHOR.name}</strong>
            <span className="muted">
                {post.date && <time dateTime={post.date}>{formatDate(post.date)}</time>}
                {extra}
            </span>
        </div>
    </div>
);

export const AboutCard = () => (
    <section className="card about" aria-label="About the author">
        <div className="about-band" />
        <div className="about-body">
            <img className="avatar" src={AUTHOR.avatar} alt="" width="48" height="48" />
            <a href={AUTHOR.github} className="about-name">{AUTHOR.name}</a>
            <p className="about-bio">{AUTHOR.bio}</p>
            <a href={AUTHOR.github} className="btn">Follow on GitHub</a>
            <ul className="about-facts">
                <li>{posts.length} posts</li>
                <li>
                    Portfolio: <a href="https://wsnh2022.github.io">wsnh2022.github.io</a>
                </li>
            </ul>
        </div>
    </section>
);

export const Footer = () => (
    <footer className="footer">
        <div className="footer-inner">
            <p>
                © {new Date().getFullYear()} {AUTHOR.name} · <a href="https://github.com/wsnh2022/blog">Source on GitHub</a>
            </p>
            <ul>
                <li><Link to="/">All posts</Link></li>
                <li><a href="https://wsnh2022.github.io">Portfolio</a></li>
                <li><a href={AUTHOR.github}>GitHub</a></li>
            </ul>
        </div>
    </footer>
);

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { posts } from './posts';

const SITE = 'wsnh2022';
const DEFAULT_DESCRIPTION =
    'Write-ups of the tools I build and notes on what I learn, each project post read live from its GitHub README.';

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

export const SiteBar = () => (
    <nav className="bar" aria-label="Site">
        <Link to={{ pathname: '/', hash: '#posts' }} className="bar-link">Posts</Link>
        <Link to="/" className="wordmark">{SITE}</Link>
        <div className="bar-end">
            <a href="https://github.com/wsnh2022" className="bar-link">GitHub</a>
            <ThemeToggle />
        </div>
    </nav>
);

const pictured = posts.filter((p) => p.image).slice(-1)[0];

export const Footer = () => (
    <footer className="footer">
        {pictured && (
            <img
                className="footer-photo"
                src={pictured.image}
                alt={`Cover of ${pictured.title}`}
                width="1600"
                height="1000"
                loading="lazy"
            />
        )}
        <div className="footer-top" data-reveal>
            <ul className="footer-links">
                <li><Link to={{ pathname: '/', hash: '#posts' }}>All posts</Link></li>
                <li><a href="https://github.com/wsnh2022">GitHub profile</a></li>
                <li><a href="https://wsnh2022.github.io">Portfolio</a></li>
            </ul>
            <div className="footer-meta">
                {pictured && (
                    <p>Pictured: <Link to={`/post/${pictured.id}`}>{pictured.title}</Link></p>
                )}
                <p>Source: <a href="https://github.com/wsnh2022/blog">wsnh2022/blog</a></p>
            </div>
        </div>
        <div className="footer-bottom">
            <p className="footer-name" data-reveal aria-hidden="true">{SITE}</p>
            <p className="footer-legal">
                © {new Date().getFullYear()} {SITE}. Every post is a Markdown file; project posts are read live from their GitHub READMEs.
            </p>
        </div>
    </footer>
);

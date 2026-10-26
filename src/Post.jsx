import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { posts, getPost } from './posts';
import { setPageMeta, useReveal, Byline, AUTHOR } from './site';

const CODE_FONT = { fontFamily: 'ui-monospace, "SF Mono", SFMono-Regular, Consolas, "Liberation Mono", monospace' };

const rewriteLinks = (text, base) => {
    // Fix Markdown images/links: ![alt](assets/...) or ![alt](./assets/...)
    text = text.replace(/(!\[.*?\]\()(\.\/|)(?!(http|data:))(.*?\))/g, `$1${base}$4`);
    // Fix HTML images/videos: src="assets/..." or src="./assets/..."
    text = text.replace(/(src=")(\.\/|)(?!(http|data:))(.*?")/g, `$1${base}$4`);
    return text;
};

const textOf = (children) =>
    React.Children.toArray(children)
        .map((c) => (typeof c === 'string' || typeof c === 'number' ? c : textOf(c.props?.children)))
        .join('');

const slug = (text) =>
    text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

const readTime = (text) => Math.max(1, Math.round(text.split(/\s+/).length / 220));

const Icon = ({ d }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={d} />
    </svg>
);

const CodeBlock = ({ lang, text }) => {
    const [copied, setCopied] = useState(false);

    const copy = () => {
        navigator.clipboard?.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };

    return (
        <div className="code">
            <div className="code-head">
                <span>{lang}</span>
                <button type="button" className="copy" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
            </div>
            <SyntaxHighlighter style={oneDark} language={lang} PreTag="div" customStyle={CODE_FONT} codeTagProps={{ style: CODE_FONT }}>
                {text}
            </SyntaxHighlighter>
        </div>
    );
};

const fileName = (url) => (url || '').split('?')[0].split('/').pop().toLowerCase();

const makeComponents = (cover) => ({
    h1: ({ node, children, ...props }) => <h2 id={slug(textOf(children))} {...props}>{children}</h2>,
    h2: ({ node, children, ...props }) => <h2 id={slug(textOf(children))} {...props}>{children}</h2>,
    h3: ({ node, children, ...props }) => <h3 id={slug(textOf(children))} {...props}>{children}</h3>,
    // The cover already sits at the top of the card, so skip the README's copy of it.
    img: ({ node, ...props }) => (cover && fileName(props.src) === cover ? null : <img loading="lazy" {...props} />),
    pre({ node, children, ...props }) {
        const child = Array.isArray(children) ? children[0] : children;
        if (!child?.props) return <pre {...props}>{children}</pre>;
        const lang = /language-(\w+)/.exec(child.props.className || '')?.[1] || 'text';
        return <CodeBlock lang={lang} text={textOf(child.props.children).replace(/\n$/, '')} />;
    },
});

const Progress = () => {
    const bar = useRef(null);

    useEffect(() => {
        const onScroll = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, []);

    return <div className="progress" ref={bar} aria-hidden="true" />;
};

const Rail = ({ post }) => {
    const [copied, setCopied] = useState(false);

    const copyLink = () => {
        navigator.clipboard?.writeText(window.location.href).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };

    return (
        <nav className="rail" aria-label="Post actions">
            <button type="button" onClick={copyLink}>
                <Icon d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
                {copied ? 'Copied' : 'Copy link'}
            </button>
            <a href={post.remoteUrl || `https://github.com/wsnh2022/blog/blob/main/src/posts/${post.id}.md`}>
                <Icon d="M8 9l-4 3 4 3M16 9l4 3-4 3M14 5l-4 14" />
                Source
            </a>
            <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <Icon d="M12 19V5M5 12l7-7 7 7" />
                Top
            </button>
        </nav>
    );
};

const useActiveHeading = (items) => {
    const [active, setActive] = useState(null);

    useEffect(() => {
        if (!('IntersectionObserver' in window)) return undefined;
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) setActive(e.target.id);
                });
            },
            { rootMargin: '0px 0px -70% 0px' }
        );
        items.forEach((item) => {
            const el = document.getElementById(item.id);
            if (el) io.observe(el);
        });
        return () => io.disconnect();
    }, [items]);

    return active;
};

const TocList = ({ items, active }) => (
    <ol>
        {items.map((item, i) => (
            <li key={`${item.id}-${i}`} className={item.level === 3 ? 'toc-sub' : undefined}>
                <a href={`#${item.id}`} aria-current={item.id === active ? 'true' : undefined}>{item.text}</a>
            </li>
        ))}
    </ol>
);

const Post = () => {
    const { id } = useParams();
    const post = getPost(id);
    const [title, setTitle] = useState(post?.title);
    const [content, setContent] = useState(post && !post.remoteUrl ? post.content : null);
    const [failed, setFailed] = useState(false);
    const [toc, setToc] = useState([]);
    const active = useActiveHeading(toc);

    useReveal(`${id}:${content ? content.length : 0}`, '.prose > *');

    const index = posts.findIndex((p) => p.id === id);
    const older = posts[index + 1];
    const newer = index > 0 ? posts[index - 1] : null;
    const more = useMemo(() => posts.filter((p) => p.id !== id).slice(0, 4), [id]);
    const components = useMemo(() => makeComponents(fileName(post?.image)), [post?.image]);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (!post) {
            setPageMeta('Post not found');
            return;
        }
        setTitle(post.title);
        setPageMeta(post.title, post.description || undefined);
        setFailed(false);

        if (post.remoteUrl) {
            setContent(null);
            const rawUrl = post.remoteUrl.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
            const base = rawUrl.split('/').slice(0, -1).join('/') + '/';
            fetch(rawUrl)
                .then((response) => (response.ok ? response.text() : Promise.reject(response.status)))
                .then((remote) => {
                    const text = rewriteLinks(remote, base);
                    const header = text.match(/^#\s+(.*)/m);
                    if (header && !post.hasFrontmatterTitle) setTitle(header[1].trim());
                    // The README's top heading repeats the post title shown above it.
                    setContent(header ? text.replace(header[0], '') : text);
                })
                .catch((err) => {
                    console.error('Failed to fetch remote content:', err);
                    setFailed(true);
                });
        } else {
            setContent(post.content);
        }
    }, [id]);

    useEffect(() => {
        const headings = document.querySelectorAll('.prose h2[id], .prose h3[id]');
        setToc([...headings].map((h) => ({ id: h.id, text: h.textContent, level: h.tagName === 'H3' ? 3 : 2 })));
    }, [content]);

    if (!post) {
        return (
            <main className="card missing">
                <h1>Post not found</h1>
                <p>It may have been renamed or removed.</p>
                <Link to="/" className="btn">Back to all posts</Link>
            </main>
        );
    }

    const showToc = toc.length >= 2;

    return (
        <>
            <Progress />
            <div className="layout layout-post">
                <Rail post={post} />

                <main className="card article">
                    {post.image && (
                        <img
                            src={post.image}
                            alt={`Cover of ${post.title}`}
                            className="cover"
                            width="1600"
                            height="800"
                            onError={(e) => { e.currentTarget.dataset.broken = ''; }}
                        />
                    )}

                    <header className="article-head">
                        <Byline
                            post={post}
                            extra={
                                <>
                                    {content && ` · ${readTime(content)} min read`}
                                    {post.remoteUrl && (
                                        <>
                                            {' · '}
                                            <a href={post.remoteUrl}>{post.repo}</a>
                                        </>
                                    )}
                                </>
                            }
                        />
                        <h1>{title}</h1>
                        {post.tags.length > 0 && (
                            <ul className="tags">
                                {post.tags.map((t) => <li key={t}>#{t}</li>)}
                            </ul>
                        )}
                        {post.summary && <p className="article-summary">{post.summary}</p>}
                    </header>

                    <div className="article-body">
                        {showToc && (
                            <nav className="contents" aria-label="Contents">
                                <p>Contents</p>
                                <TocList items={toc} />
                            </nav>
                        )}

                        {content === null && !failed && (
                            <div className="skeleton" aria-label="Loading the post from GitHub">
                                {Array.from({ length: 9 }, (_, i) => <span key={i} />)}
                            </div>
                        )}
                        {failed && (
                            <p className="post-status">
                                GitHub didn't answer. <a href={post.remoteUrl}>Read the README on GitHub</a> instead.
                            </p>
                        )}
                        {content !== null && (
                            <div className="prose">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={components}>
                                    {content}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>

                    {(older || newer) && (
                        <nav className="pager" aria-label="Previous and next posts">
                            {older && (
                                <Link to={`/post/${older.id}`}>
                                    <span className="muted">← Previous</span>
                                    <strong>{older.title}</strong>
                                </Link>
                            )}
                            {newer && (
                                <Link to={`/post/${newer.id}`} className="next">
                                    <span className="muted">Next →</span>
                                    <strong>{newer.title}</strong>
                                </Link>
                            )}
                        </nav>
                    )}
                </main>

                <aside className="side">
                    <section className="card side-box">
                        <div className="byline author-line">
                            <img className="avatar" src={AUTHOR.avatar} alt="" width="36" height="36" />
                            <strong>{AUTHOR.name}</strong>
                        </div>
                        <p className="about-bio">{AUTHOR.bio}</p>
                        <a href={AUTHOR.github} className="btn">Follow on GitHub</a>
                    </section>

                    {more.length > 0 && (
                        <section className="card more" aria-labelledby="more-title">
                            <h2 id="more-title">
                                More from {AUTHOR.name}
                            </h2>
                            {more.map((p) => (
                                <Link key={p.id} to={`/post/${p.id}`}>
                                    <strong>{p.title}</strong>
                                    {p.tags.length > 0 && <span className="muted">{p.tags.map((t) => `#${t}`).join(' ')}</span>}
                                </Link>
                            ))}
                        </section>
                    )}

                    {showToc && (
                        <nav className="card side-box toc toc-box" aria-label="On this page">
                            <h2>On this page</h2>
                            <TocList items={toc} active={active} />
                        </nav>
                    )}
                </aside>
            </div>
        </>
    );
};

export default Post;

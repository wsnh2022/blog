import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { posts, getPost, formatDate } from './posts';

const CODE_FONT = { fontFamily: 'ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace' };
import { SiteBar, Footer, setPageMeta, useReveal } from './site';

const rewriteLinks = (text, base) => {
    // Fix Markdown images/links: ![alt](assets/...) or ![alt](./assets/...)
    text = text.replace(/(!\[.*?\]\()(\.\/|)(?!(http|data:))(.*?\))/g, `$1${base}$4`);
    // Fix HTML images/videos: src="assets/..." or src="./assets/..."
    text = text.replace(/(src=")(\.\/|)(?!(http|data:))(.*?")/g, `$1${base}$4`);
    return text;
};

const Post = () => {
    const { id } = useParams();
    const post = getPost(id);
    const [title, setTitle] = useState(post?.title);
    const [content, setContent] = useState(post && !post.remoteUrl ? post.content : null);
    const [failed, setFailed] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useReveal(`${id}:${content ? content.length : 0}`, '.post-content > *');

    const others = posts.filter((p) => p.id !== id).slice(0, 3);

    useEffect(() => {
        if (!post) {
            setPageMeta('Post not found');
            return undefined;
        }
        setTitle(post.title);
        setPageMeta(post.title, post.description);
        setFailed(false);

        if (post.remoteUrl) {
            setContent(null);
            const rawUrl = post.remoteUrl.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
            const base = rawUrl.split('/').slice(0, -1).join('/') + '/';
            fetch(rawUrl)
                .then((response) => (response.ok ? response.text() : Promise.reject(response.status)))
                .then((remote) => {
                    const text = rewriteLinks(remote, base);
                    setContent(text);
                    if (!post.hasFrontmatterTitle) {
                        const header = text.match(/^#\s+(.*)/m);
                        if (header) setTitle(header[1].trim());
                    }
                })
                .catch((err) => {
                    console.error('Failed to fetch remote content:', err);
                    setFailed(true);
                });
        } else {
            setContent(post.content);
        }

        const handleThemeChange = () => {
            setTheme(localStorage.getItem('theme') || 'light');
        };
        const interval = setInterval(handleThemeChange, 500);

        return () => clearInterval(interval);
    }, [id]);

    if (!post) {
        return (
            <div className="page">
                <div className="sheet missing">
                    <SiteBar />
                    <h1>Post not found.</h1>
                    <Link to="/" className="button">Back to Blog</Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="page">
                <article className="sheet post">
                    <SiteBar />
                    <header className="post-head">
                        <h1 data-reveal>{title}</h1>
                        {post.summary && (
                            <p className="post-summary" data-reveal style={{ '--d': '70ms' }}>{post.summary}</p>
                        )}
                        <p className="post-meta" data-reveal style={{ '--d': '140ms' }}>
                            {post.date && <time dateTime={post.date}>{formatDate(post.date)}</time>}
                            {post.remoteUrl && (
                                <>
                                    {post.date && ' · '}
                                    Source: <a href={post.remoteUrl}>{post.repo}</a>
                                </>
                            )}
                        </p>
                    </header>

                    {post.image && (
                        <div className="post-hero" data-reveal style={{ '--d': '200ms' }}>
                            <img src={post.image} alt={`Cover of ${post.title}`} className="post-hero-image" width="1600" height="1000" />
                        </div>
                    )}

                    <div className="post-content">
                        {content === null && !failed && <p className="post-status">Reading the README from GitHub…</p>}
                        {failed && (
                            <p className="post-status">
                                GitHub did not answer. <a href={post.remoteUrl}>Read the README on GitHub</a> instead.
                            </p>
                        )}
                        {content !== null && (
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                                components={{
                                    h1({ node, ...props }) {
                                        return <h2 {...props} />;
                                    },
                                    code({ node, inline, className, children, ...props }) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        return !inline && match ? (
                                            <SyntaxHighlighter
                                                style={theme === 'dark' ? oneDark : oneLight}
                                                language={match[1]}
                                                PreTag="div"
                                                customStyle={CODE_FONT}
                                                codeTagProps={{ style: CODE_FONT }}
                                                {...props}
                                            >
                                                {String(children).replace(/\n$/, '')}
                                            </SyntaxHighlighter>
                                        ) : (
                                            <code className={className} {...props}>
                                                {children}
                                            </code>
                                        );
                                    },
                                }}
                            >
                                {content}
                            </ReactMarkdown>
                        )}
                    </div>

                    <p className="post-end">
                        <Link to="/" className="back-link">Back to Blog</Link>
                    </p>
                </article>

                {others.length > 0 && (
                    <section className="sheet more" aria-labelledby="more-title">
                        <h2 id="more-title" data-reveal>More posts</h2>
                        <ol className="more-list">
                            {others.map((other, i) => (
                                <li key={other.id} data-reveal style={{ '--d': `${70 + i * 80}ms` }}>
                                    <Link to={`/post/${other.id}`} className="more-item">
                                        {other.image && (
                                            <img src={other.image} alt="" width="1600" height="1000" loading="lazy" />
                                        )}
                                        <span className="entry-title">{other.title}</span>
                                        <time className="entry-date" dateTime={other.date}>{formatDate(other.date)}</time>
                                        <span className="entry-desc">{other.description}</span>
                                    </Link>
                                </li>
                            ))}
                        </ol>
                    </section>
                )}
            </div>
            <Footer />
        </>
    );
};

export default Post;

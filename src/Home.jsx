import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { posts, groupByMonth, formatDate } from './posts';
import { SiteBar, Footer, setPageMeta, useReveal } from './site';

const groups = groupByMonth(posts);
const staged = posts.filter((p) => p.image);

const Home = () => {
    const location = useLocation();
    const [active, setActive] = useState(staged[0]?.id);
    const activePost = staged.find((p) => p.id === active) || staged[0];

    useReveal('home');

    useEffect(() => {
        setPageMeta();
        if (location.hash === '#posts') document.getElementById('posts')?.scrollIntoView();
    }, [location.hash]);

    useEffect(() => {
        if (!('IntersectionObserver' in window)) return undefined;
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting && e.target.dataset.staged) setActive(e.target.dataset.id);
                });
            },
            { rootMargin: '-45% 0px -45% 0px' }
        );
        document.querySelectorAll('.entry').forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, []);

    const latest = posts[0];

    return (
        <>
            <div className="split">
                <div className="reading">
                    <section className="sheet hero" aria-labelledby="hero-title">
                        <SiteBar />
                        <div className="hero-body">
                            <h1 id="hero-title" data-reveal style={{ '--d': '60ms' }}>
                                What I build and learn
                            </h1>
                            <p className="lede" data-reveal style={{ '--d': '140ms' }}>
                                A blog of my open-source tools and tech notes, each project post read live from its GitHub README.
                            </p>
                            {latest && (
                                <div data-reveal style={{ '--d': '220ms' }}>
                                    <Link className="button" to={`/post/${latest.id}`}>
                                        Read the newest post
                                    </Link>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="sheet index" id="posts" aria-labelledby="posts-title">
                        <h2 id="posts-title" data-reveal>All posts</h2>
                        <p className="note" data-reveal style={{ '--d': '70ms' }}>
                            {posts.length} posts, newest first.
                            <span className="note-wide"> Point at one to bring its cover onto the stage.</span>
                        </p>

                        {groups.map((group) => (
                            <div className="group" key={group.name}>
                                <h3 data-reveal>{group.name}</h3>
                                <ol className="entries">
                                    {group.posts.map((post, i) => (
                                        <li key={post.id} data-reveal style={{ '--d': `${70 + i * 70}ms` }}>
                                            <Link
                                                to={`/post/${post.id}`}
                                                className="entry"
                                                data-id={post.id}
                                                data-staged={post.image ? 'yes' : undefined}
                                                aria-current={post.id === active ? 'true' : undefined}
                                                onMouseEnter={() => post.image && setActive(post.id)}
                                                onFocus={() => post.image && setActive(post.id)}
                                            >
                                                {post.image && (
                                                    <img
                                                        className="entry-thumb"
                                                        src={post.image}
                                                        alt=""
                                                        width="1600"
                                                        height="1000"
                                                        loading="lazy"
                                                    />
                                                )}
                                                <span className="entry-title">{post.title}</span>
                                                <time className="entry-date" dateTime={post.date}>
                                                    {formatDate(post.date)}
                                                </time>
                                                <span className="entry-desc">{post.description}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        ))}

                        {posts.length === 0 && <p>No posts yet. Add a Markdown file to src/posts.</p>}

                        <p className="index-close" data-reveal>
                            Every post is a Markdown file in the wsnh2022/blog repository.
                            <br />
                            Project posts refresh from their README on every visit.
                        </p>
                    </section>
                </div>

                {activePost && (
                    <aside className="stage" aria-label="Preview of the selected post">
                        <div className="stage-frame">
                            {staged.map((post, i) => (
                                <img
                                    key={post.id}
                                    className="stage-img"
                                    data-active={post.id === activePost.id ? 'true' : undefined}
                                    src={post.image}
                                    alt={post.id === activePost.id ? `Cover of ${post.title}` : ''}
                                    width="1600"
                                    height="1000"
                                    loading={i === 0 ? 'eager' : 'lazy'}
                                />
                            ))}
                        </div>
                        <Link to={`/post/${activePost.id}`} className="stage-text" key={activePost.id}>
                            <span className="stage-title">{activePost.title}</span>
                            <span className="stage-desc">{activePost.description}</span>
                            <time dateTime={activePost.date}>{formatDate(activePost.date)}</time>
                        </Link>
                    </aside>
                )}
            </div>
            <Footer />
        </>
    );
};

export default Home;

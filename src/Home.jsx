import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { posts, allTags, topTags } from './posts';
import { setPageMeta, useReveal, Byline, AboutCard } from './site';

const hideBroken = (e) => {
    e.currentTarget.dataset.broken = '';
};

const Tags = ({ tags, onPick }) =>
    tags.length > 0 && (
        <ul className="tags">
            {tags.map((tag) => (
                <li key={tag}>
                    <button type="button" onClick={() => onPick(tag)}>#{tag}</button>
                </li>
            ))}
        </ul>
    );

const Entry = ({ post, big, onTag }) => (
    <article className={`card entry${big ? '' : ' compact'}`}>
        {big && post.image && (
            <img className="entry-cover" src={post.image} alt="" width="1600" height="800" onError={hideBroken} />
        )}
        <div className="entry-body">
            <Byline post={post} />
            <div className="entry-text">
                <h2>
                    <Link to={`/post/${post.id}`}>{post.title}</Link>
                </h2>
                {post.description && <p className="entry-desc">{post.description}</p>}
                <Tags tags={post.tags} onPick={onTag} />
                <div className="entry-foot">
                    <span>{post.remoteUrl ? 'Read the project write-up →' : 'Read post →'}</span>
                </div>
            </div>
        </div>
        {!big && post.image && (
            <img className="entry-thumb" src={post.image} alt="" width="440" height="280" loading="lazy" onError={hideBroken} />
        )}
    </article>
);

const Home = () => {
    const location = useLocation();
    const [tag, setTag] = useState(null);
    const query = (new URLSearchParams(location.search).get('q') || '').trim().toLowerCase();

    const shown = posts.filter(
        (p) =>
            (!tag || p.tags.includes(tag)) &&
            (!query || `${p.title} ${p.description} ${p.tags.join(' ')}`.toLowerCase().includes(query))
    );

    useReveal(`home:${query}:${tag}`);

    useEffect(() => {
        setPageMeta();
    }, []);

    return (
        <div className="layout layout-home">
            <main className="feed" id="posts">
                {allTags.length > 0 && (
                    <div className="feed-tabs" role="group" aria-label="Filter by topic">
                        <button type="button" aria-pressed={!tag} onClick={() => setTag(null)}>Latest</button>
                        {[...new Set([...topTags, tag].filter(Boolean))].map((t) => (
                            <button type="button" key={t} aria-pressed={tag === t} onClick={() => setTag(t)}>
                                {t}
                            </button>
                        ))}
                    </div>
                )}

                {shown.map((post, i) => (
                    <div key={post.id} data-reveal style={{ '--d': `${Math.min(i, 4) * 60}ms` }}>
                        <Entry post={post} big={i === 0} onTag={setTag} />
                    </div>
                ))}

                {shown.length === 0 && (
                    <p className="card empty">
                        {posts.length === 0 ? 'No posts yet. Add a Markdown file to src/posts.' : 'No posts match your search.'}
                    </p>
                )}
            </main>

            <aside className="side">
                <AboutCard />
                {allTags.length > 0 && (
                    <section className="card side-box" aria-labelledby="topics-title">
                        <h2 id="topics-title">Topics</h2>
                        <Tags tags={allTags} onPick={setTag} />
                    </section>
                )}
            </aside>
        </div>
    );
};

export default Home;

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { setPageMeta } from './site';

const NotFound = () => {
    useEffect(() => setPageMeta('Not found'), []);

    return (
        <main className="card missing">
            <h1>This page doesn't exist</h1>
            <p>The link may be old, or the post may have moved.</p>
            <Link to="/" className="btn">Back to all posts</Link>
        </main>
    );
};

export default NotFound;

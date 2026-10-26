import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SiteBar, setPageMeta } from './site';

const NotFound = () => {
    useEffect(() => setPageMeta('Not found'), []);

    return (
        <div className="page">
            <div className="sheet missing">
                <SiteBar />
                <h1>404 - Not Found</h1>
                <p>The page you are looking for does not exist.</p>
                <Link to="/" className="button">Back to Blog</Link>
            </div>
        </div>
    );
};

export default NotFound;

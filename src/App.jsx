import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './Home';
import Post from './Post';
import NotFound from './NotFound';
import { SiteBar, Footer } from './site';

const App = () => {
    return (
        <Router basename="/blog">
            <SiteBar />
            <Switch>
                <Route path="/" exact component={Home} />
                <Route path="/post/:id" component={Post} />
                <Route component={NotFound} />
            </Switch>
            <Footer />
        </Router>
    );
};

export default App;

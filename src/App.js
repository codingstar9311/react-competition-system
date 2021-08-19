import React, {useEffect} from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    Redirect,
    useRouteMatch,
    useParams
} from "react-router-dom";
import Dashboard from "./Pages/Admin/Dashboard";
import Login from "./Pages/Auth/Login";
import Register from "./Pages/Auth/Register";
import {createBrowserHistory} from "history";
import {auth} from "./firebase";
import './App.css';
import Admin from "./Pages/Admin/Admin";

const hist = createBrowserHistory();
export default function App() {

    return (
        <Router history={hist}>
            <div className={'app'}>
                <Switch>
                    <Route path="/admin" render={(props) => <Admin {...props}/>}/>
                    <Route path="/login" render={(props) => <Login {...props}/>}/>
                    <Route path="/register" render={(props) => <Register {...props}/>}/>
                    <Redirect to={'/admin'}/>
                </Switch>
            </div>
        </Router>
    );
}

function Home() {
    return <h2>Home</h2>;
}

function About() {
    return <h2>About</h2>;
}

function Topics() {
    let match = useRouteMatch();

    return (
        <div>
            <h2>Topics</h2>

            <ul>
                <li>
                    <Link to={`${match.url}/components`}>Components</Link>
                </li>
                <li>
                    <Link to={`${match.url}/props-v-state`}>
                        Props v. State
                    </Link>
                </li>
            </ul>

            {/* The Topics page has its own <Switch> with more routes
          that build on the /topics URL path. You can think of the
          2nd <Route> here as an "index" page for all topics, or
          the page that is shown when no topic is selected */}
            <Switch>
                <Route path={`${match.path}/:topicId`}>
                    <Topic />
                </Route>
                <Route path={match.path}>
                    <h3>Please select a topic.</h3>
                </Route>
            </Switch>
        </div>
    );
}

function Topic() {
    let { topicId } = useParams();
    return <h3>Requested topic ID: {topicId}</h3>;
}

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
import {auth, getUserDocument} from "./firebase";
import './App.css';
import AdminLayout from "./Pages/Admin/AdminLayout";

const hist = createBrowserHistory();
export default function App() {

    return (
        <Router history={hist}>
            <div className={'app'}>
                <Switch>
                    <Route path="/admin" render={(props) => <AdminLayout {...props}/>}/>
                    <Route path="/login" render={(props) => <Login {...props}/>}/>
                    <Route path="/register" render={(props) => <Register {...props}/>}/>
                    <Redirect to={'/admin'}/>
                </Switch>
            </div>
        </Router>
    );
}

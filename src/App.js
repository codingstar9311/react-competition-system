import React, {useEffect} from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
} from "react-router-dom";
import Login from "./Pages/Auth/Login";
import {createBrowserHistory} from "history";
import './App.css';
import AdminLayout from "./Pages/Admin/AdminLayout";
import UserLayout from "./Pages/Users/UserLayout";

const hist = createBrowserHistory();
export default function App() {

    return (
        <Router history={hist}>
            <div className={'app'}>
                <Switch>
                    <Route path="/admin" render={(props) => <AdminLayout {...props}/>}/>
                    <Route path="/login" render={(props) => <Login {...props}/>}/>
                    <Route path="/user" render={(props) => <UserLayout {...props}/>}/>
                    <Redirect to={'/login'}/>
                </Switch>
            </div>
        </Router>
    );
}

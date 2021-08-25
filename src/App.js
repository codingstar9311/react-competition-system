import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
} from "react-router-dom";
import Login from "./Pages/Auth/Login";
import {useHistory} from 'react-router-dom';
import './App.css';
import AdminLayout from "./Pages/Admin/AdminLayout";
import UserLayout from "./Pages/Users/UserLayout";
export default function App() {
    const hist = useHistory();

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

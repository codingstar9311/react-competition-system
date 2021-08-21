import React, {useEffect} from 'react';
import Sidebar from '../../Components/Admin/Sidebar';
import {Route, Switch} from 'react-router-dom';
import Dashboard from "./Dashboard";
import Users from "./Users";
import {auth, getUserDocument} from "../../firebase";
import Problems from "./Problems";
import Competitions from "./Competitions";
import CompetitionResults from "./CompetitionResults";

const AdminLayout = (props) => {

    useEffect(() => {
        let userInfo = localStorage.getItem('user_info');

        if (userInfo == null) {
            props.history.push('/login');
        } else {
            let curUser = JSON.parse(userInfo);
            if (curUser && curUser.type === 'admin') {
                props.history.push('/admin/competitions');
            } else {
                props.history.push('/user/dashboard');
            }
        }
    }, []);
    return (
        <>
            <Sidebar history={props.history}/>
            <div className='container-fluid py-1 overflow-auto'>
                <Switch>
                    <Route path={'/admin/dashboard'} component={Dashboard}/>
                    <Route path={'/admin/users'} component={Users}/>
                    <Route path={'/admin/problems'} component={Problems}/>
                    <Route path={'/admin/competitions'} component={Competitions}/>
                    <Route path={'/admin/competition-results'} component={CompetitionResults}/>
                </Switch>
            </div>
        </>
    )
};

export default AdminLayout;

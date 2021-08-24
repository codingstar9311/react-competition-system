import React, {useEffect, useState} from 'react';
import Sidebar from '../../Components/Admin/Sidebar';
import {Route, Switch} from 'react-router-dom';
import Dashboard from "./Dashboard";
import Users from "./Users";
import {auth, getUserDocument} from "../../firebase";
import Problems from "./Problems";
import Competitions from "./Competitions";
import CompetitionResults from "./CompetitionResults";
import LoadingOverlay from 'react-loading-overlay';
import Competition from "../Users/Competition";
const AdminLayout = (props) => {

    const [fullLoading, setFullLoading] = useState(false);

    useEffect(() => {
        let userInfo = localStorage.getItem('user_info');

        if (userInfo == null) {
            props.history.push('/login');
        } else {
            let curUser = JSON.parse(userInfo);
            if (curUser.type === 'admin') {
                console.log('here------');
            } else if (curUser.type === 'user') {
                props.history.push('/user/dashboard');
            } else {
                localStorage.removeItem('user_info');
                props.history.push('/login');
            }
        }
    }, []);
    return (
        <>
            <Sidebar history={props.history}/>
            <LoadingOverlay active={fullLoading} className='full-loading' spinner text='loading'>
                <div className='container-fluid py-1 overflow-auto'>
                    <Switch>
                        <Route path={'/admin/dashboard'} render={(props) => <Dashboard {...props} onLoading={(val) => {setFullLoading(val)}}/>}/>
                        <Route path={'/admin/users'} render={(props) => <Users {...props} onLoading={(val) => {setFullLoading(val)}}/>}/>
                        <Route path={'/admin/problems'} render={(props) => <Problems {...props} onLoading={(val) => {setFullLoading(val)}}/>}/>
                        <Route path={'/admin/competitions'} render={(props) => <Competitions {...props} onLoading={(val) => {setFullLoading(val)}}/>}/>
                        <Route path={'/admin/competition-results'} render={(props) => <CompetitionResults {...props} onLoading={(val) => {setFullLoading(val)}}/>}/>
                    </Switch>
                </div>
            </LoadingOverlay>
        </>
    )
};

export default AdminLayout;

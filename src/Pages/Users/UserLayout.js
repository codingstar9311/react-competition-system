import React, {useEffect} from 'react';
import {Route, Switch} from 'react-router-dom';
import Dashboard from "./Dashboard";
import Competition from "./Competition";

const UserLayout = (props) => {

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
            <div className='container-fluid py-1 overflow-auto'>
                <Switch>
                    <Route path={'/user/dashboard'} component={Dashboard}/>
                    <Route path={'/user/competition'} component={Competition}/>
                </Switch>
            </div>
        </>
    )
};

export default UserLayout;

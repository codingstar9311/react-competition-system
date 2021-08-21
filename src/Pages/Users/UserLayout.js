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
            if (curUser.type === 'admin') {
                props.history.push('/admin/dashboard');
            } else if (curUser.type === 'user') {
                console.log('here--------');
            } else {
                localStorage.removeItem('user_info');
                props.history.push('/login');
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

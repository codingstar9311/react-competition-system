import React, {useEffect, useState} from 'react';
import {Route, Switch} from 'react-router-dom';
import Dashboard from "./Dashboard";
import Competition from "./Competition";
import Submitted from "./Submitted";

const UserLayout = (props) => {

    const [user, setUser] = useState(null);

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
                setUser(curUser);
            } else {
                localStorage.removeItem('user_info');
                props.history.push('/login');
            }
        }

    }, []);
    return (
        <div className='container-lg py-1'>
            <Switch>
                <Route path={'/user/dashboard'} render={(props) => <Dashboard {...props} user={user}/>}/>
                <Route path={'/user/competition'} render={(props) => <Competition {...props} user={user}/>}/>
                <Route path={'/user/submitted'} render={(props) => <Submitted {...props} user={user}/>}/>
            </Switch>
        </div>
    )
};

export default UserLayout;

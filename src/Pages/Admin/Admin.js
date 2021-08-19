import React, {useEffect, useState} from 'react';
import {Menu, MenuItem, ProSidebar, SubMenu, SidebarHeader,SidebarContent} from "react-pro-sidebar";
import {HearingTwoTone} from "@material-ui/icons";
import Sidebar from '../../Components/Admin/Sidebar';
import {Router, Route, Switch} from 'react-router-dom';
import Dashboard from "./Dashboard";
import Users from "./Users";
import {auth, getUserDocument} from "../../firebase";
import Problems from "./Problems";
import Competitions from "./Competitions";

const Admin = (props) => {

    useEffect(() => {
        auth.onAuthStateChanged(async user => {
            if (user) {
                let curUser = await getUserDocument(user.uid);
                if (curUser.type == 'admin') {
                    props.history.push('/admin/users');
                } else {
                    props.history.push('/user/dashboard');
                }
            } else {
                props.history.push('/login');
            }
        });
    }, [auth]);
    return (
        <>
            <Sidebar/>
            <div className='container-fluid py-1'>
                <Switch>
                    <Route path={'/admin/dashboard'} component={Dashboard}/>
                    <Route path={'/admin/users'} component={Users}/>
                    <Route path={'/admin/problems'} component={Problems}/>
                    <Route path={'/admin/competitions'} component={Competitions}/>
                </Switch>
            </div>
        </>
    )
};

export default Admin;

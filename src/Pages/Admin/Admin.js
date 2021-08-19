import React, {useEffect, useState} from 'react';
import {Menu, MenuItem, ProSidebar, SubMenu, SidebarHeader,SidebarContent} from "react-pro-sidebar";
import {HearingTwoTone} from "@material-ui/icons";
import Sidebar from '../../Components/Admin/Sidebar';
import {Router, Route, Switch} from 'react-router-dom';
import Dashboard from "./Dashboard";
import Users from "./Users";
import {auth} from "../../firebase";
import Problems from "./Problems";
import Competitions from "./Competitions";

const Admin = (props) => {

    useEffect(() => {
        let curUser = localStorage.getItem('cur_user');
        if (curUser == null) {
            auth.onAuthStateChanged(user => {
                if (user) {
                    props.history.push('/admin/users');
                } else {
                    props.history.push('/login');
                }
            });
        }
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

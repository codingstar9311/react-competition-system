import React, { useContext, useEffect } from "react";
import {auth} from "../../firebase";
import {ProSidebar, MenuItem, Menu, SubMenu, FaHear} from "react-pro-sidebar";
import 'react-pro-sidebar/dist/css/styles.css';
import Button from "@material-ui/core/Button";

const Dashboard = (props) => {
    const onLogout = () => {
        localStorage.removeItem('user_info');
        props.history.push('/login');
    };

    return (
        <div>
            <div className={'row py-2'}>
                <div className='col-12'>
                    <h2>User Dashboard</h2>
                    <Button onClick={() => {
                        onLogout()
                    }}>Logout</Button>
                </div>
            </div>
        </div>
    )
};
export default Dashboard;

import React, { useContext, useEffect } from "react";
import {auth} from "../../firebase";
import {ProSidebar, MenuItem, Menu, SubMenu, FaHear} from "react-pro-sidebar";
import 'react-pro-sidebar/dist/css/styles.css';
import Button from "@material-ui/core/Button";
import {ExitToApp} from "@material-ui/icons";

const Dashboard = (props) => {
    const onLogout = () => {
        localStorage.removeItem('user_info');
        props.history.push('/login');
    };

    useEffect(() => {
    }, []);

    return (
        <div>
            <div className={'row py-2'}>
                <div className='col-10'>
                    <h2>User Dashboard</h2>
                </div>
                <div className='col-2 text-right'>
                    <Button variant="text" color="secondary" onClick={() => {
                        onLogout()
                    }}>Logout<ExitToApp></ExitToApp></Button>
                </div>
            </div>
            {
                props.user && props.user.status == false ?
                    <div className='row py-2'>
                        <div className='col-12'>
                            <h2>You was registered but not available now.</h2>
                            <h2>Please wait until admin allow...</h2>
                        </div>
                    </div>
                    : null
            }

        {/*    get scored table */}

        {/*    get waiting table */}

        {/*    get waiting table */}
        </div>
    )
};
export default Dashboard;

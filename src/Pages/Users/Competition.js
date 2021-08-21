import React, { useContext, useEffect } from "react";
import {auth} from "../../firebase";
import {ProSidebar, MenuItem, Menu, SubMenu, FaHear} from "react-pro-sidebar";
import 'react-pro-sidebar/dist/css/styles.css';

const Competition = (props) => {

    return (
        <div>
            <div className={'row py-2'}>
                <div className='col-12'>
                    <h2>User Dashboard</h2>
                </div>
            </div>
        </div>
    )
};
export default Competition;

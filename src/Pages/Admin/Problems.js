import React, { useContext, useEffect } from "react";
import { UserContext } from "../../Components/UserProvider";
import {auth} from "../../firebase";
import {ProSidebar, MenuItem, Menu, SubMenu, FaHear} from "react-pro-sidebar";
import 'react-pro-sidebar/dist/css/styles.css';

import {HearingTwoTone} from '@material-ui/icons';
const Problems = (props) => {

    const user = useContext(UserContext);
    const {displayName, email} = user;
    return (
        <div>Problems</div>
    )
};
export default Problems;

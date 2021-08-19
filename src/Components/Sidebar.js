import React, {useState} from 'react';
import {Menu, MenuItem, ProSidebar, SidebarContent, SidebarHeader, SidebarFooter} from "react-pro-sidebar";
import {Link} from "react-router-dom";
import {Dashboard, People, Menu as MenuIcon, ExitToApp, Close, ContactSupport, Business} from "@material-ui/icons";
import 'react-pro-sidebar/dist/css/styles.css';
import Login from "../Pages/Auth/Login";
import {auth} from "../firebase";

const Sidebar = (props) => {
    const [collapsed, setCollapsed] = useState(false);
    return (
        <ProSidebar collapsed={collapsed}>
            <SidebarHeader style={{textAlign: 'right'}}>
                <Menu>
                    <MenuItem icon={collapsed ? <MenuIcon fontSize={"large"} /> : <Close fontSize={'large'}/> } onClick={() => setCollapsed(!collapsed)}></MenuItem>
                </Menu>
            </SidebarHeader>
            <SidebarContent>
                <Menu iconShape='square'>
                    <MenuItem icon={<Dashboard />}>Dashboard <Link to={'/admin/dashboard'}/></MenuItem>
                    <MenuItem icon={<People />}>Users <Link to={'/admin/users'}/></MenuItem>
                    <MenuItem icon={<ContactSupport />}>Problems <Link to={'/admin/problems'}/></MenuItem>
                    <MenuItem icon={<Business />}>Competion Infomations <Link to={'/admin/competitions'}/></MenuItem>
                </Menu>
            </SidebarContent>
            <SidebarFooter>
                <Menu>
                    <MenuItem icon={<ExitToApp/>} onClick={() => auth.signOut()}>Logout</MenuItem>
                </Menu>
            </SidebarFooter>
        </ProSidebar>
    )
};

export default Sidebar;

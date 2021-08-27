import React, {useState} from 'react';
import {Menu, MenuItem, ProSidebar, SidebarContent, SidebarHeader, SidebarFooter} from "react-pro-sidebar";
import {Link} from "react-router-dom";
import {Dashboard, People, Menu as MenuIcon, ExitToApp, Close, ContactSupport, Business} from "@material-ui/icons/index";
import 'react-pro-sidebar/dist/css/styles.css';
import {BusinessCenter} from "@material-ui/icons";

const Sidebar = (props) => {
    const [collapsed, setCollapsed] = useState(false);

    const onLogout = () => {
        localStorage.removeItem('user_info');

        props.history.push('/login');
    };
    return (
        <ProSidebar collapsed={collapsed}>
            <SidebarHeader style={{textAlign: 'right'}}>
                <Menu>
                    <MenuItem icon={collapsed ? <MenuIcon fontSize={"large"} /> : <Close fontSize={'large'}/> } onClick={() => setCollapsed(!collapsed)}></MenuItem>
                </Menu>
            </SidebarHeader>
            <SidebarContent>
                <Menu iconShape='square'>
                    {/*<MenuItem icon={<Dashboard />}>Dashboard <Link to={'/admin/dashboard'}/></MenuItem>*/}
                    <MenuItem icon={<People />}>Users <Link to={'/admin/users'}/></MenuItem>
                    <MenuItem icon={<ContactSupport />}>Problems <Link to={'/admin/problems'}/></MenuItem>
                    <MenuItem icon={<Business />}>Competition Informations <Link to={'/admin/competitions'}/></MenuItem>
                    <MenuItem icon={<BusinessCenter />}>Competions Results <Link to={'/admin/competition-results'}/></MenuItem>
                </Menu>
            </SidebarContent>
            <SidebarFooter>
                <Menu>
                    <MenuItem icon={<ExitToApp/>} onClick={() => onLogout()}>Logout</MenuItem>
                </Menu>
            </SidebarFooter>
        </ProSidebar>
    )
};

export default Sidebar;

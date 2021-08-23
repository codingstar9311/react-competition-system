import React, {useEffect, useState} from "react";
import {firestore} from "../../firebase";
import 'react-pro-sidebar/dist/css/styles.css';
import Button from "@material-ui/core/Button";
import {toast, ToastContainer} from "react-toastify";
import {
    makeStyles,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow
} from "@material-ui/core";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import BtnGrade from "../../Components/Common/BtnGrade";
import BtnCompetitionName from "../../Components/Common/BtnCompetitionName";
import {getComparator, stableSort} from "../../Utils/CommonFunctions";
import BtnDialogConfirm from "../../Components/Common/BtnDialogConfirm";
import {
    COLOR_CANCEL_BUTTON,
    COLOR_DLG_BORDER_BLACK,
    COLOR_DLG_BORDER_BLUE,
    COLOR_DLG_TITLE
} from "../../Utils/ColorConstants";
import {ExitToApp} from "@material-ui/icons";
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import Dialog from "@material-ui/core/Dialog/Dialog";
import Paper from "@material-ui/core/Paper";
import logo from "../../Assets/Images/logo.png";
import BtnConfirm from "../../Components/User/BtnConfirm";

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    container: {
        height: 'calc(100% - 10px)',
    },
    dlgBlueBorder: {
        border: 'solid 2px',
        borderRadius: '50px',
        borderColor: COLOR_DLG_BORDER_BLUE,
        paddingBottom: '40px',
        marginBottom: '14%'
    },
    button: {
        color: '#fff',
        padding: '15px 15px',
        fontSize: '1.5em',
        borderRadius: '30px'
    }
}));

const Submitted = (props) => {

    const classes = useStyles();

    useEffect(() => {
        if (props.user) {
        }
    }, [props.user]);

    const onLogout = () => {
        localStorage.removeItem('user_info');
        props.history.push('/login');
    };

    const onGotoDashboard = () => {
        props.history.push('/user/dashboard');
    };

    return (
        <div>
            <div className={'row py-2'}>
                <div className='col-12 text-right'>
                    <Button type='button' variant="text" color="secondary" onClick={() => {
                        onLogout()
                    }}>Logout<ExitToApp></ExitToApp></Button>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-6 col-md-4 col-lg-3 px-0">
                    <div className="logo-wrapper">
                        <img src={logo} alt={""} style={{width: '100%'}}/>
                    </div>
                </div>
            </div>
            <div className='row' style={{paddingTop: '30px'}}>
                <div className="col-12">
                    <h1 style={{color: COLOR_DLG_BORDER_BLUE}}>Test has been submitted</h1>
                </div>
            </div>
            <div className='row' style={{paddingTop: '20px'}}>
                <div className="col-12">
                    <h3 >Results will be released at a later date</h3>
                </div>
            </div>
            <div className='row' style={{paddingTop: '30px'}}>
                <div className="col-12">
                    <Button className={classes.button} style={{backgroundColor: COLOR_DLG_BORDER_BLUE}} variant='contained' onClick={onGotoDashboard}>Return to Dashboard</Button>
                </div>
            </div>
        </div>
    )
};
export default Submitted;

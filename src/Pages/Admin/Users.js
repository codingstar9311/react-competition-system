import React, {useContext, useEffect, useState} from "react";
import 'react-pro-sidebar/dist/css/styles.css';

import AdminTitle from "../../Components/Admin/AdminTitle";
import {TableContainer, Table, TableHead, TableBody, TableRow, makeStyles,
    TableCell, TablePagination, Button, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, TextField
} from "@material-ui/core";
import Alert from '@material-ui/lab/Alert';
import {AddCircle as AddIcon} from "@material-ui/icons";
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {admin, adminCreateUser, auth, generateUserDocument} from "../../firebase";

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    container: {
        maxHeight: '100%',
    }

}));

const Users = (props) => {

    const columns = [
        { id: 'full_name', label: 'Name', minWidth: 170 },
        { id: '', label: 'Name', minWidth: 170 },
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'name', label: 'Name', minWidth: 170 },
    ];

    const [rows, setRows] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [fullName, setFullName] = useState('');
    const [grade, setGrade] = useState(0);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [loading, setLoading] = useState(false);

    const classes = useStyles();
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const onToggleDialog = () => {
        setOpenDialog(!openDialog);
    };

    const onAddUser = (event) => {
        event.preventDefault();

        setLoading(true);

        admin.auth().createUserWithEmailAndPassword(email, password)
            .then(async (result) => {
                let userInfo = {
                    fullName,
                    password,
                    grade,
                    email,
                    uid: result.user.uid
                };
                let newUser = await adminCreateUser(userInfo.uid, userInfo);
                if (newUser) {
                    toast.success('Successfully added!');
                }
            })
            .catch(error => {
                setErrorMessage(error.message);
                console.log('catch');
            })
            .finally(() => {
                setLoading(false);
            })
    };

    const dialog = (<Dialog open={openDialog}
                            fullWidth={true}
                            maxWidth={'md'}
                            onClose={(event, reason) => {
                                if (reason == 'backdropClick' || reason == 'escapeKeyDown') {
                                    return;
                                }
                                onToggleDialog()
                            }}
                            aria-labelledby="form-dialog-title">
        <form onSubmit={onAddUser} autoComplete="off">
            <DialogTitle className='text-center'>Add New User</DialogTitle>
            <DialogContent>
                <div className='row py-2 align-items-center justify-content-center'>
                    <div className='col-5 px-2'>
                        <TextField
                            autoFocus
                            label="Full Name"
                            type="full_name"
                            onChange={(e) => setFullName(e.target.value)}
                            fullWidth
                            required
                        />
                    </div>
                    <div className='col-5 px-2 text-center'>
                        <TextField
                            autoFocus
                            label="Grade"
                            type="number"
                            onChange={(e) => setGrade(e.target.value)}
                            fullWidth
                            required
                        />
                    </div>
                </div>
                <div className='row py-2 align-items-center justify-content-center'>
                    <div className='col-5 px-2'>
                        <TextField
                            autoFocus
                            label="Email Address"
                            autoComplete="false"
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            fullWidth={true}
                            required
                        />
                    </div>
                    <div className='col-5 px-2 text-center'>
                        <TextField
                            autoFocus
                            label="Password"
                            type="password"
                            onChange={(e) => setPassword(e.target.value)}
                            min={0}
                            fullWidth
                            required
                        />
                    </div>
                </div>
                <div className='row justify-content-center'>
                    <div className='col-10'>
                        {
                            errorMessage != '' ?
                                <Alert severity='error' onClose={() => setErrorMessage('')}>{errorMessage}</Alert>
                                : ''
                        }
                    </div>
                </div>
            </DialogContent>
            <DialogActions className='justify-content-center py-3'>
                <Button onClick={onToggleDialog} style={{minWidth: '100px'}} size='large' variant='contained' color="secondary">
                    Cancel
                </Button>
                <Button type='submit' size='large' style={{minWidth: '100px'}}  variant='contained'  color="primary">
                    Save
                </Button>
            </DialogActions>
        </form>
    </Dialog>);

    return (
        <>
            {
                <ToastContainer position='top-center' traggle/>
            }
            {
                dialog
            }
            <div className='row justify-content-center align-items-center py-2'>
                <div className='col-lg-5 col-sm-12'>
                    <h2 className='my-0'>User List</h2>
                </div>
                <div className='col-lg-5 col-sm-12 text-right'>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 100]}
                        component="div"
                        count={rows.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </div>
                <div className='col-lg-2 col-sm-12 text-center'>
                    <Button variant='contained' onClick={() => onToggleDialog()} startIcon={<AddIcon/>} color='primary' className='float-right'>Add</Button>
                </div>
            </div>
            <div className='row'>
                <div className='col-12'>
                    <TableContainer className={classes.container}>
                        <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                                <TableRow>
                                    {columns.map((column, key) => (
                                        <TableCell
                                            key={key}
                                            align={column.align}
                                            style={{ minWidth: column.minWidth }}
                                        >
                                            {column.label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                                    return (
                                        <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                                            {columns.map((column, key) => {
                                                const value = row[column.id];
                                                return (
                                                    <TableCell key={`body_${key}`} align={column.align}>
                                                        {column.format && typeof value === 'number' ? column.format(value) : value}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>

                </div>
            </div>

        </>
    )
};
export default Users;

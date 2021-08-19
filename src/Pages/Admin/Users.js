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
    const [error, setError] = useState('ddd');

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
    };

    const dialog = (
        <Dialog open={openDialog}
                fullWidth={'md'}
                disableBackdropClick={true}
                maxWidth={'md'}
                onClose={() => onToggleDialog()}
                aria-labelledby="form-dialog-title">
            <form onSubmit={onAddUser}>
                <DialogTitle className='text-center'>Add New User</DialogTitle>
                <DialogContent>
                    <div className='row py-2 align-items-center justify-content-center'>
                        <div className='col-5 px-2'>
                            <TextField
                                autoFocus
                                label="Full Name"
                                type="full_name"
                                fullWidth
                                required
                            />
                        </div>
                        <div className='col-5 px-2 text-center'>
                            <TextField
                                autoFocus
                                label="Grade"
                                type="number"
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
                                min={0}
                                fullWidth
                                required
                            />
                        </div>
                    </div>
                    <div className='row justify-content-center'>
                        <div className='col-10'>
                            {
                                error != '' ?
                                <Alert severity='error' onClose={() => setError('')}>{error}</Alert>
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
        </Dialog>
    );

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

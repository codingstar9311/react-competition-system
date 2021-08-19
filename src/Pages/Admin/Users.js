import React, {useContext, useEffect, useState} from "react";
import 'react-pro-sidebar/dist/css/styles.css';

import AdminTitle from "../../Components/Admin/AdminTitle";
import {TableContainer, Table, TableHead, TableBody, TableRow, makeStyles,
    TableCell, TablePagination, Button
} from "@material-ui/core";

import {AddCircle as AddIcon} from "@material-ui/icons";

const useStyles = makeStyles({
    root: {
        width: '100%',
    },
    container: {
        maxHeight: '100%',
    },
});

const Users = (props) => {

    const columns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'name', label: 'Name', minWidth: 170 },
    ];

    const [rows, setRows] = useState([]);

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

    return (
        <>
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
                    <Button variant='contained' startIcon={<AddIcon/>} color='secondary' className='float-right'>Add</Button>
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

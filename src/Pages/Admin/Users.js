import React, {useEffect, useState} from "react";
import 'react-pro-sidebar/dist/css/styles.css';

import {TableContainer, Table, TableHead, TableBody, TableRow, makeStyles,
    TableCell, TablePagination, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from "@material-ui/core";
import Alert from '@material-ui/lab/Alert';
import {AddCircle as AddIcon, Visibility, VisibilityOff} from "@material-ui/icons";
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {firestore} from "../../firebase";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import IconButton from "@material-ui/core/IconButton";
import {Delete as DeleteIcon, Edit as EditIcon, Search as SearchIcon} from "@material-ui/icons";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import InputAdornment from "@material-ui/core/InputAdornment";
import Input from "@material-ui/core/Input";
import DlgDeleteConfirm from "../../Components/Admin/DlgDeleteConfirm";
import GradeButton from "../../Components/Admin/GradeButton";
import DialogButton from "../../Components/Common/DialogButton";
import {
    COLOR_ADMIN_MAIN,
    COLOR_CANCEL_BUTTON,
    COLOR_DLG_BORDER_BLUE,
    COLOR_DLG_TITLE
} from "../../Utils/ColorConstants";

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
        borderColor: COLOR_DLG_BORDER_BLUE
    },

}));

const Users = (props) => {

    const columns = [
        { id: 'no', label: 'No', width: 60 },
        { id: 'fullName', label: 'Name', minWidth: 170 },
        { id: 'email', label: 'Email', minWidth: 170 },
        { id: 'password', label: 'Password', minWidth: 170 },
        { id: 'grade', label: 'Grade', minWidth: 170 },
        { id: 'action', label: 'Action', maxWidth: 60 },
    ];

    const [maxHeight, setMaxHeight] = useState('none');

    window.onresize = function () {

        let adminHeader = document.getElementById('admin-header').offsetHeight;
        let tempHeight = window.innerHeight - adminHeader - 10;

        setMaxHeight(`${tempHeight}px`);
    };

    const [rows, setRows] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [errorMessage, setErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // table setting
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('desc');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    // //////

    const [searchText, setSearchText] = useState('');
    const [modalTitle, setModalTitle] = useState('Add New User');
    const [selectedId, setSelectedId] = useState('');
    const [fullName, setFullName] = useState('');
    const [grade, setGrade] = useState(0);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [loading, setLoading] = useState(false);

    const classes = useStyles();


    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const onLoadUsers = (searchVal = '') => {
        firestore.collection('users').orderBy('fullName', 'asc')
            .get()
            .then(usersRef => {
                let tempUsers = [];
                let no = 1;
                usersRef.docs.forEach(item => {
                    if (item.exists) {
                        let data = item.data();
                        let {fullName, email, grade} = data;
                        grade = grade.toString();
                        if (data.deleted != true && data.type != 'admin') {
                            if (searchVal != '') {
                                if (fullName.includes(searchVal) || email.includes(searchVal) || grade.includes(searchVal)) {
                                    tempUsers.push({
                                        no,
                                        id: item.id,
                                        ...data
                                    });

                                    no ++;
                                }
                            } else {
                                tempUsers.push({
                                    no,
                                    id: item.id,
                                    ...data
                                });
                                no++;
                            }
                        }
                    }
                });

                setRows([...tempUsers]);
                setPage(0);

            })
            .catch(error => {
                toast.error(error.message);
            });
    };

    useEffect(() => {
        setMaxHeight(`${(window.innerHeight - document.getElementById('admin-header').offsetHeight - 10)}px`);
        onLoadUsers();
    }, []);

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const onToggleDialog = () => {
        setOpenDialog(!openDialog);
    };

    const onSaveUser = async (event) => {
        event.preventDefault();

        setLoading(true);

        let userInfo = {
            fullName,
            email,
            password,
            grade,
        };

        let results = await firestore.collection('users')
            .where('email', "==", email)
            .get();

        if (selectedId == '') {
            if (results.docs && results.docs.length > 0) {
                setErrorMessage('Current email already exists!');
                setLoading(false);
                return;
            }
            firestore.collection('users')
                .add(userInfo)
                .then(docRef => {
                    toast.success('Successfully Added!');
                    onLoadUsers();
                    onToggleDialog();
                })
                .catch(error => {
                    setErrorMessage(error);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            firestore.collection('users')
                .doc(selectedId)
                .set({
                    ...userInfo
                })
                .then(docRef => {
                    toast.success('Successfully Updated!');
                    let curRows = rows;
                    curRows = curRows.map((item, index) => {
                        if (item.id == selectedId) {
                            item = {id: selectedId, no: (index + 1), ...userInfo};
                        }

                        return item;
                    });

                    setRows([...curRows]);
                    onToggleDialog();
                })
                .catch(error => {
                    setErrorMessage(error);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    };

    const onEditUser = (row) => {
        setSelectedId(row.id);

        setFullName(row.fullName);
        setEmail(row.email);
        setPassword(row.password);
        setGrade(row.grade);

        setModalTitle('Update Current User');

        onToggleDialog();
    };

    const onAddUser = () => {
        setSelectedId('');
        setFullName('');
        setEmail('');
        setPassword('');
        setGrade('6');

        setModalTitle('Add New User');
        onToggleDialog();
    };

    const onDeleteUser = async (user_id) => {

        setDeleteLoading(true);
        firestore.collection('users').doc(user_id).set({
            deleted: true
        }, {merge: true})
            .then(() => {
                toast.success('Successfully deleted!');
                let curRows = rows;
                curRows = curRows.filter(item => {
                    if (item.id == selectedId) {
                        return false;
                    }
                    return true;
                });

                setRows([...curRows]);
            }).catch(error => {
                toast.error(error.message);
            }).finally(() => {
                setDeleteLoading(false);
                setOpenDeleteDialog(false);
            });
    };

    const descendingComparator = (a, b, orderBy) => {
        if (b[orderBy] < a[orderBy]) {
            return -1;
        }
        if (b[orderBy] > a[orderBy]) {
            return 1;
        }
        return 0;
    };

    const getComparator = (order, orderBy) => {
        return order === 'desc'
            ? (a, b) => descendingComparator(a, b, orderBy)
            : (a, b) => -descendingComparator(a, b, orderBy);
    };

    const stableSort = (array, comparator) => {
        const stabilizedThis = array.map((el, index) => [el, index]);
        stabilizedThis.sort((a, b) => {
            const order = comparator(a[0], b[0]);
            if (order !== 0) return order;
            return a[1] - b[1];
        });
        return stabilizedThis.map((el) => el[0]);
    };

    const dialog = (<Dialog open={openDialog}
                            fullWidth={true}
                            maxWidth={'md'}
                            classes={{
                                paper: classes.dlgBlueBorder
                            }}
                            onClose={(event, reason) => {
                                if (reason == 'backdropClick' || reason == 'escapeKeyDown') {
                                    return;
                                }
                                onToggleDialog()
                            }}
                            aria-labelledby="form-dialog-title">
        <form onSubmit={onSaveUser} autoComplete="off">
            <DialogTitle className='text-center' style={{color: COLOR_DLG_TITLE}}>{modalTitle}</DialogTitle>
            <DialogContent>
                <div className='row py-2 align-items-center justify-content-center'>
                    <div className='col-lg-5 col-sm-10 px-2'>
                        <TextField
                            autoFocus
                            label="Full Name"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            fullWidth
                            required
                        />
                    </div>
                    <div className='col-lg-5 col-sm-10 px-2 text-center'>
                        <div className='row align-items-center'>
                            <div className='col-lg-3 col-sm-12 text-left'>
                                Grade
                            </div>
                            <div className='col-lg-9 col-sm-12' style={{display: "flex"}}>
                                {
                                    [6, 7, 8, 9, 10].map((val, key) => {
                                        return (
                                            <div className='px-2' key={key}>
                                                <GradeButton number={val} onClick={() => setGrade(val)} selected={val == grade ? true : false}/>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div className='row py-2 align-items-center justify-content-center'>
                    <div className='col-lg-5 col-sm-10 px-2'>
                        <TextField
                            autoFocus
                            label="Email Address"
                            autoComplete="false"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            fullWidth={true}
                            required
                        />
                    </div>
                    <div className='col-lg-5 col-sm-10 px-2 text-center'>
                        <FormControl fullWidth>
                            <InputLabel htmlFor="filled-adornment-password">Password</InputLabel>
                            <Input
                                id="standard-adornment-password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                            />
                        </FormControl>
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
                <DialogButton disabled={loading} backgroundColor={COLOR_CANCEL_BUTTON} width={'100px'} type='button' onClick={onToggleDialog} title={'Cancel'}/>
                <DialogButton disabled={loading} type='submit' width={'100px'} title={selectedId != '' ? 'Update' : 'Add'}/>
            </DialogActions>
        </form>
    </Dialog>);

    return (
        <div>
            <ToastContainer
                position='top-center'
                autoClose={2000}
                traggle/>
            {
                dialog
            }
            <DlgDeleteConfirm title="Do you really want to delete?" open={openDeleteDialog} loading={deleteLoading} onNo={() => {setOpenDeleteDialog(false)}} onYes={() => onDeleteUser(selectedId)}/>
            <div className='row justify-content-center align-items-center py-2' id='admin-header'>
                <div className='col-lg-4 col-sm-12'>
                    <h2 className='my-0'>User List</h2>
                </div>
                <div className='col-lg-4 col-sm-12 text-right'>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 100]}
                        component="div"
                        count={rows == null ? 0 : rows.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </div>
                <div className='col-lg-4 col-sm-12 text-center align-items-center justify-content-end' style={{display: 'flex'}}>
                    <FormControl>
                        <InputLabel htmlFor="filled-adornment-password">Search</InputLabel>
                        <Input
                            type={'text'}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onKeyUp={e => {
                                if (e.key == 'Enter') {
                                    onLoadUsers(searchText);
                                }
                            }}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => {
                                            onLoadUsers(searchText)
                                        }}
                                        edge="end"
                                    >
                                        <SearchIcon/>
                                    </IconButton>
                                </InputAdornment>
                            }
                        />
                    </FormControl>
                    &nbsp; &nbsp;
                    <Button variant='contained' onClick={() => onAddUser()} startIcon={<AddIcon/>} style={{backgroundColor: COLOR_ADMIN_MAIN, color: '#fff'}} className='float-right'>Add</Button>
                </div>
            </div>
            <div className='row'>
                <div className='col-12'>
                    <TableContainer style={{maxHeight: maxHeight}}>
                        <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                                <TableRow>
                                    {columns.map((column, key) => (
                                        <TableCell
                                            key={`tablehead_${key}`}
                                            align={column.align}
                                            style={{ minWidth: column.minWidth}}
                                            className={column.id == 'action' ? 'text-right' : ''}
                                        >
                                            <TableSortLabel active={orderBy === column.id}
                                                            direction={orderBy == column.id ? order : 'asc'}
                                                            onClick={() => {
                                                                const isAsc = orderBy === column.id && order === 'asc';
                                                                setOrder(isAsc ? 'desc' : 'asc');
                                                                setOrderBy(column.id);
                                                            }}
                                            >
                                            {column.label}
                                            </TableSortLabel>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    rows != null && stableSort(rows, getComparator(order, orderBy))
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((row, key) => {
                                            return (
                                                <TableRow hover role="checkbox" tabIndex={-1} key={`tablerow_${key}`}>
                                                    {columns.map((column, subKey) => {
                                                        const value = row[column.id];
                                                        if (column.id == 'grade') {
                                                            return (
                                                                <TableCell key={`body_${subKey}`} align='center'>
                                                                    <GradeButton number={value} selected={true}/>
                                                                </TableCell>
                                                            )
                                                        } else if (column.id == 'action') {
                                                            return (
                                                                <TableCell key={`body_${subKey}`} className='text-right'>
                                                                    <IconButton color='primary' size='small' onClick={() => onEditUser(row)}>
                                                                        <EditIcon/>
                                                                    </IconButton>
                                                                    &nbsp;
                                                                    <IconButton color='secondary' size='small' onClick={() => {
                                                                        setSelectedId(row.id);
                                                                        setOpenDeleteDialog(true);
                                                                    }}>
                                                                        <DeleteIcon/>
                                                                    </IconButton>
                                                                </TableCell>
                                                                )
                                                        } else {
                                                            return (
                                                                <TableCell key={`body_${subKey}`} align={column.align}>
                                                                    {column.format && typeof value === 'number' ? column.format(value) : value}
                                                                </TableCell>
                                                            );
                                                        }
                                                    })}
                                                </TableRow>
                                            );
                                })}
                                {
                                    rows != null && rows.length < 1 ? (
                                        <TableRow>
                                            <TableCell colSpan={10} align="center">
                                                There is no data....
                                            </TableCell>
                                        </TableRow>
                                    ) : null
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            </div>
        </div>
    )
};
export default Users;

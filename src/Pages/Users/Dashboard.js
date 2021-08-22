import React, {useContext, useEffect, useState} from "react";
import {auth, firestore} from "../../firebase";
import {ProSidebar, MenuItem, Menu, SubMenu, FaHear} from "react-pro-sidebar";
import 'react-pro-sidebar/dist/css/styles.css';
import Button from "@material-ui/core/Button";
import {Delete as DeleteIcon, Edit as EditIcon, ExitToApp} from "@material-ui/icons";
import {toast, ToastContainer} from "react-toastify";
import {Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow} from "@material-ui/core";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import GradeButton from "../../Components/Admin/GradeButton";
import CompetitionButton from "../../Components/Admin/CompetitionButton";
import FormControlLabel from "@material-ui/core/FormControlLabel/FormControlLabel";
import Switch from "@material-ui/core/Switch/Switch";
import IconButton from "@material-ui/core/IconButton";
import {getComparator, stableSort} from "../../Utils/CommonFunctions";
import DialogButton from "../../Components/Common/DialogButton";

const Dashboard = (props) => {

    const [scoredList, setScoredList] = useState([]);
    const [waitingList, setWaitingList] = useState([]);
    const [availableCompList, setAvailableCompList] = useState([]);

    const [availableSetting, setAvailableSetting] = useState({
        page: 0,
        rowsPerPage: 10,
        order: 'asc',
        orderBy: 'desc'
    });

    const availableCompColumns = [
        { id: 'no', label: 'No', width: 60 },
        { id: 'grade', label: 'Grade', width: 80 },
        { id: 'competitionName', label: 'Competition Name', width: 100 },
        { id: 'limitTime', label: 'Limit Time(min)', width: 100 },
        { id: 'limitWarningCount', label: 'Limit Warning Count', width: 150 },
        { id: 'endDate', label: 'End Date', width: 140 },
        { id: 'dateTime', label: 'Created At', minWidth: 170 },
        { id: 'action', label: 'Action', width: 100}
    ];

    useEffect(() => {
        if (props.user) {
            let grade = props.user.grade;
            // get available list
            firestore.collection('competitions').where('grade', '==', grade)
                .get()
                .then(competitionRef => {
                    let tempAvailableCompetitions = [];

                    let no = 1;
                    competitionRef.docs.forEach(item => {
                        if (item.exists) {
                            let data = item.data();
                            if (data.status) {
                                tempAvailableCompetitions.push({
                                    no,
                                    id: item.id,
                                    ...data
                                })
                            }
                            no ++;
                        }
                    });

                    setAvailableCompList([...tempAvailableCompetitions]);
                })
                .catch(error => {
                    toast.error(error.message);
                });
        }
    }, [props.user]);

    const onStartCompetition = (row) => {
        toast.success('start competition' + row.id);
    };

    const onLogout = () => {
        localStorage.removeItem('user_info');
        props.history.push('/login');
    };

    return (
        <div>
            <ToastContainer
                position='top-center'
                autoClose={2000}
                traggle/>
            <div className={'row py-2'}>
                <div className='col-12 text-right'>
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
                    :
                    <div className='row py-2'>
                        <div className='col-12'>
                            <h2>Welcome <span style={{color: 'red'}}> {props.user ? props.user.fullName : ''}</span></h2>
                            <h2>Your grade is <span style={{color: 'red'}}> {props.user ? props.user.grade : ''}</span>.</h2>
                        </div>
                    </div>
            }

        {/*    get scored table */}

        {/*    get waiting table */}

        {/*    get available table */}
            {
                props.user && props.user.status ?
                    <div className='row py-1'>
                        <div className='col-lg-6 col-sm-12'>
                            <h3>Available Competitions</h3>
                        </div>
                        <div className='col-lg-6 col-sm-12 text-right'>
                            <TablePagination
                                rowsPerPageOptions={[10, 25, 100]}
                                component="div"
                                count={availableCompList.length}
                                rowsPerPage={availableSetting.rowsPerPage}
                                page={availableSetting.page}
                                onPageChange={(event, newPage) => {
                                    setAvailableSetting({
                                        ...availableSetting,
                                        page: newPage
                                    })
                                }}
                                onRowsPerPageChange={(event) => {
                                    setAvailableSetting({
                                        ...availableSetting,
                                        rowsPerPage: +event.target.value,
                                        page: 0
                                    });
                                }}
                            />
                        </div>
                    </div> : null
            }

            <div className='row'>
                <div className='col-12'>
                    <TableContainer style={{maxHeight: '400px', overflow: 'auto'}}>
                        <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                                <TableRow>
                                    {availableCompColumns.map((column, key) => (
                                        <TableCell
                                            key={key}
                                            align={column.align}
                                            style={{ maxWidth: column.maxWidth, width: column.width}}
                                            className={column.id == 'action' ? 'text-right' : ''}
                                        >
                                            <TableSortLabel active={availableSetting.orderBy === column.id}
                                                            direction={availableSetting.orderBy == column.id ? availableSetting.order : 'asc'}
                                                            onClick={() => {
                                                                const isAsc = availableSetting.orderBy === column.id && availableSetting.order === 'asc';
                                                                setAvailableSetting({
                                                                    ...availableSetting,
                                                                    order: isAsc ? 'desc' : 'asc',
                                                                    orderBy: column.id
                                                                });
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
                                    stableSort(availableCompList, getComparator(availableSetting.order, availableSetting.orderBy))
                                        .slice(availableSetting.page * availableSetting.rowsPerPage, availableSetting.page * availableSetting.rowsPerPage + availableSetting.rowsPerPage)
                                        .map((row, key) => {
                                            return (
                                                <TableRow hover role="checkbox" tabIndex={-1} key={key}>
                                                    {availableCompColumns.map((column, subKey) => {
                                                        const value = row[column.id];
                                                        if (column.id == 'grade') {
                                                            return (
                                                                <TableCell key={`body_${subKey}`} align='center'>
                                                                    <GradeButton number={value} selected={true}/>
                                                                </TableCell>
                                                            )
                                                        } else if (column.id == 'competitionName') {
                                                            return (
                                                                <TableCell key={`body_${subKey}`} align='center'>
                                                                    <CompetitionButton name={value} selected={true}/>
                                                                </TableCell>
                                                            )
                                                        } else if (column.id == 'selectedProblems') {
                                                            return (
                                                                <TableCell key={`body_${subKey}`}>
                                                                    {value.map(item => (item.problemName)).join(', ')}
                                                                </TableCell>
                                                            )
                                                        } else if (column.id == 'dateTime') {
                                                            return (
                                                                <TableCell key={`body_${subKey}`}>
                                                                    {new Date(value.seconds * 1000).toLocaleString()}
                                                                </TableCell>
                                                            )
                                                        } else if (column.id == 'action') {
                                                            return (
                                                                <TableCell key={`body_${subKey}`}>
                                                                    <DialogButton title='Start' onClick={() => onStartCompetition(row)}/>
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
                                    availableCompList != null && availableCompList.length < 1 ? (
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
export default Dashboard;

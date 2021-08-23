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
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import Dialog from "@material-ui/core/Dialog/Dialog";
import Paper from "@material-ui/core/Paper";

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

}));

const Dashboard = (props) => {

    const [scoredCompList, setScoredCompList] = useState([]);
    const [waitingCompList, setWaitingList] = useState([]);
    const [availableCompList, setAvailableCompList] = useState([]);

    const [showStartConfirmDlg, setShowStartConfirmDlg] = useState(false);
    const [selectedCompId, setSelectedCompId] = useState('');
    const [scoredSetting, setScoredSetting] = useState({
        page: 0,
        rowsPerPage: 10,
        order: 'dateTime',
        orderBy: 'desc'
    });

    const classes = useStyles();

    const scoredCompColumns = [
        { id: 'no', label: 'No', width: 60 },
        { id: 'grade', label: 'Grade', width: 80 },
        { id: 'competitionName', label: 'Competition Name', width: 100 },
        { id: 'limitTime', label: 'Limit Time(min)', width: 100 },
        { id: 'competitionTime', label: 'Competion Time', width: 100 },
        { id: 'warningCount', label: 'Warning Count', width: 150 },
        { id: 'dateTime', label: 'Competition Time', minWidth: 170 },
        { id: 'score', label: 'Score', minWidth: 170 },
        { id: 'action', label: 'Action', width: 100}
    ];

    const [waitingSetting, setWaitingSetting] = useState({
        page: 0,
        rowsPerPage: 10,
        order: 'dateTime',
        orderBy: 'desc'
    });

    const waitingCompColumns = [
        { id: 'no', label: 'No', width: 60 },
        { id: 'grade', label: 'Grade', width: 80 },
        { id: 'competitionName', label: 'Competition Name', width: 100 },
        { id: 'limitTime', label: 'Limit Time(min)', width: 100 },
        { id: 'competitionTime', label: 'Competion Time', width: 100 },
        { id: 'warningCount', label: 'Warning Count', width: 150 },
        { id: 'dateTime', label: 'Competition Time', minWidth: 170 },
        { id: 'score', label: 'Score', minWidth: 170 }
    ];

    const [availableSetting, setAvailableSetting] = useState({
        page: 0,
        rowsPerPage: 10,
        order: 'dateTime',
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

    const onShowStartCompetitionDlg = (row) => {
        setSelectedCompId(row.id);
        setShowStartConfirmDlg(true);
    };

    const onLogout = () => {
        localStorage.removeItem('user_info');
        props.history.push('/login', {});
    };

    const startConfirmDialog = (
        <Dialog
            fullWidth={true}
            maxWidth={"sm"}
            open={showStartConfirmDlg}
            classes={{
                paper: classes.dlgBlueBorder
            }}
            onClose={() => {
                setShowStartConfirmDlg(false);
            }}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title" className='text-center' style={{color: COLOR_DLG_TITLE}}>{props.title}</DialogTitle>
            <DialogContent>
                <h2 style={{color: COLOR_DLG_TITLE, fontWeight: 'bolder'}} className='text-center'>Warning</h2>
                <DialogContentText id="alert-dialog-description">
                    <div className='py-3'>
                        <h3 style={{fontWeight: 'bold', color: COLOR_DLG_BORDER_BLACK}} className='text-center'>
                            Do you really want to start?
                        </h3>
                        <h3 style={{fontWeight: 'bold', color: COLOR_DLG_BORDER_BLACK}} className='text-center'>
                            You cannot cancel while competition is running.
                        </h3>
                    </div>
                </DialogContentText>
            </DialogContent>
            <DialogActions className='justify-content-center'>
                <BtnDialogConfirm onClick={() => setShowStartConfirmDlg(false)} variant='contained' title='No' width='120px' disabled={props.loading} backgroundColor={COLOR_CANCEL_BUTTON}/>
                <BtnDialogConfirm disabled={selectedCompId == '' ? true : false} width='120px' onClick={() => {
                    props.history.push('/user/competition');
                }} variant='contained' title='Yes' disabled={props.loading}/>
            </DialogActions>
        </Dialog>
    );

    return (
        <div>
            <ToastContainer
                position='top-center'
                autoClose={2000}
                traggle/>
            {
                startConfirmDialog
            }
            <div className={'row py-2'}>
                <div className='col-12 text-right'>
                    <Button type='button' variant="text" color="secondary" onClick={() => {
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
            {
                props.user && props.user.status ?
                    <div className='row' style={{paddingTop: '40px'}}>
                        <div className='col-lg-12 col-sm-12 text-center'>
                            <h3 style={{color: COLOR_DLG_TITLE}}>Scored Competitions</h3>
                        </div>
                    </div> : null
            }
            {
                props.user && props.user.status ?
                    <div className='row'>
                        <div className='col-12'>
                            <TableContainer style={{maxHeight: '400px', overflow: 'auto'}} component={Paper}>
                                <Table stickyHeader aria-label="sticky table">
                                    <TableHead>
                                        <TableRow>
                                            {scoredCompColumns.map((column, key) => (
                                                <TableCell
                                                    key={key}
                                                    align={column.align}
                                                    style={{ maxWidth: column.maxWidth, width: column.width}}
                                                    className={column.id == 'action' ? 'text-right' : ''}
                                                >
                                                    <TableSortLabel active={scoredSetting.orderBy === column.id}
                                                                    direction={scoredSetting.orderBy == column.id ? scoredSetting.order : 'asc'}
                                                                    onClick={() => {
                                                                        const isAsc = scoredSetting.orderBy === column.id && scoredSetting.order === 'asc';
                                                                        setScoredSetting({
                                                                            ...scoredSetting,
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
                                            stableSort(scoredCompList, getComparator(scoredSetting.order, scoredSetting.orderBy))
                                                .slice(scoredSetting.page * scoredSetting.rowsPerPage, scoredSetting.page * scoredSetting.rowsPerPage + scoredSetting.rowsPerPage)
                                                .map((row, key) => {
                                                    return (
                                                        <TableRow hover role="checkbox" tabIndex={-1} key={key}>
                                                            {scoredCompColumns.map((column, subKey) => {
                                                                const value = row[column.id];
                                                                if (column.id == 'grade') {
                                                                    return (
                                                                        <TableCell key={`body_${subKey}`} align='center'>
                                                                            <BtnGrade number={value} selected={true}/>
                                                                        </TableCell>
                                                                    )
                                                                } else if (column.id == 'competitionName') {
                                                                    return (
                                                                        <TableCell key={`body_${subKey}`} align='center'>
                                                                            <BtnCompetitionName name={value} selected={true}/>
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
                                                                            <BtnDialogConfirm title='Start' onClick={() => onShowStartCompetitionDlg(row)}/>
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
                                            scoredCompList != null && scoredCompList.length < 1 ? (
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
                    </div> : null
            }

            {/*    get waiting table */}
            {
                props.user && props.user.status ?
                    <div className='row' style={{paddingTop: '40px'}}>
                        <div className='col-lg-12 col-sm-12 text-center'>
                            <h3 style={{color: COLOR_DLG_TITLE}}>Waiting Competitions</h3>
                        </div>
                    </div> : null
            }
            {
                props.user && props.user.status ?
                    <div className='row'>
                        <div className='col-12'>
                            <TableContainer style={{maxHeight: '400px', overflow: 'auto'}} component={Paper}>
                                <Table stickyHeader aria-label="sticky table">
                                    <TableHead>
                                        <TableRow>
                                            {waitingCompColumns.map((column, key) => (
                                                <TableCell
                                                    key={key}
                                                    align={column.align}
                                                    style={{ maxWidth: column.maxWidth, width: column.width}}
                                                    className={column.id == 'action' ? 'text-right' : ''}
                                                >
                                                    <TableSortLabel active={waitingSetting.orderBy === column.id}
                                                                    direction={waitingSetting.orderBy == column.id ? waitingSetting.order : 'asc'}
                                                                    onClick={() => {
                                                                        const isAsc = waitingSetting.orderBy === column.id && waitingSetting.order === 'asc';
                                                                        setWaitingSetting({
                                                                            ...waitingSetting,
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
                                            stableSort(waitingCompList, getComparator(waitingSetting.order, waitingSetting.orderBy))
                                                .slice(waitingSetting.page * waitingSetting.rowsPerPage, waitingSetting.page * waitingSetting.rowsPerPage + waitingSetting.rowsPerPage)
                                                .map((row, key) => {
                                                    return (
                                                        <TableRow hover role="checkbox" tabIndex={-1} key={key}>
                                                            {waitingCompColumns.map((column, subKey) => {
                                                                const value = row[column.id];
                                                                if (column.id == 'grade') {
                                                                    return (
                                                                        <TableCell key={`body_${subKey}`} align='center'>
                                                                            <BtnGrade number={value} selected={true}/>
                                                                        </TableCell>
                                                                    )
                                                                } else if (column.id == 'competitionName') {
                                                                    return (
                                                                        <TableCell key={`body_${subKey}`} align='center'>
                                                                            <BtnCompetitionName name={value} selected={true}/>
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
                                                                            <BtnDialogConfirm title='Start' onClick={() => onShowStartCompetitionDlg(row)}/>
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
                                            waitingCompList != null && waitingCompList.length < 1 ? (
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
                    </div> : null
            }

            {/*    get available table */}
            {
                props.user && props.user.status ?
                    <div className='row' style={{paddingTop: '40px'}}>
                        <div className='col-lg-12 col-sm-12 text-center'>
                            <h3 style={{color: COLOR_DLG_TITLE}}>Available Competitions</h3>
                        </div>
                    </div> : null
            }
            {
                props.user && props.user.status ?
                    <div className='row'>
                        <div className='col-12'>
                            <TableContainer style={{maxHeight: '400px', overflow: 'auto'}} component={Paper}>
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
                                                                            <BtnGrade number={value} selected={true}/>
                                                                        </TableCell>
                                                                    )
                                                                } else if (column.id == 'competitionName') {
                                                                    return (
                                                                        <TableCell key={`body_${subKey}`} align='center'>
                                                                            <BtnCompetitionName name={value} selected={true}/>
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
                                                                            <BtnDialogConfirm title='Start' onClick={() => onShowStartCompetitionDlg(row)}/>
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
                    </div> : null
            }


        </div>
    )
};
export default Dashboard;

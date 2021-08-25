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

let selectedId = '';

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
        paddingTop: '40px',
        paddingBottom: '40px',
        marginBottom: '14%'
    },

}));

const Dashboard = (props) => {

    const [scoredCompList, setScoredCompList] = useState([]);
    const [waitingCompList, setWaitingCompList] = useState([]);
    const [availableCompList, setAvailableCompList] = useState([]);

    const [showStartConfirmDlg, setShowStartConfirmDlg] = useState(false);
    const [scoredSetting, setScoredSetting] = useState({
        page: 0,
        rowsPerPage: 10,
        order: 'dateTime',
        orderBy: 'desc'
    });

    const classes = useStyles();

    const scoredCompColumns = [
        { id: 'no', label: 'No', width: 60 },
        { id: 'competitionName', label: 'Competition Name', width: 100 },
        { id: 'limitTime', label: 'Limit Time(min)', width: 100 },
        { id: 'limitWarningCount', label: 'Limit Warning Count', width: 150 },
        { id: 'warningCount', label: 'Warning Count', width: 150 },
        { id: 'startedAt', label: 'Competition Time', minWidth: 170 },
        { id: 'score', label: 'Score', width: 100},
        { id: 'action', label: 'Action', width: 170}
    ];

    const [waitingSetting, setWaitingSetting] = useState({
        page: 0,
        rowsPerPage: 10,
        order: 'dateTime',
        orderBy: 'desc'
    });

    const waitingCompColumns = [
        { id: 'no', label: 'No', width: 60 },
        { id: 'competitionName', label: 'Competition Name', width: 100 },
        { id: 'limitTime', label: 'Limit Time(min)', width: 100 },
        { id: 'limitWarningCount', label: 'Limit Warning Count', width: 150 },
        { id: 'warningCount', label: 'Warning Count', width: 150 },
        { id: 'startedAt', label: 'Competition Time', minWidth: 170 },
        { id: 'score', label: 'Score', width: 200}
    ];

    const [availableSetting, setAvailableSetting] = useState({
        page: 0,
        rowsPerPage: 10,
        order: 'dateTime',
        orderBy: 'desc'
    });

    const availableCompColumns = [
        { id: 'no', label: 'No', width: 60 },
        { id: 'competitionName', label: 'Competition Name', width: 100 },
        { id: 'limitTime', label: 'Limit Time(min)', width: 100 },
        { id: 'limitWarningCount', label: 'Limit Warning Count', width: 150 },
        { id: 'startDateTime', label: 'Start Date-Time'},
        { id: 'endDateTime', label: 'End Date-Time'},
        // { id: 'dateTime', label: 'Created At', minWidth: 170 },
        { id: 'action', label: 'Action', width: 100}
    ];

    const loadAvailableCompetitions = () => {
        props.onLoading(true);
        let grade = props.user.grade;
        // get available list
        firestore.collection('competitions').where('grades', 'array-contains', parseInt(grade))
            .get()
            .then(async competitionRef => {
                props.onLoading(true);
                let tempAvailableCompetitions = [];

                let no = 1;
                for (let i = 0; i < competitionRef.docs.length; i++) {
                    let item = competitionRef.docs[i];

                    if (item.exists) {
                        let data = item.data();

                        if (!data.status) {
                            continue;
                        }
                        let comp_id = item.id;

                        let endDateTime = data.endDateTime;
                        let now  = new Date().getTime();
                        let end = new Date(endDateTime.seconds * 1000).getTime();

                        if (now > end) {
                            continue;
                        }

                        // find in
                        let user_id = props.user.id;
                        let path = `users/${user_id}/competitions`;

                        let compRef = await firestore.collection(path).doc(comp_id).get();
                        if (compRef.exists) {
                            continue;
                        }

                        tempAvailableCompetitions.push({
                            no,
                            id: item.id,
                            ...data
                        });
                        no ++;
                    }
                }

                setAvailableCompList([...tempAvailableCompetitions]);
                props.onLoading(false);
            })
            .catch(error => {
                toast.error(error.message);
            })
            .finally(() => {
                props.onLoading(false);
            });
    };

    const loadOtherCompetitions = () => {

        props.onLoading(true);
        let grade = props.user.grade;
        let user_id = props.user.id;

        let path = `users/${user_id}/competitions`;

        // get available list
        firestore.collection(path).where('grades', 'array-contains', parseInt(grade))
            .get()
            .then(competitionRef => {
                let tempScoredCompetitions = [];
                let tempWaitingCompetitions = [];

                let noScored = 1;
                let noWaiting = 1;
                competitionRef.docs.forEach(item => {
                    if (item.exists) {
                        let data = item.data();

                        if (data.score) {
                            // put to score
                            tempScoredCompetitions.push({
                                no: noScored,
                                id: item.id,
                                ...data
                            });
                            noScored ++;

                        } else {
                            // put to waiting
                            tempWaitingCompetitions.push({
                                no: noWaiting,
                                id: item.id,
                                ...data
                            });
                            noWaiting ++;
                        }
                    }
                });

                setScoredCompList([...tempScoredCompetitions]);
                setWaitingCompList([...tempWaitingCompetitions]);
            })
            .catch(error => {
                toast.error(error.message);
            })
            .finally(() => {
                props.onLoading(false);
            });
    };

    useEffect(() => {
        if (props.user) {
            loadOtherCompetitions();
            loadAvailableCompetitions();
        }
    }, [props.user]);

    const onShowStartCompetitionDlg = (row) => {
        selectedId = row.id;
        setShowStartConfirmDlg(true);
    };

    const onLogout = () => {
        localStorage.removeItem('user_info');
        props.history.push('/login');
    };

    const onGotoCompetition = () => {
        props.history.push({
            pathname: '/user/competition',
            state: {
                competitionId: selectedId,
                user: props.user
            }
        });
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
                <div className='py-3'>
                    <h3 style={{fontWeight: 'bold', color: COLOR_DLG_BORDER_BLACK}} className='text-center'>
                        Do you really want to start?
                    </h3>
                    <h3 style={{fontWeight: 'bold', color: COLOR_DLG_BORDER_BLACK}} className='text-center'>
                        You cannot cancel while competition is running.
                    </h3>
                </div>
            </DialogContent>
            <DialogActions className='justify-content-center'>
                <BtnDialogConfirm onClick={() => setShowStartConfirmDlg(false)} variant='contained' title='No' width='120px' disabled={props.initLoading} backgroundColor={COLOR_CANCEL_BUTTON}/>
                <BtnDialogConfirm width='120px'
                                  onClick={() => onGotoCompetition()}
                                  variant='contained' title='Yes' disabled={props.initLoading}/>
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
                            <div style={{fontSize: '36px', fontWeight: 'bolder'}}>Welcome <span style={{color: 'red'}}> {props.user ? props.user.fullName : ''}</span></div>
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                <div style={{fontSize: '30px', fontWeight: 'bolder'}}>Your grade is </div>&nbsp;&nbsp;<BtnGrade number={props.user ? props.user.grade : ''} selected/>
                            </div>
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
                                                    style={{ maxWidth: column.maxWidth, width: column.width, justifyContent: column.justifyContent}}
                                                    className={column.id == 'action' || column.id == 'score' ? 'text-center' : ''}
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
                                                                } else if (column.id == 'startedAt') {
                                                                    return (
                                                                        <TableCell key={`body_${subKey}`}>
                                                                            {new Date(value.seconds * 1000).toLocaleString()}
                                                                        </TableCell>
                                                                    )
                                                                } else if (column.id == 'score') {
                                                                    return (
                                                                        <TableCell key={`body_${subKey}`} className='text-center'>
                                                                            <BtnCompetitionName name={value} selected={true}/>
                                                                        </TableCell>
                                                                    )
                                                                } else if (column.id == 'action') {
                                                                    return (
                                                                        <TableCell key={`body_${subKey}`}>
                                                                            <BtnDialogConfirm title='View List' onClick={() => {
                                                                                alert('view detail List' + row.id)
                                                                            }}/>
                                                                        </TableCell>
                                                                    )
                                                                }
                                                                else {
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
                                                    <TableCell colSpan={15} align="center">
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
                                                    className={column.id == 'score' ? 'text-center' : ''}
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
                                                                } else if (column.id == 'startedAt') {
                                                                    return (
                                                                        <TableCell key={`body_${subKey}`}>
                                                                            {new Date(value.seconds * 1000).toLocaleString()}
                                                                        </TableCell>
                                                                    )
                                                                } else if (column.id == 'score') {
                                                                    return (
                                                                        <TableCell key={`body_${subKey}`} className='text-center'>
                                                                            <BtnCompetitionName name='Awaiting Score' selected={true}/>
                                                                        </TableCell>
                                                                    )
                                                                }
                                                                else {
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
                                                    <TableCell colSpan={15} align="center">
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
                                                    className={['action', 'startDateTime', 'endDateTime'].includes(column.id) ? 'text-center' : ''}
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
                                                                } else if (column.id == 'dateTime') {
                                                                    return (
                                                                        <TableCell key={`body_${subKey}`}>
                                                                            {new Date(value.seconds * 1000).toLocaleString()}
                                                                        </TableCell>
                                                                    )
                                                                } else if (column.id == 'startDateTime') {
                                                                    return (
                                                                        <TableCell key={`body_${subKey}`} align='center'>
                                                                            {new Date(row.startDateTime.seconds * 1000).toLocaleString()}
                                                                        </TableCell>
                                                                    )
                                                                } else if (column.id == 'endDateTime') {
                                                                    return (
                                                                        <TableCell key={`body_${subKey}`} align='center'>
                                                                            {new Date(row.startDateTime.seconds * 1000).toLocaleString()}
                                                                        </TableCell>
                                                                    )
                                                                } else if (column.id == 'action') {
                                                                    return (
                                                                        <TableCell key={`body_${subKey}`}>
                                                                            {
                                                                                new Date().getTime() >= new Date(row.startDateTime.seconds * 1000).getTime() ?
                                                                                    <BtnDialogConfirm title='Start' onClick={() => onShowStartCompetitionDlg(row)}/>
                                                                                    :
                                                                                    null
                                                                            }
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
                                                    <TableCell colSpan={15} align="center">
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

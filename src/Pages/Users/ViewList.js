import React, {useEffect, useState} from "react";
import {firestore} from "../../firebase";
import 'react-pro-sidebar/dist/css/styles.css';
import Button from "@material-ui/core/Button";
import {toast, ToastContainer} from "react-toastify";
import {useLocation} from 'react-router-dom';
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
import BtnCompetitionNumberSelect from "../../Components/User/BtnCompetitionNumberSelect";

let selectedCompId = '';

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
    button: {
        color: '#fff',
        padding: '15px 15px',
        fontSize: '1em',
        borderRadius: '20px'
    }
}));

const ViewList = (props) => {

    const [scoredCompList, setScoredCompList] = useState([]);

    const [showStartConfirmDlg, setShowStartConfirmDlg] = useState(false);
    const [scoredSetting, setScoredSetting] = useState({
        page: 0,
        rowsPerPage: 10,
        order: 'dateTime',
        orderBy: 'desc'
    });

    const classes = useStyles();

    const location = useLocation();

    const scoredCompColumns = [
        { id: 'no', label: 'No', width: 60 },
        { id: 'competitionName', label: 'Competition Name', width: 100 },
        { id: 'problemCount', label: 'Problem Count', width: 100 },
        { id: 'limitTime', label: 'Limit Time(min)', width: 100 },
        { id: 'limitWarningCount', label: 'Limit Warning Count', width: 150 },
        { id: 'warningCount', label: 'Warning Count', width: 150 },
        { id: 'startedAt', label: 'Competition Time', minWidth: 170 },
        { id: 'score', label: 'Score', width: 100}
    ];

    const onLoadUserCompetitions = () => {

        props.onLoading(true);
        let grade = props.user.grade;
        let user_id = props.user.id;

        let path = `users/${user_id}/competitions`;

        // get available list
        firestore.collection(path).where('grades', 'array-contains', parseInt(grade))
            .get()
            .then(competitionRef => {
                let tempScoredCompetitions = [];

                let noScored = 1;
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

                        }
                    }
                });

                setScoredCompList([...tempScoredCompetitions]);
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
            selectedCompId = location.state.competitionId;
            if (selectedCompId) {
                onLoadUserCompetitions();
            }
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
            <ToastContainer
                position='top-center'
                autoClose={2000}
                traggle/>

            <div className={'row py-2'}>
                <div className='col-4'>
                    <Button className={classes.button} style={{backgroundColor: COLOR_DLG_BORDER_BLUE}} variant='contained' onClick={() => onGotoDashboard()}>Return to Dashboard</Button>
                </div>
                <div className='col-8 text-right'>
                    <Button type='button' variant="text" color="secondary" onClick={() => {
                        onLogout()
                    }}>Logout<ExitToApp></ExitToApp></Button>
                </div>
            </div>

            {/*    get scored table */}
            {
                props.user && props.user.status ?
                    <div className='row' style={{paddingTop: '40px'}}>
                        <div className='col-lg-12 col-sm-12 text-center'>
                            <h3 style={{color: COLOR_DLG_TITLE}}>Scored Competition List</h3>
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
                                                                } else if (column.id == 'problemCount') {
                                                                    return (
                                                                        <TableCell key={`body_${subKey}`} align='center'>
                                                                            <BtnCompetitionNumberSelect number={row.problems.length} selected={true}/>
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

        </div>
    )
};
export default ViewList;

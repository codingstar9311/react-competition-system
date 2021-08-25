import React, {useEffect, useState} from "react";
import 'react-pro-sidebar/dist/css/styles.css';

import {TableContainer, Table, TableHead, TableBody, TableRow, makeStyles,
    TableCell, TablePagination, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from "@material-ui/core";
import {AddCircle as AddIcon} from "@material-ui/icons";
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {firestore} from "../../firebase";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import IconButton from "@material-ui/core/IconButton";
import {Delete as DeleteIcon, Edit as EditIcon, Search as SearchIcon, Replay as ReplayIcon } from "@material-ui/icons";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import InputAdornment from "@material-ui/core/InputAdornment";
import Input from "@material-ui/core/Input";
import DlgDeleteConfirm from "../../Components/Admin/DlgDeleteConfirm";
import {
    COLOR_ADMIN_MAIN,
    COLOR_CANCEL_BUTTON,
    COLOR_DLG_BORDER_BLUE,
    COLOR_DLG_TITLE
} from "../../Utils/ColorConstants";
import BtnDialogConfirm from "../../Components/Common/BtnDialogConfirm";
import BtnGrade from "../../Components/Common/BtnGrade";

import BtnCompetitionName from "../../Components/Common/BtnCompetitionName";
import {Multiselect} from "multiselect-react-dropdown";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import {getComparator, stableSort} from "../../Utils/CommonFunctions";
import BtnCompetitionNumberSelect from "../../Components/User/BtnCompetitionNumberSelect";

const initLimitWarningCount = 15;
const initLimitTime = 20;

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
        paddingBottom: '40px',
        marginBottom: '14%'
    },
}));

const CompetitionResults = (props) => {

    const columns = [
        { id: 'no', label: 'No', width: 60 },
        { id: 'fullName', label: 'Name'},
        { id: 'grade', label: 'Grade', width: 80 },
        { id: 'competitionName', label: 'Competition Name', width: 100 },
        { id: 'score', label: 'Score'},
        { id: 'limitWarningCount', label: 'Limit Warning Count', width: 100 },
        { id: 'warningCount', label: 'Warning Count', width: 100 },
        { id: 'startedAt', label: 'Competition Time', minWidth: 250 },
        { id: 'action', label: 'Action', width: 140, textCenter: 'center' }
    ];

    const [maxHeight, setMaxHeight] = useState('none');

    window.onresize = function () {

        let adminHeader = document.getElementById('admin-header').offsetHeight;
        let tempHeight = window.innerHeight - adminHeader - 10;

        setMaxHeight(`${tempHeight}px`);
    };

    const [problems, setProblems] = useState([]);
    const [selectedProblems, setSelectedProblems] = useState([]);

    const [limitTime, setLimitTime] = useState(initLimitTime);
    const [limitWarningCount, setLimitWarningCount] = useState(initLimitWarningCount);
    const [startDateTime, setStartDateTime] = useState('');
    const [endDateTime, setEndDateTime] = useState('');

    const [rows, setRows] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openRestartDialog, setOpenRestartDialog] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [restartLoading, setRestartLoading] = useState(false);

    // table setting
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('desc');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    // //////

    const [searchText, setSearchText] = useState('');
    const [modalTitle, setModalTitle] = useState('Add Competition');
    const [grades, setGrades] = useState([]);
    const [competitionName, setCompetitionName] = useState('');

    const [loading, setLoading] = useState(false);

    const classes = useStyles();

    const [filterGrades, setFilterGrades] = useState([]);
    const [filterCompNames, setFilterCompNames] = useState([]);

    useEffect(() => {
        onLoadCompetitionResults();
    }, [filterGrades, filterCompNames]);

    const onChangeFilterGrades = (val) => {
        let index = filterGrades.indexOf(val);

        if (index > -1) {
            filterGrades.splice(index, 1);
            setFilterGrades([...filterGrades])
        } else {
            setFilterGrades([...filterGrades, val]);
        }
    };

    const onChangeFilterCompNames = (val) => {
        let index = filterCompNames.indexOf(val);

        if (index > -1) {
            filterCompNames.splice(index, 1);
            setFilterCompNames([...filterCompNames])
        } else {
            setFilterCompNames([...filterCompNames, val]);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const onLoadProblems = (insCompetitionName = '') => {
        firestore.collection('problems')
            .orderBy('problemName', 'desc')
            .get()
            .then(problemRef => {
                let tempProblems = [];
                problemRef.docs.forEach(item => {
                    if (item.exists) {
                        let data = item.data();

                        let tempCompName = data.competitionName ? data.competitionName : '';

                        if (insCompetitionName !== '' && insCompetitionName !== tempCompName) {
                            return;
                        }

                        tempProblems.push({
                            id: item.id,
                            problemName: data.problemName
                        });
                    }
                });

                setProblems(tempProblems);
            })
            .catch(error => {
                toast.error(error.message);
            })
    };

    const onLoadCompetitionResults = () => {
        props.onLoading(true);
        firestore.collection('users').orderBy('fullName', 'desc')
            .get()
            .then(async usersRef => {
                props.onLoading(true);
                let tempUserCompetitions = [];
                let no = 1;

                for (let i = 0; i < usersRef.docs.length; i++) {
                    let item = usersRef.docs[i];
                    if (item.exists) {
                        let data = item.data();

                        if (!data.status || data.type != 'user') {
                            continue;
                        }


                        let tempGrade = data.grade ? parseInt(data.grade) : '';
                        let tempFullName = data.fullName ? data.fullName : '';

                        if (filterGrades.length > 0 && !filterGrades.includes(tempGrade)) {
                            continue;
                        }

                        let bFind = true;
                        if (searchText != '') {
                            if (!tempGrade.toString().includes(searchText) && !tempFullName.includes(searchText)) {
                                bFind = false;
                            }
                        }

                        let tempUserInfo = {
                            id: item.id,
                            fullName: tempFullName,
                            grade: tempGrade,
                            competitions: []
                        };

                        // find competitions
                        let competition_path = `users/${item.id}/competitions`;

                        let tempCompetitions = await firestore.collection(competition_path)
                            .get();

                        tempCompetitions.docs.forEach(compItem => {
                            if (!compItem.exists) {
                                return;
                            }

                            let tempData = compItem.data();

                            let curDateTime = new Date().getTime();
                            let tempEndTime = new Date(tempData.endTime.seconds * 1000).getTime();

                            if (filterCompNames.length > 0 && !filterCompNames.includes(tempData.competitionName)) {
                                return;
                            }

                            if (searchText != '' && bFind == false) {
                                if (!tempData.competitionName.includes(searchText) && !'Awaiting Score'.includes(searchText)
                                    && !tempData.limitWarningCount.toString().includes(searchText)) {
                                    return;
                                }
                            }

                            if (curDateTime > tempEndTime || tempData.submitted) {
                                tempUserInfo.competitions.push({
                                    ...tempData
                                })
                            }
                        });

                        if (tempUserInfo.competitions.length > 0) {
                            tempUserInfo.no = no;
                            tempUserCompetitions.push(tempUserInfo);
                            no ++;
                        }
                    }
                }


                setRows([...tempUserCompetitions]);
                console.log(tempUserCompetitions);
                props.onLoading(false);

                setPage(0);
            })
            .catch(error => {
                toast.error(error.message);
            })
            .finally(() => {
                props.onLoading(false);
            });
    };

    useEffect(() => {
        setMaxHeight(`${(window.innerHeight - document.getElementById('admin-header').offsetHeight - 10)}px`);
    }, []);

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const onToggleDialog = () => {
        setOpenDialog(!openDialog);
    };

    const onSaveCompetition = async (event) => {
        event.preventDefault();

        if (selectedProblems.length < 1) {
            toast.warning('Please select problems!');
            return;
        }

        if (endDateTime === '' || startDateTime === '') {
            toast.warning('Please select duration.');
            return;
        }

        if (endDateTime <= startDateTime) {
            toast.warning('Please select correct durations. End date time should be bigger than start date time');
            return;
        }

        setLoading(true);

        let competitionInfo = {
            grades,
            competitionName,
            selectedProblems,
            limitTime,
            limitWarningCount,
            startDateTime: new Date(startDateTime),
            endDateTime: new Date(endDateTime),
        };

        if (selectedId === '') { // add
            competitionInfo.dateTime = new Date();
            competitionInfo.status = true;
            firestore.collection('competitions').add(competitionInfo)
                .then(() => {
                    toast.success('Successfully Added!');
                    onLoadCompetitionResults();
                    onToggleDialog();
                })
                .catch(error => {
                    toast.error(error.message);
                })
                .finally(() => {
                    setLoading(false);
                });

        } else { // update
            firestore.collection('competitions')
                .doc(selectedId)
                .set({
                    ...competitionInfo
                }, {merge: true})
                .then(() => {
                    onLoadCompetitionResults();
                    onToggleDialog();
                })
                .catch(error => {
                    toast.error(error.message);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    };

    const onRestartCompetition = (competition_id) => {
        setRestartLoading(true);
        firestore.collection('users')
            .get()
            .then(async usersRef => {
                for (let i = 0; i < usersRef.docs.length; i++) {
                    if (usersRef.docs[i].exists) {
                        let user_id = usersRef.docs[i].id;
                        let competition_path = `users/${user_id}/competitions`;

                        await firestore.collection(competition_path)
                            .doc(competition_id)
                            .delete();
                    }
                }

                toast.success('Restarted successfully!');
                setOpenRestartDialog(false);
            })
            .catch(error => {
                toast.error(error.message);
            })
            .finally(() => {
                setRestartLoading(false);
            })
    };

    const onChangeGrades = (val) => {
        let index = grades.indexOf(val);

        if (index > -1) {
            grades.splice(index, 1);
            setGrades([...grades])
        } else {
            setGrades([...grades, val]);
        }
    };

    const getConvertDateTimeFormat = (dateTime) => {
        let initDateTime = new Date(dateTime.seconds * 1000).toLocaleString();
        let tempArr = initDateTime.split(",");

        if (tempArr.length < 2) {
            return '';
        }
        let datePart = tempArr[0].trim();
        let timePart = tempArr[1].trim();

        tempArr = datePart.split("/");
        if (tempArr.length < 3) {
            return '';
        }

        let month = parseInt(tempArr[0]);
        if (month < 10) {
            month = "0" + month;
        }

        let date = parseInt(tempArr[1]);
        if (date < 10) {
            date = "0" + date;
        }

        let year = parseInt(tempArr[2]);

        let dateString = [year, month, date].join("-");

        tempArr = timePart.split(" ");
        if (tempArr.length < 2) {
            return '';
        }

        let strTime = tempArr[0];
        let ampm = tempArr[1];

        tempArr = strTime.split(':');
        if (tempArr.length < 3) {
            return '';
        }

        let hour = parseInt(tempArr[0]);
        if (ampm == 'PM') {
            hour += 12;
        }

        if (hour < 10) {
            hour = "0" + hour;
        }

        let minute = parseInt(tempArr[1]);
        if (minute < 10) {
            minute = "0" + minute;
        }

        let timeString = [hour, minute].join(":");

        return [dateString, timeString].join("T");
    };

    const onEditCompetition = (row) => {
        selectedId = row.id;

        onLoadProblems(row.competitionName);
        setGrades(row.grades);
        setCompetitionName(row.competitionName);


        setSelectedProblems(row.selectedProblems);
        setLimitTime(row.limitTime);
        setLimitWarningCount(row.limitWarningCount);

        let tempStartDateTime = getConvertDateTimeFormat(row.startDateTime);
        let tempEndDateTime = getConvertDateTimeFormat(row.endDateTime);

        setStartDateTime(tempStartDateTime);
        setEndDateTime(tempEndDateTime);
        setModalTitle('Set Competition');

        onToggleDialog();
    };

    const onAddCompetition = () => {
        selectedId = '';

        setGrades([]);
        setCompetitionName('');
        setSelectedProblems([]);
        setLimitTime(initLimitTime);
        setLimitWarningCount(initLimitWarningCount);
        setStartDateTime('');
        setEndDateTime('');

        setModalTitle('Set Competition');
        onToggleDialog();
    };

    const onDeleteCompetition = async (competition_id) => {

        setDeleteLoading(true);
        firestore.collection('competitions').doc(competition_id)
            .delete()
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

    const onSelectProblems = (selList, selItem) => {
        setSelectedProblems([...selList]);
    };

    const onRemoveProblems = (selList, selItem) => {
        setSelectedProblems([...selList]);
    };

    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;

    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 250,
            },
        },
    };

    const onChangeStatus = (event, row) => {
        row.status = event.target.checked;
        setRows([...rows]);

        let id = row.id;

        firestore.collection('competitions')
            .doc(id)
            .set({
                status: event.target.checked
            }, {merge: true})
            .then(() => {
                toast.success('Successfully changed status!', {
                    autoClose: 1000
                });
            }).catch(error => {
            toast.error(error.message);
            row.status = !row.status;
            setRows([...rows]);
        })
    };

    const dialog = (<Dialog open={openDialog}
                            fullWidth={true}
                            maxWidth={'md'}
                            classes={{
                                paper: classes.dlgBlueBorder
                            }}
                            scroll="body"
                            onClose={(event, reason) => {
                                if (reason == 'backdropClick' || reason == 'escapeKeyDown') {
                                    return;
                                }
                                onToggleDialog()
                            }}
                            aria-labelledby="form-dialog-title">
        <form onSubmit={onSaveCompetition} autoComplete="off">
            <DialogTitle className='text-center' style={{color: COLOR_DLG_TITLE}}>{modalTitle}</DialogTitle>
            <DialogContent>
                <div className='row py-2 align-items-center justify-content-center'>
                    <div className='col-lg-10 col-sm-10 px-2'>
                        <div className='row align-items-center'>
                            <div className='col-lg-4 col-sm-12 text-left'>
                                Select Grades
                            </div>
                            <div className='col-lg-8 col-sm-12 justify-content-around' style={{display: "flex"}}>
                                {
                                    [6, 7, 8, 9, 10].map((val, key) => {
                                        return (
                                            <div className='px-2' key={key} >
                                                <BtnGrade number={val} onClick={() => {
                                                    onChangeGrades(val);
                                                }} selected={grades.includes(val)}/>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </div>

                <div className='row py-2 align-items-center justify-content-center'>
                    <div className='col-lg-10 col-sm-10 px-2'>
                        <div className='row align-items-center'>
                            <div className='col-lg-4 col-sm-12 text-left'>
                                Select Competition Name
                            </div>
                            <div className='col-lg-8 col-sm-12 justify-content-around' style={{display: "flex"}}>
                                {
                                    ['MST', 'MSO', 'HST', 'HSO'].map((val, key) => {
                                        return (
                                            <div className='px-2' key={key}>
                                                <BtnCompetitionName name={val} onClick={() => {
                                                    setCompetitionName(val);
                                                    onLoadProblems(val);
                                                    setSelectedProblems([]);
                                                }} selected={val === competitionName}/>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </div>
                {
                    grades && competitionName ?
                        <div className='row py-2 align-items-center justify-content-center'>
                            <div className='col-lg-10 col-sm-10 px-2'>
                                <label>Selected Problems({selectedProblems.length})</label>
                            </div>
                            <div className='col-lg-10 col-sm-10 px-2 problems-select-multi'>
                                <Multiselect
                                    options={problems}
                                    selectedValues={selectedProblems}
                                    onSelect={onSelectProblems}
                                    onRemove={onRemoveProblems}
                                    showArrow={true}
                                    closeOnSelect={false}
                                    displayValue='problemName'
                                    placeholder={'Select Problems'}
                                    showCheckbox={true}
                                />
                            </div>

                        </div> : null
                }
                {
                    grades && competitionName ?
                        <div className='row py-2 align-items-center justify-content-center'>
                            <div className='col-lg-5 col-sm-10 px-2'>
                                <TextField
                                    autoFocus
                                    label="Limit Time"
                                    type="number"
                                    value={limitTime}
                                    onChange={(e) => setLimitTime(e.target.value)}
                                    fullWidth
                                    required
                                />
                            </div>
                            <div className='col-lg-5 col-sm-10 px-2'>
                                <TextField
                                    autoFocus
                                    label="Limit Warning Count"
                                    type="number"
                                    value={limitWarningCount}
                                    onChange={(e) => setLimitWarningCount(e.target.value)}
                                    fullWidth
                                    required
                                />
                            </div>
                        </div> : null
                }
                {
                    grades && competitionName ?
                        <div className='row py-2 align-items-center justify-content-center'>
                            <div className='col-lg-5 col-sm-10 px-2'>
                                <TextField
                                    autoFocus
                                    label="Start Date-Time"
                                    type='datetime-local'
                                    value={startDateTime}
                                    onChange={(e) => setStartDateTime(e.target.value)}
                                    fullWidth
                                    InputLabelProps={{
                                        shrink: true
                                    }}
                                />
                            </div>
                            <div className='col-lg-5 col-sm-10 px-2'>
                                <TextField
                                    autoFocus
                                    label="End Date-Time"
                                    type="datetime-local"
                                    value={endDateTime}
                                    onChange={(e) => setEndDateTime(e.target.value)}
                                    fullWidth
                                    InputLabelProps={{
                                        shrink: true
                                    }}
                                />
                            </div>
                        </div> : null
                }
                <div className='row' style={{height: 80}}>
                </div>
            </DialogContent>
            <DialogActions className='justify-content-center py-3'>
                <BtnDialogConfirm disabled={loading} backgroundColor={COLOR_CANCEL_BUTTON} width={'100px'} type='button' onClick={onToggleDialog} title={'Cancel'}/>
                <BtnDialogConfirm disabled={loading} type='submit' width={'100px'} title={'Save'}/>
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
            <DlgDeleteConfirm title="Do you really want to delete?" open={openDeleteDialog} disabled={deleteLoading} onNo={() => {setOpenDeleteDialog(false)}} onYes={() => onDeleteCompetition(selectedId)}/>
            <DlgDeleteConfirm title="Do you really want to restart this competition?" open={openRestartDialog} disabled={restartLoading || selectedId === ''} onNo={() => {setOpenRestartDialog(false)}} onYes={() => onRestartCompetition(selectedId)}/>
            <div className='row justify-content-center align-items-center py-2' id='admin-header'>
                <div className='col-lg-12 col-sm-12'>
                    <h2 className='my-1'>User Competition Info</h2>
                </div>
                <div className='col-lg-5 col-md-6 col-sm-12'>
                    <div className='row align-items-center'>
                        <div className='col-lg-3 col-sm-12 text-left'>
                            Grades:
                        </div>
                        <div className='col-lg-9 col-sm-12 justify-content-center' style={{display: "flex"}}>
                            {
                                [6, 7, 8, 9, 10].map((val, key) => {
                                    return (
                                        <div className='px-2' key={key}>
                                            <BtnGrade number={val} onClick={() => onChangeFilterGrades(val)} selected={filterGrades.includes(val)}/>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                    <div className='row align-items-center'>
                        <div className='col-lg-3 col-sm-12 text-left py-1'>
                            Competitions:
                        </div>
                        <div className='col-lg-9 col-sm-12 justify-content-center py-1' style={{display: "flex"}}>
                            {
                                ['MST', 'MSO', 'HST', 'HSO'].map((val, key) => {
                                    return (
                                        <div className='px-2' key={key}>
                                            <BtnCompetitionName name={val} onClick={() => onChangeFilterCompNames(val)} selected={filterCompNames.includes(val)}/>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
                <div className='col-lg-4 col-md-6 col-sm-12 text-right'>
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
                <div className='col-lg-3 col-md-6 col-sm-12 text-center align-items-center justify-content-end' style={{display: 'flex'}}>
                    <FormControl>
                        <InputLabel htmlFor="filled-adornment-password">Search</InputLabel>
                        <Input
                            type={'text'}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onKeyUp={e => {
                                if (e.key == 'Enter') {
                                    onLoadCompetitionResults();
                                }
                            }}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => {
                                            onLoadCompetitionResults()
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
                    <Button variant='contained' onClick={() => onAddCompetition()} startIcon={<AddIcon/>} style={{backgroundColor: COLOR_ADMIN_MAIN, color: '#fff'}} className='float-right'>Add</Button>
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
                                            key={key}
                                            align={column.align}
                                            style={{ maxWidth: column.maxWidth, width: column.width}}
                                            className={['action', 'score', 'grade'].includes(column.id) ? 'text-center' : ''}
                                        >
                                            {
                                                ['no', 'fullName', 'grade'].includes(column.id) ?
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
                                                    :
                                                    column.label
                                            }
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    rows != null && stableSort(rows, getComparator(order, orderBy))
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((row, key) => {
                                            let competitions = row.competitions;

                                            if (competitions.length > 0) {
                                                return competitions.map((compInfo, competitionKey) => {
                                                    return (
                                                        <TableRow hover role="checkbox" tabIndex={-1} key={key + '_' + competitionKey}>
                                                            {columns.map((column, columnKey) => {
                                                                const value = row[column.id];

                                                                if (column.id == 'no') {
                                                                    return (
                                                                        competitionKey === 0 ?
                                                                            <TableCell key={`body_${columnKey}`}
                                                                                       rowSpan={competitions.length}>
                                                                                {value}
                                                                            </TableCell> : null
                                                                    )
                                                                } else if (column.id == 'fullName') {
                                                                    return (
                                                                        competitionKey === 0 ?
                                                                            <TableCell key={`body_${columnKey}`}
                                                                                       rowSpan={competitions.length}>
                                                                                {value}
                                                                            </TableCell> : null
                                                                    )
                                                                } else if (column.id == 'grade') {
                                                                    return (
                                                                        competitionKey === 0 ?
                                                                            <TableCell key={`body_${columnKey}`}
                                                                                       align='center'
                                                                                       rowSpan={competitions.length}>
                                                                                <BtnGrade number={value}
                                                                                          selected={true}/>
                                                                            </TableCell> : null
                                                                    )
                                                                } else if (column.id == 'competitionName') {
                                                                    return (
                                                                        <TableCell key={`body_${columnKey}`} align='center'>
                                                                            <BtnCompetitionName name={compInfo.competitionName} selected={true}/>
                                                                        </TableCell>
                                                                    )
                                                                } else if (column.id == 'score') {
                                                                    return (
                                                                        <TableCell key={`body_${columnKey}`}
                                                                            align='center'
                                                                        >
                                                                            <div>
                                                                                <BtnCompetitionName name={compInfo.score ? compInfo.score : 'Awaiting Score'} selected={true}/>
                                                                            </div>
                                                                        </TableCell>
                                                                    )
                                                                } else if (column.id == 'limitWarningCount') {
                                                                    return (
                                                                        <TableCell key={`body_${columnKey}`}>
                                                                            <BtnGrade number={compInfo.limitWarningCount}/>
                                                                        </TableCell>
                                                                    )
                                                                } else if (column.id == 'warningCount') {
                                                                    return (
                                                                        <TableCell key={`body_${columnKey}`}>
                                                                            <BtnCompetitionNumberSelect number={compInfo.warningCount} status='done'/>
                                                                        </TableCell>
                                                                    )
                                                                } else if (column.id == 'startedAt') {
                                                                    return (
                                                                        <TableCell key={`body_${columnKey}`}>
                                                                            {
                                                                                new Date(compInfo.startedAt.seconds * 1000).toLocaleString()
                                                                            }
                                                                        </TableCell>
                                                                    )
                                                                } else if (column.id == 'action') {
                                                                    return (
                                                                        <TableCell key={`body_${columnKey}`} className='text-right'>
                                                                            <IconButton color='primary'
                                                                                        size='small'
                                                                                        title="Edit Competition"
                                                                                        onClick={() => onEditCompetition(row)}>
                                                                                <EditIcon/>
                                                                            </IconButton>
                                                                            &nbsp;
                                                                            <IconButton color='secondary'
                                                                                        size='small'
                                                                                        title="Delete Competition"
                                                                                        onClick={() => {
                                                                                            selectedId = row.id;
                                                                                            setOpenDeleteDialog(true);

                                                                                        }}>
                                                                                <DeleteIcon/>
                                                                            </IconButton>

                                                                        </TableCell>
                                                                    )
                                                                } else {
                                                                    return (
                                                                        <TableCell key={`body_${columnKey}`} align={column.align}>
                                                                            {column.format && typeof value === 'number' ? column.format(value) : value}
                                                                        </TableCell>
                                                                    );
                                                                }
                                                            })}
                                                        </TableRow>
                                                    )
                                                });
                                            } else {
                                                return (
                                                    <TableRow hover role="checkbox" tabIndex={-1} key={key}>
                                                        {columns.map((column, columnKey) => {
                                                            const value = row[column.id];
                                                            if (column.id == 'grade') {
                                                                return (
                                                                    <TableCell key={`body_${columnKey}`} align='center'>
                                                                        <BtnGrade number={value} selected={true}/>
                                                                    </TableCell>
                                                                )
                                                            } if (column.id == 'competitionName') {
                                                                return (
                                                                    <TableCell key={`body_${columnKey}`} align='center'>
                                                                        <BtnCompetitionName name={value} selected={true}/>
                                                                    </TableCell>
                                                                )
                                                            } if (column.id == 'selectedProblems') {
                                                                return (
                                                                    <TableCell key={`body_${columnKey}`}>
                                                                        {value.map(item => (item.problemName)).join(', ')}
                                                                    </TableCell>
                                                                )
                                                            } if (column.id == 'dateTime') {
                                                                return (
                                                                    <TableCell key={`body_${columnKey}`}>
                                                                        {new Date(value.seconds * 1000).toLocaleString()}
                                                                    </TableCell>
                                                                )
                                                            } if (column.id == 'duration') {
                                                                return (
                                                                    <TableCell key={`body_${columnKey}`}>
                                                                        {new Date(row.startDateTime.seconds * 1000).toLocaleString() + ' ~ ' + new Date(row.endDateTime.seconds * 1000).toLocaleString()}
                                                                    </TableCell>
                                                                )
                                                            } else if (column.id == 'status') {
                                                                return (
                                                                    <TableCell key={`body_${columnKey}`}>
                                                                        <FormControlLabel
                                                                            control={
                                                                                <Switch
                                                                                    checked={value}
                                                                                    onChange={(event) => onChangeStatus(event, row)}
                                                                                    name="checkedB"
                                                                                    color="primary"
                                                                                />
                                                                            }
                                                                        />
                                                                    </TableCell>
                                                                )
                                                            }
                                                            else if (column.id == 'action') {
                                                                return (
                                                                    <TableCell key={`body_${columnKey}`} className='text-right'>
                                                                        <IconButton color='primary'
                                                                                    size='small'
                                                                                    title="Edit Competition"
                                                                                    onClick={() => onEditCompetition(row)}>
                                                                            <EditIcon/>
                                                                        </IconButton>
                                                                        &nbsp;
                                                                        <IconButton color='secondary'
                                                                                    size='small'
                                                                                    title="Delete Competition"
                                                                                    onClick={() => {
                                                                                        selectedId = row.id;
                                                                                        setOpenDeleteDialog(true);

                                                                                    }}>
                                                                            <DeleteIcon/>
                                                                        </IconButton>

                                                                    </TableCell>
                                                                )
                                                            } else {
                                                                return (
                                                                    <TableCell key={`body_${columnKey}`} align={column.align}>
                                                                        {column.format && typeof value === 'number' ? column.format(value) : value}
                                                                    </TableCell>
                                                                );
                                                            }
                                                        })}
                                                    </TableRow>
                                                )
                                            }

                                        })}
                                {
                                    rows != null && rows.length < 1 ? (
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
            </div>
        </div>
    )
};
export default CompetitionResults;

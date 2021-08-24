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

const Competitions = (props) => {

    const columns = [
        { id: 'no', label: 'No', width: 60 },
        { id: 'grade', label: 'Grade', width: 80 },
        { id: 'competitionName', label: 'Competition Name', minWidth: 170 },
        { id: 'selectedProblems', label: 'Selected Problems', minWidth: 170 },
        { id: 'limitTime', label: 'Limit Time(min)', width: 100 },
        { id: 'limitWarningCount', label: 'Limit Warning Count', width: 100 },
        { id: 'startDate', label: 'Start Date', width: 140 },
        { id: 'endDate', label: 'End Date', width: 140 },
        { id: 'status', label: 'Status', width: 80 },
        { id: 'dateTime', label: 'Created At', minWidth: 170 },
        { id: 'action', label: 'Action', width: 140, textCenter: 'center' }
    ];

    const [maxHeight, setMaxHeight] = useState('none');

    window.onresize = function () {

        let adminHeader = document.getElementById('admin-header').offsetHeight;
        let tempHeight = window.innerHeight - adminHeader - 10;

        setMaxHeight(`${tempHeight}px`);
    };

    const [totalProblems, setTotalProblems] = useState([]);
    const [selectedProblems, setSelectedProblems] = useState([]);

    const [limitTime, setLimitTime] = useState(20);
    const [limitWarningCount, setLimitWarningCount] = useState(15);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

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
    const [selectedId, setSelectedId] = useState('');
    const [grade, setGrade] = useState(0);
    const [competitionName, setCompetitionName] = useState('');

    const [loading, setLoading] = useState(false);

    const classes = useStyles();

    const [filterGrades, setFilterGrades] = useState([]);
    const [filterCompNames, setFilterCompNames] = useState([]);

    useEffect(() => {
        onLoadCompetitions();
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

    const onLoadCurrentInfo = (insGrad = '', insCompetitionName = '') => {
        if (insGrad !== '' && insCompetitionName !== '') {
            setLoading(true);
            let docName = insGrad + "_" + insCompetitionName;
            firestore.collection('competitions').doc(docName)
                .get()
                .then(compRef => {
                    let selProblems = [];
                    let tempLimitTime = 20;
                    let tempLimitWarningCount = 20;
                    let tempStartDate = '';
                    let tempEndDate = '';

                    if (compRef.exists) {
                        let data = compRef.data();
                        if (data.selectedProblems) {
                            let tlProblemsIds = totalProblems.map(item => {
                                return item.id;
                            });
                            selProblems = data.selectedProblems.filter(item => {
                                if (tlProblemsIds.includes(item.id)) {
                                    return true;
                                }
                                return false;
                            })
                        }

                        tempLimitTime = data.limitTime ? data.limitTime : 20;
                        tempLimitWarningCount = data.limitWariningCount ? data.limitWariningCount : 20;
                        tempStartDate = data.startDate ? data.startDate : '';
                        tempEndDate = data.endDate ? data.endDate : '';

                    }
                    setSelectedProblems(selProblems);
                    setLimitTime(tempLimitTime);
                    setLimitWarningCount(tempLimitWarningCount);
                    setStartDate(tempStartDate);
                    setEndDate(tempEndDate);
                })
                .catch((error) => {
                    toast.error(error.message);
                })
                .finally(() => {
                    setLoading(false);
                })
        }
    };


    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const onLoadTotalProblems = (filterGrade = '', filterCompName = '') => {
        firestore.collection('problems')
            .orderBy('problemName', 'desc')
            .get()
            .then(problemRef => {
                let tempTotalProblems = [];
                problemRef.docs.forEach(item => {
                    if (item.exists) {
                        let data = item.data();

                        let tempCompName = data.competitionName ? data.competitionName : '';
                        let tempGrade = data.grade ? data.grade : '';

                        if (filterGrade != '' && filterCompName != '') {
                            if (filterGrade == tempGrade && filterCompName == tempCompName) {
                                tempTotalProblems.push({
                                    id: item.id,
                                    problemName: data.problemName
                                });
                            }
                        } else if (filterGrade != '') {
                            if (filterGrade == tempGrade) {
                                tempTotalProblems.push({
                                    id: item.id,
                                    problemName: data.problemName
                                });
                            }
                        } else if (filterCompName != '') {
                            if (filterCompName == tempCompName) {
                                tempTotalProblems.push({
                                    id: item.id,
                                    problemName: data.problemName
                                });
                            }
                        } else {
                            tempTotalProblems.push({
                                id: item.id,
                                problemName: data.problemName
                            });
                        }
                    }
                });

                setTotalProblems(tempTotalProblems);
            })
            .catch(error => {
                toast.error(error.message);
            })
    };

    const onLoadCompetitions = () => {
        props.onLoading(true);
        firestore.collection('competitions').orderBy('dateTime', 'desc')
            .get()
            .then(competitionRef => {
                let tempCompetitions = [];
                let no = 1;

                competitionRef.docs.forEach(item => {
                    if (item.exists) {
                        let data = item.data();

                        let tempGrade = data.grade ? data.grade.toString() : '';
                        let tempCompetition = data.competitionName ? data.competitionName : '';
                        let tempStartDate = data.startDate ? data.startDate.toString() : '';
                        let tempEndDate = data.endDate ? data.endDate.toString() : '';
                        let tempLimitTime = data.limitTime ? data.limitTime.toString() : '';
                        let tempLimitWarningCount = data.limitWarningCount ? data.limitWarningCount.toString() : '';

                        if (filterGrades.length > 0) {
                            if (!filterGrades.includes(data.grade)) {
                                return;
                            }
                        }

                        if (filterCompNames.length > 0) {
                            if (!filterCompNames.includes(tempCompetition)) {
                                return;
                            }
                        }

                        if (searchText !== '') {
                            if (!tempGrade.includes(searchText) && !tempCompetition.includes(searchText)
                                && !tempLimitTime.includes(searchText) && !tempLimitWarningCount.includes(searchText)
                                && !tempStartDate.includes(searchText) && !tempEndDate.includes(searchText)) {
                                return;
                            }
                        }

                        tempCompetitions.push({
                            no,
                            id: item.id,
                            ...data
                        });
                        no ++;
                    }
                });

                setRows([...tempCompetitions]);
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
        onLoadTotalProblems();
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

        setLoading(true);

        let competitionInfo = {
            grade,
            competitionName,
            selectedProblems,
            limitTime,
            limitWarningCount,
            startDate,
            endDate,
            dateTime: new Date()
        };

        let path = `${grade + '_' + competitionName}`;

        firestore.collection('competitions')
            .doc(path)
            .set({
                ...competitionInfo
            }, {merge: true})
            .then(docRef => {
                toast.success('Successfully Saved!');
                onLoadCompetitions();
                onToggleDialog();
            })
            .catch(error => {
                toast.error(error.message);
            })
            .finally(() => {
                setLoading(false);
            });
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

    const onEditCompetition = (row) => {
        setSelectedId(row.id);

        setGrade(row.grade);
        setCompetitionName(row.competitionName);

        setSelectedProblems(row.selectedProblems);
        setLimitTime(row.limitTime);
        setLimitWarningCount(row.limitWarningCount);
        setStartDate(row.startDate);
        setEndDate(row.endDate);
        setModalTitle('Set Competition');

        onToggleDialog();
    };

    const onAddCompetition = () => {
        setSelectedId('');

        setGrade('');
        setCompetitionName('');
        setSelectedProblems([]);
        setLimitTime(20);
        setLimitWarningCount(20);
        setStartDate('');
        setEndDate('');

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
                                Select Grade
                            </div>
                            <div className='col-lg-8 col-sm-12 justify-content-around' style={{display: "flex"}}>
                                {
                                    [6, 7, 8, 9, 10].map((val, key) => {
                                        return (
                                            <div className='px-2' key={key} >
                                                <BtnGrade number={val} onClick={() => {
                                                    setGrade(val);
                                                    onLoadCurrentInfo(val, competitionName);
                                                }} selected={val == grade ? true : false}/>
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
                                                    onLoadCurrentInfo(grade, val);
                                                }} selected={val === competitionName ? true : false}/>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </div>
                {
                    grade && competitionName ?
                        <div className='row py-2 align-items-center justify-content-center'>
                            <div className='col-lg-10 col-sm-10 px-2'>
                                <label>Selected Problems({selectedProblems.length})</label>
                            </div>
                            <div className='col-lg-10 col-sm-10 px-2 problems-select-multi'>
                                <Multiselect
                                    options={totalProblems}
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
                    grade && competitionName ?
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
                    grade && competitionName ?
                        <div className='row py-2 align-items-center justify-content-center'>
                            <div className='col-lg-5 col-sm-10 px-2'>
                                <TextField
                                    autoFocus
                                    label="Start Date"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    fullWidth
                                    InputLabelProps={{
                                        shrink: true
                                    }}
                                />
                            </div>
                            <div className='col-lg-5 col-sm-10 px-2'>
                                <TextField
                                    autoFocus
                                    label="End Date"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
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
                    <h2 className='my-1'>Competition List</h2>
                </div>
                <div className='col-lg-4 col-sm-12'>
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
                                    onLoadCompetitions();
                                }
                            }}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => {
                                            onLoadCompetitions()
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
                                            className={column.id == 'action' ? 'text-center' : ''}
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
                                                <TableRow hover role="checkbox" tabIndex={-1} key={key}>
                                                    {columns.map((column, subKey) => {
                                                        const value = row[column.id];
                                                        if (column.id == 'grade') {
                                                            return (
                                                                <TableCell key={`body_${subKey}`} align='center'>
                                                                    <BtnGrade number={value} selected={true}/>
                                                                </TableCell>
                                                            )
                                                        } if (column.id == 'competitionName') {
                                                            return (
                                                                <TableCell key={`body_${subKey}`} align='center'>
                                                                    <BtnCompetitionName name={value} selected={true}/>
                                                                </TableCell>
                                                            )
                                                        } if (column.id == 'selectedProblems') {
                                                            return (
                                                                <TableCell key={`body_${subKey}`}>
                                                                    {value.map(item => (item.problemName)).join(', ')}
                                                                </TableCell>
                                                            )
                                                        } if (column.id == 'dateTime') {
                                                            return (
                                                                <TableCell key={`body_${subKey}`}>
                                                                    {new Date(value.seconds * 1000).toLocaleString()}
                                                                </TableCell>
                                                            )
                                                        }
                                                        else if (column.id == 'status') {
                                                            return (
                                                                <TableCell key={`body_${subKey}`}>
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
                                                                <TableCell key={`body_${subKey}`} className='text-right'>
                                                                    <IconButton color='secondary'
                                                                                size='small'
                                                                                title="Restart this competition"
                                                                                onClick={() => {
                                                                                    setSelectedId(row.id);
                                                                                    setOpenRestartDialog(true);
                                                                                }}>
                                                                        <ReplayIcon/>
                                                                    </IconButton>
                                                                    &nbsp;&nbsp;
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
export default Competitions;

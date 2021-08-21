import React, {useEffect, useState} from "react";
import 'react-pro-sidebar/dist/css/styles.css';

import {TableContainer, Table, TableHead, TableBody, TableRow, makeStyles,
    TableCell, TablePagination, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from "@material-ui/core";
import Alert from '@material-ui/lab/Alert';
import {AddCircle as AddIcon} from "@material-ui/icons";
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
import {
    COLOR_ADMIN_MAIN,
    COLOR_CANCEL_BUTTON,
    COLOR_DLG_BORDER_BLUE,
    COLOR_DLG_TITLE
} from "../../Utils/ColorConstants";
import DialogButton from "../../Components/Common/DialogButton";
import GradeButton from "../../Components/Admin/GradeButton";

import CompetitionButton from "../../Components/Admin/CompetitionButton";
import {Multiselect} from "multiselect-react-dropdown";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";

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
        { id: 'action', label: 'Action', width: 80 }
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
    const [limitWarningCount, setLimitWarningCount] = useState(20);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');


    const [rows, setRows] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [errorMessage, setErrorMessage] = useState('');

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


    const onLoadCurrentInfo = (insGrad = '', insCompetitionName = '') => {
        if (insGrad !== '' && insCompetitionName !== '') {
            let docName = grade + "_" + competitionName;
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
                    setSelectedProblems([...selProblems]);
                    setLimitTime(tempLimitTime);
                    setLimitWarningCount(tempLimitWarningCount);
                    setStartDate(tempStartDate);
                    setEndDate(tempEndDate);
                })
                .catch((error) => {
                    toast.error(error.message);
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

    const onLoadCompetitions = (searchVal = '') => {
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

                        // if (tempStartDate.includes(searchVal)) {
                        //     alert('dddd');
                        // }
                        if (searchVal != '') {
                            if (tempGrade.includes(searchVal) || tempCompetition.includes(searchVal)
                            || tempLimitTime.includes(searchVal) || tempLimitWarningCount.includes(searchVal)
                            || tempStartDate.includes(searchVal) || tempEndDate.includes(searchVal)) {
                                tempCompetitions.push({
                                    no,
                                    id: item.id,
                                    ...data
                                });
                                no ++;

                            }
                        } else {
                            tempCompetitions.push({
                                no,
                                id: item.id,
                                ...data
                            });
                            no ++;
                        }
                    }
                });

                setRows([...tempCompetitions]);
                setPage(0);
            })
            .catch(error => {
                toast.error(error.message);
            });
    };

    useEffect(() => {
        setMaxHeight(`${(window.innerHeight - document.getElementById('admin-header').offsetHeight - 10)}px`);
        onLoadCompetitions();
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

        if (selectedId == '') {
            competitionInfo.status = true;
            firestore.collection('competitions')
                .doc(`${grade + '_' + competitionName}`)
                .set(competitionInfo, {merge: true})
                .then(docRef => {
                    toast.success('Successfully Added!');
                    onLoadCompetitions();
                    onToggleDialog();
                })
                .catch(error => {
                    setErrorMessage(error);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            firestore.collection('competitions')
                .doc(selectedId)
                .set({
                    ...competitionInfo
                }, {merge: true})
                .then(docRef => {
                    toast.success('Successfully Updated!');
                    let curRows = rows;
                    curRows = curRows.map((item, index) => {
                        if (item.id == selectedId) {
                            item = {id: selectedId, no: (index + 1), status: item.status, ...competitionInfo};
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

    const onDeleteAnswer = (key) => {
        totalProblems.splice(key, 1);
        setTotalProblems([...totalProblems]);

        setSelectedProblems([]);
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

    const onChangeAnswer = (val, key) => {
        let items = [...totalProblems];
        items[key] = val;
        setTotalProblems(items);
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
                                                <GradeButton number={val} onClick={() => {
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
                                                <CompetitionButton name={val} onClick={() => {
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
                <div className='row' style={{height: '100px'}}>
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
                <DialogButton disabled={loading} type='submit' width={'100px'} title={'Save'}/>
            </DialogActions>
        </form>
    </Dialog>);

    return (
        <div style={{height: '100px'}}>
            {
                <ToastContainer
                    position='top-center'
                    autoClose={2000}
                    traggle/>
            }
            {
                dialog
            }
            <DlgDeleteConfirm title="Do you really want to delete?" open={openDeleteDialog} loading={deleteLoading} onNo={() => {setOpenDeleteDialog(false)}} onYes={() => onDeleteCompetition(selectedId)}/>
            <div className='row justify-content-center align-items-center py-2' id='admin-header'>
                <div className='col-lg-4 col-sm-12'>
                    <h2 className='my-0'>Competitions</h2>
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
                                    onLoadCompetitions(searchText);
                                }
                            }}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => {
                                            onLoadCompetitions(searchText)
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
                                                <TableRow hover role="checkbox" tabIndex={-1} key={key}>
                                                    {columns.map((column, key) => {
                                                        const value = row[column.id];
                                                        if (column.id == 'grade') {
                                                            return (
                                                                <TableCell key={`body_${key}`} align='center'>
                                                                    <GradeButton number={value} selected={true}/>
                                                                </TableCell>
                                                            )
                                                        } if (column.id == 'competitionName') {
                                                            return (
                                                                <TableCell key={`body_${key}`} align='center'>
                                                                    <CompetitionButton name={value} selected={true}/>
                                                                </TableCell>
                                                            )
                                                        } if (column.id == 'selectedProblems') {
                                                            return (
                                                                <TableCell key={`body_${key}`}>
                                                                    {value.map(item => (item.problemName)).join(', ')}
                                                                </TableCell>
                                                            )
                                                        } if (column.id == 'dateTime') {
                                                            return (
                                                                <TableCell key={`body_${key}`}>
                                                                    {new Date(value.seconds * 1000).toLocaleString()}
                                                                </TableCell>
                                                            )
                                                        }
                                                        else if (column.id == 'status') {
                                                            return (
                                                                <TableCell key={`body_${key}`}>
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
                                                                <TableCell key={`body_${key}`} className='text-right'>
                                                                    <IconButton color='primary'
                                                                                size='small'
                                                                                onClick={() => onEditCompetition(row)}>
                                                                        <EditIcon/>
                                                                    </IconButton>
                                                                    &nbsp;
                                                                    <IconButton color='secondary'
                                                                                size='small'
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
                                                                <TableCell key={`body_${key}`} align={column.align}>
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
export default Competitions;

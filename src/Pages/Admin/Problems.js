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
import BtnDialogConfirm from "../../Components/Common/BtnDialogConfirm";
import BtnGrade from "../../Components/Common/BtnGrade";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Checkbox from "@material-ui/core/Checkbox";
import ListItemText from "@material-ui/core/ListItemText";
import BtnCompetitionName from "../../Components/Common/BtnCompetitionName";
import Yamde from "yamde";
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

const initAnswers = ['A', 'B', 'C', 'D', 'E'];

const Problems = (props) => {

    const columns = [
        { id: 'no', label: 'No', width: 60 },
        { id: 'problemName', label: 'Problem Name', minWidth: 170 },
        { id: 'grade', label: 'Grade', minWidth: 170 },
        { id: 'competitionName', label: 'Competition Name', minWidth: 170 },
        { id: 'question', label: 'Question Content', minWidth: 170 },
        { id: 'answers', label: 'Answers', minWidth: 170 },
        { id: 'correctAnswer', label: 'Correct Answer', minWidth: 170, textAlign: 'center'},
        { id: 'dateTime', label: 'Created At', minWidth: 170 },
        { id: 'action', label: 'Action', width: '140px' },
    ];

    const [maxHeight, setMaxHeight] = useState('none');

    window.onresize = function () {

        let adminHeader = document.getElementById('admin-header').offsetHeight;
        let tempHeight = window.innerHeight - adminHeader - 10;

        setMaxHeight(`${tempHeight}px`);
    };

    const [answers, setAnswers] = useState(initAnswers);
    const [correctAnswer, setCorrectAnswer] = useState('');

    const [rows, setRows] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // table setting
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('desc');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    // //////

    const [searchText, setSearchText] = useState('');
    const [modalTitle, setModalTitle] = useState('Add New Problem');
    const [selectedId, setSelectedId] = useState('');
    const [problemName, setProblemName] = useState('');
    const [grade, setGrade] = useState(0);
    const [question, setQuestion] = useState('');
    const [competitionName, setCompetitionName] = useState('');

    const [loading, setLoading] = useState(false);

    const classes = useStyles();


    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const onLoadProblems = (searchVal = '') => {
        firestore.collection('problems').orderBy('dateTime', 'desc')
            .get()
            .then(problemRef => {
                let tempProblems = [];
                let no = 1;
                problemRef.docs.forEach(item => {
                    if (item.exists) {
                        let data = item.data();

                        let problemName = data.problemName ? data.problemName : '';
                        let grade = data.grade ? data.grade.toString() : '';
                        let competitionName = data.competitionName ? data.competitionName : '';
                        let question = data.question ? data.question : '';

                        if (searchVal != '') {
                            if (problemName.includes(searchVal) || grade.includes(searchVal) || competitionName.includes(searchVal)
                            || question.includes(searchVal)) {
                                tempProblems.push({
                                    no,
                                    id: item.id,
                                    ...data
                                });
                                no ++;
                            }
                        } else {
                            tempProblems.push({
                                no,
                                id: item.id,
                                ...data
                            });
                            no ++;
                        }
                    }
                });

                setRows([...tempProblems]);
                setPage(0);

            })
            .catch(error => {
                toast.error(error.message);
            });
    };

    useEffect(() => {
        setMaxHeight(`${(window.innerHeight - document.getElementById('admin-header').offsetHeight - 10)}px`);
        onLoadProblems();
    }, []);

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const onToggleDialog = () => {
        setOpenDialog(!openDialog);
    };

    const onSaveProblem = async (event) => {
        event.preventDefault();

        if (correctAnswer == undefined || correctAnswer == '') {
            toast.warning('Please select correct answer!');
            return;
        }

        setLoading(true);

        let problemInfo = {
            problemName,
            question,
            grade,
            competitionName,
            answers,
            correctAnswer,
            dateTime: new Date()
        };

        if (selectedId == '') {

            firestore.collection('problems')
                .add(problemInfo)
                .then(docRef => {
                    toast.success('Successfully Added!');
                    onLoadProblems();
                    onToggleDialog();
                })
                .catch(error => {
                    toast.error(error.message);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            firestore.collection('problems')
                .doc(selectedId)
                .set({
                    ...problemInfo
                }, {merge: true})
                .then(docRef => {
                    toast.success('Successfully Updated!');
                    let curRows = rows;
                    curRows = curRows.map((item, index) => {
                        if (item.id == selectedId) {
                            item = {id: selectedId, no: (index + 1),  ...problemInfo};
                        }

                        return item;
                    });

                    setRows([...curRows]);
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

    const onEditProblem = (row) => {
        setSelectedId(row.id);

        setProblemName(row.problemName);
        setCompetitionName(row.competitionName);
        setGrade(row.grade);
        setQuestion(row.question);

        setAnswers(row.answers);
        setCorrectAnswer(row.correctAnswer);

        setModalTitle('Update Current Problem');

        onToggleDialog();
    };

    const onAddProblem = () => {
        setSelectedId('');
        setProblemName('');
        setQuestion('');

        setGrade('');
        setCompetitionName('');
        setAnswers([...initAnswers]);
        setCorrectAnswer('');

        setModalTitle('Add New Problem');
        onToggleDialog();
    };

    const onDeleteProblem = async (problem_id) => {

        setDeleteLoading(true);
        firestore.collection('problems').doc(problem_id)
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

    const onChangeCorrectAnswer = (event) => {
        setCorrectAnswer(event.target.value);
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
        answers.splice(key, 1);
        setAnswers([...answers]);

        setCorrectAnswer('');
    };

    const onChangeAnswer = (val, key) => {
        let items = [...answers];
        items[key] = val;
        setAnswers(items);
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
        <form onSubmit={onSaveProblem} autoComplete="off">
            <DialogTitle className='text-center' style={{color: COLOR_DLG_TITLE}}>{modalTitle}</DialogTitle>
            <DialogContent>
                <div className='row py-2 align-items-center justify-content-center'>
                    <div className='col-lg-5 col-sm-10 px-2'>
                        <TextField
                            autoFocus
                            label="Problem Name"
                            type="text"
                            value={problemName}
                            onChange={(e) => setProblemName(e.target.value)}
                            fullWidth
                            required
                        />
                    </div>
                    <div className='col-lg-5 col-sm-10 px-2'>
                        <div className='row align-items-center'>
                            <div className='col-lg-3 col-sm-12 text-left'>
                                Grade
                            </div>
                            <div className='col-lg-9 col-sm-12 justify-content-around' style={{display: "flex"}}>
                                {
                                    [6, 7, 8, 9, 10].map((val, key) => {
                                        return (
                                            <div className='px-2' key={key} >
                                                <BtnGrade number={val} onClick={() => setGrade(val)} selected={val == grade ? true : false}/>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div className='row py-2 align-items-center justify-content-center'>
                    <div className='col-10'>
                        Question Content
                    </div>
                    <div className='col-10'>
                        <Yamde value={question} handler={setQuestion} theme="light" />
                    </div>
                </div>

                <div className='row py-2 align-items-center justify-content-center'>
                    <div className='col-lg-10 col-sm-10 px-2'>
                        <div className='row align-items-center'>
                            <div className='col-lg-4 col-sm-12 text-left'>
                                Competition Name
                            </div>
                            <div className='col-lg-8 col-sm-12 justify-content-around' style={{display: "flex"}}>
                                {
                                    ['MST', 'MSO', 'HST', 'HSO'].map((val, key) => {
                                        return (
                                            <div className='px-2' key={key}>
                                                <BtnCompetitionName name={val} onClick={() => setCompetitionName(val)} selected={val == competitionName ? true : false}/>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </div>
                    <div className='col-lg-5 col-sm-10 px-2'>

                    </div>
                </div>
                <div className='row py-2 align-items-center justify-content-center'>
                    <div className='col-lg-5 col-sm-10 px-2 text-center'>
                        <div className='row'>
                            <div className='col-12'>
                                <label>
                                    Create Answers:
                                </label>
                                &nbsp;&nbsp;
                                <IconButton variant='outlined' size="medium" color='secondary' onClick={() => setAnswers([...answers, ''])}>
                                    <AddIcon/>
                                </IconButton>
                            </div>
                        </div>
                    </div>
                    <div className={'col-lg-5 col-sm-10 px-2 text-center'}>
                        {
                            answers.map((item, key) => (
                                <FormControl fullWidth key={key} style={{paddingBottom: '5px'}}>
                                    <InputLabel htmlFor="filled-adornment-password">Answer - {key + 1}</InputLabel>
                                    <Input
                                        type={'text'}
                                        value={item}
                                        onChange={(e) => {
                                            onChangeAnswer(e.target.value, key)
                                            setCorrectAnswer('');
                                        }}
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={() => {
                                                        onDeleteAnswer(key);
                                                    }}
                                                    edge="end"
                                                    title={`Delete Answer - ${key + 1}`}
                                                >
                                                    <DeleteIcon/>
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                    />
                                </FormControl>
                            ))
                        }
                    </div>
                </div>
                <div className='row py-2 align-items-center justify-content-center'>
                    <div className='col-lg-5 col-sm-10 px-2'>
                        <FormControl fullWidth>
                            <InputLabel id="demo-mutiple-checkbox-label">Correct Answer</InputLabel>
                            <Select
                                labelId="demo-mutiple-checkbox-label"
                                id="demo-mutiple-checkbox"
                                value={correctAnswer}
                                onChange={onChangeCorrectAnswer}
                                input={<Input />}
                                MenuProps={MenuProps}
                            >
                                {answers.map((name, key) => (
                                    <MenuItem key={key} value={name}>
                                        <ListItemText primary={name} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                    <div className='col-lg-5 col-sm-10 px-2'>
                    </div>
                </div>
            </DialogContent>
            <DialogActions className='justify-content-center py-3'>
                <BtnDialogConfirm disabled={loading} backgroundColor={COLOR_CANCEL_BUTTON} width={'100px'} type='button' onClick={onToggleDialog} title={'Cancel'}/>
                <BtnDialogConfirm disabled={loading} type='submit' width={'100px'} title={selectedId != '' ? 'Update' : 'Add'}/>
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
            <DlgDeleteConfirm title="Do you really want to delete?" open={openDeleteDialog} disabled={deleteLoading} onNo={() => {setOpenDeleteDialog(false)}} onYes={() => onDeleteProblem(selectedId)}/>
            <div className='row justify-content-center align-items-center py-2' id='admin-header'>
                <div className='col-lg-4 col-sm-12'>
                    <h2 className='my-0'>Problem List</h2>
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
                                    onLoadProblems(searchText);
                                }
                            }}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => {
                                            onLoadProblems(searchText)
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
                    <Button variant='contained' onClick={() => onAddProblem()} startIcon={<AddIcon/>} style={{backgroundColor: COLOR_ADMIN_MAIN, color: '#fff'}} className='float-right'>Add</Button>
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
                                            style={{ minWidth: column.minWidth, width: column.width, textAlign: column.textAlign}}
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
                                                        } if (column.id == 'answers') {
                                                            return (
                                                                <TableCell key={`body_${subKey}`}>
                                                                    {value.join(', ')}
                                                                </TableCell>
                                                            )
                                                        } if (column.id == 'dateTime') {
                                                            return (
                                                                <TableCell key={`body_${subKey}`}>
                                                                    {new Date(value.seconds * 1000).toLocaleString()}
                                                                </TableCell>
                                                            )
                                                        }
                                                        else if (column.id == 'action') {
                                                            return (
                                                                <TableCell key={`body_${subKey}`}
                                                                           className='text-right'>
                                                                    <IconButton color='primary'
                                                                                size='small'
                                                                                onClick={() => onEditProblem(row)}>
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
                                                        } else if (column.id == 'correctAnswer') {
                                                            return (
                                                                <TableCell key={`body_${subKey}`} align={column.align} style={{textAlign: 'center'}}>
                                                                    {column.format && typeof value === 'number' ? column.format(value) : value}
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
export default Problems;

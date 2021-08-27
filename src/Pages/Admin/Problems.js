import React, {useEffect, useState} from "react";
import 'react-pro-sidebar/dist/css/styles.css';

import {TableContainer, Table, TableHead, TableBody, TableRow, makeStyles,
    TableCell, TextareaAutosize, TablePagination, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from "@material-ui/core";
import {AddCircle as AddIcon} from "@material-ui/icons";
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {firestore} from "../../firebase";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import IconButton from "@material-ui/core/IconButton";
import {Delete as DeleteIcon, Edit as EditIcon, Visibility as ViewIcon , Search as SearchIcon, CloudUpload as UploadIcon} from "@material-ui/icons";
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
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Checkbox from "@material-ui/core/Checkbox";
import ListItemText from "@material-ui/core/ListItemText";
import BtnCompetitionName from "../../Components/Common/BtnCompetitionName";
import {getComparator, stableSort} from "../../Utils/CommonFunctions";
import CSVReader from 'react-csv-reader';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

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
        paddingTop: '40px',
        marginBottom: '14%'
    },
    fileInput: {
        display: 'none'
    }
}));

const initAnswers = [
    { key: 'A', value: ''},
    { key: 'B', value: ''},
    { key: 'C', value: ''},
    { key: 'D', value: ''},
    { key: 'E', value: ''}
];

let uploadData = [];

const Problems = (props) => {

    const columns = [
        { id: 'no', label: 'No', width: 60 },
        { id: 'problemName', label: 'Problem Name', minWidth: 170 },
        { id: 'competitionName', label: 'Competition Name', minWidth: 170, align: 'center' },
        { id: 'question', label: 'Question Content', minWidth: 170 },
        { id: 'answers', label: 'Answers', minWidth: 170 },
        { id: 'correctAnswer', label: 'Correct Answer', minWidth: 170, textAlign: 'center'},
        { id: 'dateTime', label: 'Created At', minWidth: 170 },
        { id: 'action', label: 'Action', width: '140px' },
    ];

    const [maxHeight, setMaxHeight] = useState('none');

    window.onresize = function () {

        if (document.getElementById('admin-header')) {
            let adminHeader = document.getElementById('admin-header').offsetHeight;
            let tempHeight = window.innerHeight - adminHeader - 10;

            setMaxHeight(`${tempHeight}px`);
        }
    };

    const [answers, setAnswers] = useState(initAnswers);
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [compNameForUpload, setCompNameForUpload] = useState('');
    const [uploadLoading, setUploadLoading] = useState(false);
    const [openUploadDialog, setUploadDialog] = useState(false);

    const [openViewDialog, setOpenViewDialog] = useState(false);

    const [previewQuestion, setPreviewQuestion] = useState('');
    const [previewAnswers, setPreviewAnswers] = useState([]);

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
    const [question, setQuestion] = useState('');
    const [competitionName, setCompetitionName] = useState('');

    const [filterCompNames, setFilterCompNames] = useState([]);

    const [loading, setLoading] = useState(false);

    const classes = useStyles();

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    useEffect(() => {
        onLoadProblems();
    }, [filterCompNames]);

    const papaparseOptions = {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        transformHeader: header =>
            header
                .toLowerCase()
                .replace(/\W/g, '_')
    };

    const onPreviewQuestion = (row) => {
        setPreviewQuestion(row.question);
        setPreviewAnswers([...row.answers]);

        setOpenViewDialog(true);
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

    const onLoadProblems = () => {

        props.onLoading(true);
        firestore.collection('problems').orderBy('dateTime', 'desc')
            .get()
            .then(problemRef => {
                let tempProblems = [];
                let no = 1;
                problemRef.docs.forEach(item => {
                    if (item.exists) {
                        let data = item.data();

                        let tempProblemName = data.problemName ? data.problemName.toString() : '';
                        let tempCompetitionName = data.competitionName ? data.competitionName : '';
                        let tempQuestion = data.question ? data.question : '';

                        if (filterCompNames.length > 0) {
                            if (!filterCompNames.includes(tempCompetitionName)) {
                                return;
                            }
                        }

                        if (searchText !== '') {
                            if (!tempProblemName.includes(searchText) && !tempCompetitionName.includes(searchText)
                                && !tempQuestion.includes(searchText)) {
                                return;
                            }
                        }

                        tempProblems.push({
                            no,
                            id: item.id,
                            ...data
                        });
                        no ++;
                    }
                });

                setRows([...tempProblems]);
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

    const onSaveProblem = async (event) => {
        event.preventDefault();

        if (competitionName == '') {
            toast.warning('Please select Competition Name!');
            return;
        }

        if (correctAnswer == null) {
            toast.warning('Please select correct answer!');
            return;
        }

        setLoading(true);

        let problemInfo = {
            problemName,
            question,
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
                            item = {...problemInfo, dateTime: item.dateTime, id: selectedId, no: (index + 1)};
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

    const onSelectCorrectAnswer = (event) => {
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

    const onFileUpload = async (data) => {

        if (!compNameForUpload) {
            toast.warning('please select competition name.');
            return;
        }

        setUploadLoading(true);

        for (let i = 0; i < data.length; i++) {
            let tempData = data[i];
            let keys = Object.keys(tempData);

            if (!keys.includes('correct_answer') && !keys.includes('question')) {
                continue;
            }

            let insCorrectAnswer = tempData['correct_answer'];
            let insQuestion = tempData['question'];
            let insQuestionName = tempData['question_name'] ? tempData['question_name'] : 'problem ' + i;

            let tempAnswers = keys.filter(item => {
                if (item.includes('answer_')) {
                    return true;
                }
                return false;
            });

            let answerCount = 0;

            let insAnswers = [];

            for (let j = 0; j < tempAnswers.length; j++) {
                let answerKey = tempAnswers[j];

                if (tempData[answerKey]) {
                    let tempArr = answerKey.split('_');
                    if (tempArr.length > 1) {
                        insAnswers.push({
                            key: tempArr[1].toUpperCase(),
                            value: tempData[answerKey]
                        });
                        answerCount++;
                    }
                }
            }

            if (answerCount < tempAnswers.length - 1) {
                continue;
            }

            // save
            await firestore.collection('problems').add({
                problemName: insQuestionName,
                competitionName: compNameForUpload,
                answers: insAnswers,
                dateTime: new Date(),
                correctAnswer: insCorrectAnswer,
                question: insQuestion
            })
        }

        setUploadLoading(false);
        setUploadDialog(false);

        onLoadProblems();
    };

    const onFileLoaded = async (data, fileInfo) => {

        uploadData = [...data];

        setUploadDialog(true);
    };

    const onUploadError = () => {
    };

    const onChangeAnswerKey = (key, answer) => {
        answer.key = key;
        setAnswers([...answers]);
    };
    const onChangeAnswerValue = (value, answer) => {
        answer.value = value;
        setAnswers([...answers]);
    };

    const addDialog = (<Dialog open={openDialog}
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
                                                <BtnCompetitionName name={val} onClick={() => setCompetitionName(val)} selected={val === competitionName}/>
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
                    <div className='col-10'>
                        Question Content
                    </div>
                    <div className='col-10'>
                        <textarea
                            required={true}
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)} style={{width: '100%', resize: 'none', minHeight: '200px', maxHeight: '300px', overflow: 'auto'}}/>
                    </div>
                </div>
                <div className='row py-2 align-items-center justify-content-center'>
                    <div className='col-10' style={{paddingBottom: '10px'}}>
                        Question Preview
                    </div>
                    <div className='col-10'>
                        <pre className='latex-content' style={{minHeight: '100px', maxHeight: '400px', border: 'solid 2px #6f6f6f', padding: 4}}>
                            <Latex>{question}</Latex>
                        </pre>
                    </div>
                </div>
                <div className='row py-2 align-items-center justify-content-center'>
                    <div className='col-10' style={{paddingBottom: '10px'}}>
                        Answer Preview
                    </div>
                    <div className='col-10'>
                        <div style={{ border: 'solid 2px #6f6f6f', display: 'flex', flexWrap: 'warp', padding: '10px'}}
                             className='row mx-0'>
                            {
                                answers.map((ans, key) => {
                                    return (
                                        <div key={key} className='col-lg-2 py-2 col-sm-6'>
                                            <Latex>{ans.key ? ans.key + ') ' + ans.value : ''}</Latex>
                                        </div>
                                        )
                                })
                            }
                        </div>

                    </div>
                </div>

                <div className='row py-2 align-items-center justify-content-center'>
                    <div className='col-lg-3 col-sm-10 px-2 text-center'>
                        <div className='row'>
                            <div className='col-12'>
                                <label>
                                    Create Answers:
                                </label>
                                &nbsp;&nbsp;
                                <IconButton variant='outlined' size="medium" color='secondary' onClick={() => setAnswers([...answers, {key: '', value: ''}])}>
                                    <AddIcon/>
                                </IconButton>
                            </div>
                        </div>
                    </div>
                    <div className={'col-lg-7 col-sm-10 px-2 text-center'}>
                        {
                            answers.map((item, key) => (
                                <div key={key} style={{display: 'flex', paddingBottom: '5px'}} >
                                    <TextField
                                        autoFocus
                                        label={`${key + 1} - label`}
                                        type="text"
                                        value={item.key}
                                        onChange={(e) => {
                                            onChangeAnswerKey(e.target.value, item);
                                            setCorrectAnswer('');
                                        }}
                                        style={{width: '30%'}}
                                        fullWidth
                                        required
                                    />
                                    &nbsp;&nbsp;
                                    <FormControl fullWidth key={key} style={{paddingBottom: '5px'}} required={true}>
                                        <InputLabel htmlFor="filled-adornment-password">{key + 1} - value</InputLabel>
                                        <Input
                                            type={'text'}
                                            value={item.value}
                                            onChange={(e) => {
                                                onChangeAnswerValue(e.target.value, item);
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
                                </div>
                            ))
                        }
                    </div>
                </div>
                <div className='row py-2 align-items-center justify-content-center'>
                    <div className='col-lg-5 col-sm-10 px-2'>
                        <FormControl fullWidth required={true}>
                            <InputLabel id="demo-mutiple-checkbox-label">Correct Answer</InputLabel>
                            <Select
                                labelId="demo-mutiple-checkbox-label"
                                id="demo-mutiple-checkbox"
                                value={correctAnswer}
                                onChange={onSelectCorrectAnswer}
                                input={<Input />}
                                MenuProps={MenuProps}
                            >
                                {answers.map((ansItem, key) => (
                                    <MenuItem key={key} value={ansItem.key}>
                                        <ListItemText primary={ansItem.key} />
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

    const viewDialog = (<Dialog open={openViewDialog}
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
                                   setOpenViewDialog()
                               }}
                               aria-labelledby="form-dialog-title">
        <DialogTitle className='text-center' style={{color: COLOR_DLG_TITLE}}>Question View</DialogTitle>
        <DialogContent>
            <div className='row py-2 align-items-center justify-content-center'>
                <div className='col-10' style={{border: 'solid 2px #6f6f6f'}}>
                        <pre className='latex-content' style={{padding: 4}}>
                            <Latex>{previewQuestion}</Latex>
                        </pre>
                    <div style={{ display: 'flex', flexWrap: 'warp', padding: '10px'}}
                         className='row mx-0'>
                        {
                            previewAnswers.map((ans, key) => {
                                return (
                                    <div key={key} className='col-lg-2 py-2 col-sm-6'>
                                        <Latex>{ans.key ? ans.key + ') ' + ans.value : ''}</Latex>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        </DialogContent>
        <DialogActions className='justify-content-center py-3'>
            <BtnDialogConfirm disabled={loading} backgroundColor={COLOR_CANCEL_BUTTON} width={'100px'} type='button' onClick={() => setOpenViewDialog(false)} title={'Close'}/>
        </DialogActions>
    </Dialog>);

    const uploadDialog = (<Dialog open={openUploadDialog}
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
                                   setUploadDialog(false);
                               }}
                               aria-labelledby="form-dialog-title">
            <DialogTitle className='text-center' style={{color: COLOR_DLG_TITLE}}>Please select competition name for upload.</DialogTitle>
            <DialogContent>
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
                                                <BtnCompetitionName name={val} onClick={() => setCompNameForUpload(val)} selected={val === compNameForUpload}/>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
            <DialogActions className='justify-content-center py-3'>
                <BtnDialogConfirm disabled={uploadLoading} backgroundColor={COLOR_CANCEL_BUTTON} width={'100px'} type='button' onClick={() => setUploadDialog(false)} title={'Cancel'}/>
                <BtnDialogConfirm disabled={uploadLoading} onClick={() => onFileUpload(uploadData)} type='type' width={'100px'} title='Upload'/>
            </DialogActions>
    </Dialog>);

    return (
        <div>
            <ToastContainer
                position='top-center'
                autoClose={2000}
                traggle/>
            {
                addDialog
            }
            {
                uploadDialog
            }
            {
                viewDialog
            }
            <DlgDeleteConfirm title="Do you really want to delete?" open={openDeleteDialog} disabled={deleteLoading} onNo={() => {setOpenDeleteDialog(false)}} onYes={() => onDeleteProblem(selectedId)}/>
            <div className='row justify-content-center align-items-center py-2' id='admin-header'>
                <div className='col-lg-12 col-sm-12'>
                    <h2 className='my-1'>Problem List</h2>
                </div>
                <div className='col-lg-4 col-sm-12'>
                    <div className='row align-items-center'>
                        <div className='col-lg-3 col-sm-12 text-left'>
                            Filter By:
                        </div>
                        <div className='col-lg-9 col-sm-12 justify-content-center' style={{display: "flex"}}>
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
                                    onLoadProblems();
                                }
                            }}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => {
                                            onLoadProblems()
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
                    <CSVReader
                        cssClass="csv-reader-input"
                        id='contained-button-file'
                        onClick
                        onFileLoaded={onFileLoaded}
                        onError={onUploadError}
                        parserOptions={papaparseOptions}
                        inputId="ObiWan"
                        inputName="ObiWan"
                        inputStyle={{color: 'red'}}
                    />
                    <label htmlFor="ObiWan" className='my-0'>
                        <Button variant="contained" style={{backgroundColor: COLOR_CANCEL_BUTTON}} color="primary" component="span">
                            <UploadIcon/>&nbsp;Upload
                        </Button>
                    </label>
                    &nbsp;&nbsp;
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
                                                        if (column.id == 'competitionName') {
                                                            return (
                                                                <TableCell key={`body_${subKey}`} align='center'>
                                                                    <BtnCompetitionName name={value} selected={true}/>
                                                                </TableCell>
                                                            )
                                                        } else if (column.id == 'question') {
                                                            return (
                                                                <TableCell key={`body_${subKey}`}>
                                                                    <Latex>{value.length > 200 ? value.slice(0, 197) + '...' : value}</Latex>
                                                                </TableCell>
                                                            )
                                                        } else if (column.id == 'answers') {
                                                            return (
                                                                <TableCell key={`body_${subKey}`}>
                                                                    {value.map(item => {
                                                                        return item.key
                                                                    }).join(', ')}
                                                                </TableCell>
                                                            )
                                                        } else if (column.id == 'dateTime') {
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
                                                                                title="View Question Info"
                                                                                onClick={() => onPreviewQuestion(row)}>
                                                                        <ViewIcon/>
                                                                    </IconButton>
                                                                    &nbsp;
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

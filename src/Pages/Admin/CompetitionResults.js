import React, {useEffect, useState} from "react";
import 'react-pro-sidebar/dist/css/styles.css';

import {TableContainer, Table, TableHead, TableBody, TableRow, makeStyles,
    TableCell, TablePagination, Button
} from "@material-ui/core";
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {firestore} from "../../firebase";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import IconButton from "@material-ui/core/IconButton";
import {Delete as DeleteIcon, Search as SearchIcon, Bookmarks as BookmarksIcon } from "@material-ui/icons";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import InputAdornment from "@material-ui/core/InputAdornment";
import Input from "@material-ui/core/Input";
import DlgDeleteConfirm from "../../Components/Admin/DlgDeleteConfirm";
import {
    COLOR_ADMIN_MAIN,
    COLOR_DLG_BORDER_BLUE,
} from "../../Utils/ColorConstants";
import BtnGrade from "../../Components/Common/BtnGrade";

import BtnCompetitionName from "../../Components/Common/BtnCompetitionName";
import {getComparator, stableSort} from "../../Utils/CommonFunctions";

const initLimitWarningCount = 15;
const initLimitTime = 20;

const correctMark = 5;
const wrongMark = 0;
const unselectedMark = 1;

let selectedUserId = '';
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
        paddingBottom: '40px',
        paddingTop: '40px',
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
        { id: 'problemCount', label: 'Problem Count', width: 120 },
        { id: 'correctCount', label: 'Correct Count', width: 120 },
        { id: 'wrongCount', label: 'Wrong Count', width: 120 },
        { id: 'unselectedCount', label: 'Unselected Count', width: 120 },
        { id: 'startedAt', label: 'Competition Time', minWidth: 250 },
        { id: 'action', label: 'Action', width: 140, textCenter: 'center' }
    ];

    const [maxHeight, setMaxHeight] = useState('none');

    window.onresize = function () {

        let adminHeader = document.getElementById('admin-header').offsetHeight;
        let tempHeight = window.innerHeight - adminHeader - 10;

        setMaxHeight(`${tempHeight}px`);
    };

    const [rows, setRows] = useState([]);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);

    // table setting
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('desc');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    // //////

    const [searchText, setSearchText] = useState('');

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

    const getCompetitionResultInfo = (insProblems) => {
        let correctCount = 0;
        let wrongCount = 0;
        let unselectedCount = 0;

        insProblems.forEach(prob => {
            if (prob.selectedAnswer) {
                if (prob.correctAnswer == prob.selectedAnswer) {
                    correctCount ++;
                } else {
                    wrongCount ++;
                }
            } else {
                unselectedCount ++;
            }
        });

        return {
            correctCount, wrongCount, unselectedCount
        };
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
                                if (!tempData.competitionName.includes(searchText) && !'Awaiting'.includes(searchText)
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

    const onMakeAllScores = async () => {
        setConfirmLoading(true);

        let curRows = rows;

        for (let i = 0; i < curRows.length; i++) {
            let tempRow = curRows[i];

            let tempCompetitions = tempRow.competitions;

            for (let j = 0; j < tempCompetitions.length; j++) {
                let tempCompetition = tempCompetitions[j];
                if (tempCompetition.score) {
                    continue;
                }

                let compResultInfo = getCompetitionResultInfo(tempCompetition.problems);
                let correctCount = compResultInfo.correctCount;
                let wrongCount = compResultInfo.wrongCount;
                let unselectedCount = compResultInfo.unselectedCount;

                let totalScore = correctMark * correctCount + wrongMark * wrongCount + unselectedMark * unselectedCount;


                // save to db
                let path = `users/${tempRow.id}/competitions`;

                await firestore.collection(path).doc(tempCompetition.competitionId)
                    .set({
                        score: totalScore
                    }, {merge: true});

                tempCompetition.score = totalScore;
            }
        }

        setRows([
            ...curRows
        ]);
        toast.success('Scored all successfully');
        setOpenConfirmDialog(false);
        setConfirmLoading(false);
    };

    const onMakeScoreRow = (row, compInfo, competitionResultInfo) => {
        props.onLoading(true);

        let correctCount = competitionResultInfo.correctCount;
        let wrongCount = competitionResultInfo.wrongCount;
        let unselectedCount = competitionResultInfo.unselectedCount;

        let totalScore = correctMark * correctCount + wrongMark * wrongCount + unselectedMark * unselectedCount;

        // save
        let path = `users/${row.id}/competitions`;

        firestore.collection(path).doc(compInfo.competitionId).set({
            score: totalScore
        }, {merge: true})
            .then(() => {
                toast.success('Scored successfully!',{
                    autoClose: 1000
                });
                let newRows = rows.map(rowInfo => {
                   if (rowInfo.id == row.id) {
                        row.competitions = row.competitions.map(comp => {
                            if (comp.competitionId == compInfo.competitionId) {
                                comp.score = totalScore;
                            }

                            return comp;
                        })
                   }
                   return rowInfo;
                });

                setRows([...newRows]);
            })
            .catch(error => {
                toast.error(error.message);
            })
            .finally(() => {
                props.onLoading(false);
            })
    };

    const onDeleteCompetition = async (user_id, competition_id) => {
        setDeleteLoading(true);

        firestore.collection(`users/${user_id}/competitions`).doc(competition_id)
            .delete()
            .then(() => {
                toast.success('Successfully deleted!');
                let curRows = rows;
                curRows = curRows.map(userInfo => {
                    if (userInfo.id == user_id) {
                        userInfo.competitions = userInfo.competitions.filter(comp => {
                            if (comp.competitionId != competition_id) {
                                return true;
                            }

                            return false;
                        })
                    }
                    return userInfo;
                });

                setRows([...curRows]);
            }).catch(error => {
            toast.error(error.message);
        }).finally(() => {
            setDeleteLoading(false);
            setOpenDeleteDialog(false);
        });
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

    return (
        <div>
            <ToastContainer
                position='top-center'
                autoClose={2000}
                traggle/>
            <DlgDeleteConfirm title="Do you really want to delete?" open={openDeleteDialog} disabled={deleteLoading} onNo={() => {setOpenDeleteDialog(false)}} onYes={() => onDeleteCompetition(selectedUserId, selectedCompId)}/>
            <DlgDeleteConfirm title='Confirmation' content="Do you wish to distribute all calculated scores to participants?" open={openConfirmDialog} disabled={confirmLoading} onNo={() => {setOpenConfirmDialog(false)}} onYes={() => onMakeAllScores()}/>
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
                    <Button variant='contained' onClick={() => setOpenConfirmDialog(true)} startIcon={<BookmarksIcon/>} style={{backgroundColor: COLOR_ADMIN_MAIN, color: '#fff'}} className='float-right'>All Scores</Button>
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

                                                                const competitionResultInfo = getCompetitionResultInfo(compInfo.problems);

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
                                                                                <BtnCompetitionName name={compInfo.score ? compInfo.score : 'Awaiting'} selected={true}/>
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
                                                                        <TableCell key={`body_${columnKey}`} align='center'>
                                                                            <BtnGrade number={compInfo.warningCount} selected={true}/>
                                                                        </TableCell>
                                                                    )
                                                                } else if (column.id == 'problemCount') {
                                                                    return (
                                                                        <TableCell key={`body_${columnKey}`} align='center'>
                                                                            <span style={{fontWeight: 'bolder', fontSize: 18}}>{compInfo.problems.length}</span>
                                                                        </TableCell>
                                                                    )
                                                                } else if (column.id == 'correctCount') {
                                                                    return (
                                                                        <TableCell key={`body_${columnKey}`} align='center'>
                                                                            <span style={{fontWeight: 'bolder', fontSize: 18}}>{competitionResultInfo.correctCount}</span>
                                                                        </TableCell>
                                                                    )
                                                                } else if (column.id == 'wrongCount') {
                                                                    return (
                                                                        <TableCell key={`body_${columnKey}`} align='center'>
                                                                            <span style={{fontWeight: 'bolder', fontSize: 18}}>{competitionResultInfo.wrongCount}</span>
                                                                        </TableCell>
                                                                    )
                                                                } else if (column.id == 'unselectedCount') {
                                                                    return (
                                                                        <TableCell key={`body_${columnKey}`} align='center'>
                                                                            <span style={{fontWeight: 'bolder', fontSize: 18}}>{competitionResultInfo.unselectedCount}</span>
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
                                                                                        title="Set score"
                                                                                        onClick={() => onMakeScoreRow(row, compInfo, competitionResultInfo)}>
                                                                                <BookmarksIcon/>
                                                                            </IconButton>
                                                                            &nbsp;
                                                                            <IconButton color='secondary'
                                                                                        size='small'
                                                                                        title="Delete Competition"
                                                                                        onClick={() => {
                                                                                            selectedUserId = row.id;
                                                                                            selectedCompId = compInfo.competitionId;
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

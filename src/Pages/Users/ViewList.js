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
    TableRow
} from "@material-ui/core";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import BtnGrade from "../../Components/Common/BtnGrade";
import BtnCompetitionName from "../../Components/Common/BtnCompetitionName";
import {getComparator, stableSort} from "../../Utils/CommonFunctions";
import {PictureAsPdf as PdfIcon} from '@material-ui/icons';
import {PDFDownloadLink}  from "@react-pdf/renderer";

import {
    COLOR_ADMIN_MAIN,
    COLOR_DLG_BORDER_BLUE,
    COLOR_DLG_TITLE
} from "../../Utils/ColorConstants";
import {ExitToApp} from "@material-ui/icons";
import Paper from "@material-ui/core/Paper";
import BtnCompetitionNumberSelect from "../../Components/User/BtnCompetitionNumberSelect";
import DlgDeleteConfirm from "../../Components/Admin/DlgDeleteConfirm";
import CompetitionPdf from "../../Components/User/CompetitionPdf";

let selectedCompId = '';
let selectedGrade = '';
let selectedCompName = '';
let selectedUserId = '';
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

    const [userCompetitionList, setUserCompetitionList] = useState([]);

    const [openConfirmDlg, setOpenConfirmDlg] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const [scoredSetting, setScoredSetting] = useState({
        page: 0,
        rowsPerPage: 100,
        order: 'score',
        orderBy: 'desc'
    });

    const ref = React.createRef();

    const classes = useStyles();

    const location = useLocation();

    const scoredCompColumns = [
        { id: 'no', label: 'Rank', width: 60 },
        { id: 'fullName', label: 'Name', width: 120},
        { id: 'grade', label: 'Grade'},
        { id: 'competitionName', label: 'Competition Name', width: 100 },
        { id: 'problemCount', label: 'Problem Count', width: 100 },
        { id: 'limitTime', label: 'Limit Time(min)', width: 100 },
        { id: 'limitWarningCount', label: 'Limit Warning Count', width: 150 },
        { id: 'warningCount', label: 'Warning Count', width: 150 },
        { id: 'startedAt', label: 'Competition Time', minWidth: 170 },
        { id: 'score', label: 'Score', width: 100}
    ];

    const compareScore = (a, b) => {
        if (a.score < b.score) {
            return 1;
        }
        if (a.score > b.score) {
            return -1;
        }

        return 0;
    };

    const onLoadUserCompetitions = () => {

        props.onLoading(true);
        selectedGrade = props.user.grade;
        selectedUserId = props.user.id;

        firestore.collection('users').get()
            .then(async usersRef => {
                props.onLoading(true);
                let tempUserCompList = [];
                for (let i = 0; i < usersRef.docs.length; i++) {
                    let userInfo = usersRef.docs[i];
                    if (!userInfo.exists) {
                        continue;
                    }

                    let tempData = userInfo.data();
                    let tempUserId = userInfo.id;

                    let compInfo = await firestore.collection(`users/${tempUserId}/competitions`)
                        .doc(selectedCompId)
                        .get();

                    if (!compInfo.exists) {
                        continue;
                    }

                    let compData = compInfo.data();

                    tempUserCompList.push({
                        id: tempUserId,
                        fullName: tempData.fullName,
                        grade: tempData.grade,
                        ...compData
                    });

                }
                tempUserCompList.sort(compareScore);

                // make no
                tempUserCompList = tempUserCompList.map((item, key) => {
                    return {
                        ...item,
                        no: key + 1
                    }
                });
                console.log('user comp list');
                console.log(tempUserCompList);
                setUserCompetitionList([...tempUserCompList]);

                props.onLoading(false);
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
            selectedCompName = location.state.competitionName;
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

    const onExportToPdf = () => {

    };

    const options = {
        orientation: 'A4',
        unit: 'cm',
        format: [21,29.7]
    };

    return (
        <div>
            <ToastContainer
                position='top-center'
                autoClose={2000}
                traggle/>
            <DlgDeleteConfirm title='Confirmation' content="Do you wish to export as PDF?" open={openConfirmDlg} disabled={confirmLoading} onNo={() => {setOpenConfirmDlg(false)}} onYes={() => onExportToPdf()}/>

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

            <div className='row' style={{paddingTop: '40px'}}>
                <div className='col-lg-2 col-sm-12'>
                </div>
                <div className='col-lg-8 col-sm-12 text-center'>
                    <h3 style={{color: COLOR_DLG_TITLE}}>Scored Competition List</h3>
                </div>
                <div className='col-lg-2 col-sm-12'>
                    <PDFDownloadLink
                        document={<CompetitionPdf data={userCompetitionList} header={scoredCompColumns} />}
                        fileName={selectedGrade + "-" + + selectedCompName + '_' + 'competition_result.pdf'}
                        style={{
                            textDecoration: "none",
                            padding: "10px",
                            color: "#4a4a4a",
                            backgroundColor: COLOR_ADMIN_MAIN,
                            borderRadius: '15px'
                        }}>
                        {({blob, url, loading, error}) => {
                            return (
                                loading  ?
                                    <>
                                        <PdfIcon/>
                                        &nbsp; Downloading
                                    </>
                                    :
                                    <>
                                        <PdfIcon/>
                                        &nbsp; Download Pdf
                                    </>
                            );
                        }}
                    </PDFDownloadLink>
                </div>
            </div>
            {
                props.user && props.user.status ?
                    <div className='row' ref={ref}>
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
                                            stableSort(userCompetitionList, getComparator(scoredSetting.order, scoredSetting.orderBy))
                                                .slice(scoredSetting.page * scoredSetting.rowsPerPage, scoredSetting.page * scoredSetting.rowsPerPage + scoredSetting.rowsPerPage)
                                                .map((row, key) => {
                                                    return (
                                                        <TableRow hover role="checkbox" tabIndex={-1} key={key}>
                                                            {scoredCompColumns.map((column, subKey) => {
                                                                const value = row[column.id];
                                                                if (column.id == 'fullName') {
                                                                    return (
                                                                        <TableCell key={`body_${subKey}`} align={column.align}>
                                                                            <span style={{color: row.id == props.user.id ? 'red' : '', }}>{value}</span>
                                                                        </TableCell>
                                                                    )
                                                                }
                                                                else if (column.id == 'grade') {
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
                                            userCompetitionList != null && userCompetitionList.length < 1 ? (
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

import React, {useEffect, useState} from "react";
import {useLocation} from 'react-router-dom';
import 'react-pro-sidebar/dist/css/styles.css';
import {makeStyles} from "@material-ui/core";
import ViewSlider from 'react-view-slider';

import {COLOR_CANCEL_BUTTON, COLOR_DLG_BORDER_BLUE, COLOR_DLG_TITLE} from "../../Utils/ColorConstants";
import BtnCompetitionNumberSelect from "../../Components/User/BtnCompetitionNumberSelect";
import BtnAnswerNumber from "../../Components/User/BtnAnswerNumber";
import BtnConfirm from "../../Components/User/BtnConfirm";
import {firestore} from "../../firebase";
import {toast, ToastContainer} from "react-toastify";
import CircularProgress from "@material-ui/core/CircularProgress";
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import BtnDialogConfirm from "../../Components/Common/BtnDialogConfirm";
import Dialog from "@material-ui/core/Dialog/Dialog";
import Latex from "react-latex-next/dist";

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        paddingTop: '30px'
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
    headerNumberContainer: {
        width: '100%',
        border: `solid 2px #6f6f6f`,
        borderRadius: 28,
        padding: '16px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center'
    },
    AnswerContainer: {
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        alignItems: 'center',
    }
}));

var competitionId = '';

const Competition = (props) => {
    const classes = useStyles();

    const [curProblemIndex, setCurProblemIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(null);

    const [currentCompetition, setCurrentCompetition] = useState(null);
    const [openWarningDlg, setOpenWarningDlg] = useState(false);
    const [openSubmitDlg, setOpenSubmitDlg] = useState(false);

    let timeInterval = null;
    const location = useLocation();

    const loadInitProblems = () => {
        if (competitionId != '') {
            // get current competition
            let user_id = props.user.id;
            let competition_path = `users/${user_id}/competitions`;

            firestore.collection(competition_path).doc(competitionId).get()
                .then(competitionRef => {
                    if (competitionRef.exists) {
                        let competitionData = competitionRef.data();
                        setCurrentCompetition({...competitionData});

                        onStartTimer(competitionData);
                    } else {
                        // get problems form selected competition
                        firestore.collection('competitions')
                            .doc(competitionId)
                            .get()
                            .then(async competitionRef => {
                                props.onLoading(true);
                                if (competitionRef.exists) {
                                    let tempProblems = [];

                                    let competitionData = competitionRef.data();
                                    let selectedProblems = competitionData.selectedProblems ? competitionData.selectedProblems : [];

                                    for (let i = 0; i < selectedProblems.length; i++) {
                                        let selectedProblemItem = selectedProblems[i];
                                        let problemId = selectedProblemItem.id;
                                        let problemRef = await firestore.collection('problems').doc(problemId).get();

                                        if (problemRef.exists) {
                                            let dataProblem = problemRef.data();
                                            tempProblems.push({
                                                id: problemRef.id,
                                                question: dataProblem.question,
                                                answers: dataProblem.answers ? dataProblem.answers : [],
                                                correctAnswer: dataProblem.correctAnswer
                                            });
                                        }
                                    }

                                    let currentTime = new Date();

                                    let setInfo = {
                                        competitionId,
                                        grades: competitionData.grades,
                                        competitionName: competitionData.competitionName,
                                        problems: tempProblems,
                                        warningCount: 0,
                                        limitTime: competitionData.limitTime,
                                        limitWarningCount: competitionData.limitWarningCount,
                                        startedAt: new Date(),
                                        endTime: new Date(currentTime.getTime() + competitionData.limitTime * 60000 + 2000)
                                    };
                                    await firestore.collection(competition_path)
                                        .doc(competitionId)
                                        .set(setInfo);

                                    setCurrentCompetition({
                                        ...setInfo
                                    });

                                    onStartTimer(setInfo, false);
                                    props.onLoading(false);
                                }
                            })
                            .catch(error => {
                                toast.error(error.message)
                            })
                            .finally(() => {
                                props.onLoading(false);
                            });
                    }
                })
                .catch(error => {
                    toast.error(error.message);
                })
                .finally(() => {
                    props.onLoading(false);
                });
        }
    };

    const onBlur = () => {
        // setOpenWarningDlg(true);
    };

    const onCloseWebpage = (event) => {
        event.preventDefault();

        return event.returnValue = "Do you really want to close?";
    };

    const onGotoSubmittedPage = () => {
        onEndTime();
        window.removeEventListener('blur', onBlur);
        window.removeEventListener('beforeunload', onCloseWebpage);

        setTimeLeft(0);
        props.history.push('/user/submitted');
    };

    useEffect(() => {
        // get selected competition index
        if (props.user) {
            if (location.state.competitionId != undefined && location.state.competitionId != '') {
                competitionId = location.state.competitionId;
                loadInitProblems();
            } else {
                props.history.push('/user/dashboard');
            }
        }

    }, [props.state]);

    useEffect(() => {
        if (timeLeft != null && timeLeft < 0) {
            onGotoSubmittedPage();
        }

        if (currentCompetition && (currentCompetition.warningCount >= currentCompetition.limitWarningCount
            || currentCompetition.submitted === true)) {
            onGotoSubmittedPage();
        }
    }, [timeLeft, currentCompetition]);

    const onStartTimer = (competitionData, bExist = true) => {

        let curTime = new Date();
        let endTime = null;
        if (bExist == true) {
            endTime = new Date(competitionData.endTime.seconds * 1000);
        } else {
            endTime = competitionData.endTime;
        }
        let diff = endTime.getTime() - curTime.getTime();

        if (diff <= 0) {
            onEndTime();
            props.history.push('/user/submitted');
        } else {
            window.addEventListener('blur', onBlur);
            window.addEventListener('beforeunload', onCloseWebpage);

            timeInterval = setInterval(() => {
                curTime = new Date();
                if (bExist == true) {
                    endTime = new Date(competitionData.endTime.seconds * 1000);
                } else {
                    endTime = competitionData.endTime;
                }
                let diff = endTime.getTime() - curTime.getTime();
                setTimeLeft(Math.floor(diff / 1000));
            }, 1000);
        }
    };

    const getTimeLeftFormat = (insTimeLeft) => {
        if (insTimeLeft == null) {
            return "00:00";
        }

        let minute = Math.floor(insTimeLeft / 60);
        if (minute < 10) {
            minute = "0" + minute;
        }
        let seconds = insTimeLeft % 60;
        if (seconds < 10) {
            seconds = "0" + seconds;
        }

        return [minute, seconds].join(":");
    };

    const onEndTime = () => {
        clearInterval(timeInterval);
    };

    const onNext = () => {
        let nextIndex = curProblemIndex + 1;
        if ( nextIndex > currentCompetition.problems.length - 1) {
            return;
        }

        setCurProblemIndex(nextIndex);
    };

    const onPrev = () => {
        let prevIndex = curProblemIndex - 1;
        if (prevIndex < 0) {
            return;
        }
        setCurProblemIndex(prevIndex);
    };

    const onSelectAnswer = (selectedProblem, answer) => {

        if (selectedProblem.selectedAnswer == answer.key) {
            delete selectedProblem.selectedAnswer;
        } else {
            selectedProblem.selectedAnswer = answer.key;
        }

        let user_id = props.user.id;

        setCurrentCompetition({
            ...currentCompetition,
            problems: currentCompetition.problems
        });

        firestore.collection(`users/${user_id}/competitions`)
            .doc(competitionId)
            .set({
                problems: currentCompetition.problems
            }, {merge: true})
            .then(() => {

            })
            .catch((error) => {
                toast.error(error.message);
            });
    };

    const getNumberStatus = (selectedProblem, key) => {
        if (selectedProblem.selectedAnswer !== undefined) {
            return 'done';
        }

        if (key == curProblemIndex) {
            return 'process';
        }

        return 'none';
    };

    const onChangeWarningCount = () => {

        let curWarningCount = currentCompetition.warningCount + 1;

        let user_id = props.user.id;
        setOpenWarningDlg(false);

        firestore.collection(`users/${user_id}/competitions`)
            .doc(competitionId)
            .set({
                warningCount: curWarningCount
            }, {merge: true})
            .then(() => {
                setCurrentCompetition({
                    ...currentCompetition,
                    warningCount: curWarningCount
                });
            })
            .catch((error) => {
                toast.error(error.message);
            });
    };

    const onSubmitCompetition = () => {
        setOpenSubmitDlg(false);

        let user_id = props.user.id;

        firestore.collection(`users/${user_id}/competitions`)
            .doc(competitionId)
            .set({
                submitted: true
            }, {merge: true})
            .then(() => {
                onGotoSubmittedPage();
            })
            .catch((error) => {
                toast.error(error.message);
            });
    };

    const submitDialog = (
        <Dialog
            fullWidth={true}
            maxWidth={"sm"}
            open={openSubmitDlg}
            classes={{
                paper: classes.dlgBlueBorder
            }}
            onClose={(event, reason) => {
                if (reason == 'backdropClick' || reason == 'escapeKeyDown') {
                    return;
                }
            }}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogContent style={{paddingTop: '30px'}}>
                <h4 style={{fontWeight: 'bold'}} className='text-center'>
                    Do you wish to submit the competition early?
                </h4>
            </DialogContent>
            <DialogActions className='justify-content-around py-3 px-3'>
                <BtnDialogConfirm title='Continue' width='120px' onClick={() => onSubmitCompetition()} backgroundColor={props.disabled ? '#ddd' : COLOR_DLG_BORDER_BLUE}/>
                <BtnDialogConfirm title='Cancel' width='120px' onClick={() => setOpenSubmitDlg(false)}/>
            </DialogActions>
        </Dialog>
    );

    const warningDlg = (
        <Dialog
            fullWidth={true}
            maxWidth={"sm"}
            open={openWarningDlg}
            classes={{
                paper: classes.dlgBlueBorder
            }}
            onClose={(event, reason) => {
                if (reason == 'backdropClick' || reason == 'escapeKeyDown') {
                    return;
                }
            }}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <h2 className='text-center' style={{color: COLOR_DLG_TITLE, fontSize: '1.8em', fontWeight: 'bolder'}}>Warning</h2>
            <DialogContent style={{paddingTop: '30px'}}>
                <h4 style={{fontWeight: 'bold'}} className='text-center'>
                    Please stay on the competition site. You have left this site <span style={{color: COLOR_DLG_BORDER_BLUE}}>{currentCompetition ? (`${currentCompetition.limitWarningCount - currentCompetition.warningCount - 1} times`)  : null}</span>
                </h4>
            </DialogContent>
            <DialogActions className='justify-content-center py-3'>
                <BtnDialogConfirm title='Continue' onClick={() => onChangeWarningCount()} backgroundColor={props.disabled ? '#ddd' : COLOR_DLG_BORDER_BLUE}/>
            </DialogActions>
        </Dialog>
    );

    const renderView = ({index}) => (
        <>
            <h3>Question {index + 1}</h3>
            <div className='row' style={{height: '300px', overflow: 'auto'}}>
                <div className='col-12'>
                    <pre className='latex-content'>
                        <Latex>{currentCompetition.problems[index] ? currentCompetition.problems[index].question : ''}</Latex>
                    </pre>
                </div>
                <div className='col-12' style={{ display: 'flex', flexWrap: 'warp', padding: '10px'}}>
                    {
                        currentCompetition.problems[index] && currentCompetition.problems[index].answers.map((ans, key) => {
                            return (
                                <div key={key} className='col-lg-2 py-2 col-sm-6'>
                                    <Latex>{ans.key ? ans.key + ') ' + ans.value : ''}</Latex>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
            <div className='row py-2'>
                <div className='col-12'>
                    <div className={classes.AnswerContainer}>
                    {
                        currentCompetition.problems[index] && currentCompetition.problems[index].answers.map((answer, key) => {
                            return (
                                <div style={{padding: '10px'}} key={key}>
                                    <BtnAnswerNumber selected={answer.key == currentCompetition.problems[index].selectedAnswer ? true : false} onClick={() => onSelectAnswer(currentCompetition.problems[index], answer)} title={answer.key}/>
                                </div>
                            )
                        })
                    }
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <>
            {
                currentCompetition == null ? <div className='text-center' style={{paddingTop: '200px'}}>
                    </div>
                :
                <div className={classes.root}>
                    <ToastContainer
                        position='top-center'
                        autoClose={2000}
                        traggle/>
                    {
                        warningDlg
                    }
                    {
                        submitDialog
                    }
                    <div className={'row py-2'}>
                        <div className='col-lg-2 col-sm-12'>
                        </div>
                        <div className='col-lg-8 col-sm-12 text-center'>
                            <div className={classes.headerNumberContainer}>
                                {
                                    currentCompetition.problems && currentCompetition.problems.map((problemItem, key) => {
                                        return (
                                            <div style={{padding: '6px'}} key={key}>
                                                <BtnCompetitionNumberSelect
                                                    number={key + 1}
                                                    onClick={() => setCurProblemIndex(key)}
                                                    status={getNumberStatus(problemItem, key)}/>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                        <div className='col-lg-2 col-sm-12 text-center'>
                            <h4 style={{color: '#6f6f6f'}}>Time Left</h4>
                            <h3 className={timeLeft <= 120 ? 'blink-warning' : ''}>{getTimeLeftFormat(timeLeft)}</h3>
                        </div>
                    </div>
                    <div className='row py-2'>
                        <div className={currentCompetition == null ? 'col-12 component-loading' : 'col-12'}>
                            <ViewSlider
                                renderView={renderView}
                                numViews={currentCompetition.problems.length}
                                activeView={curProblemIndex}
                                animateHeight
                            />
                        </div>
                    </div>
                    {
                        currentCompetition != null ?
                            <div className='row' style={{paddingTop: '40px'}}>
                                <div className='col-lg-3 col-sm-12'>
                                </div>
                                <div className='col-lg-6 col-sm-12'>
                                    <div className='row'>
                                        <div className='col-6'>
                                            <BtnConfirm title='Back' disabled={curProblemIndex == 0 ? true : false}
                                                        onClick={onPrev}/>
                                        </div>
                                        <div className='col-6'>
                                            <BtnConfirm style={{float: 'right'}}
                                                        disabled={currentCompetition.problems && curProblemIndex == currentCompetition.problems.length - 1 ? true : false}
                                                        onClick={onNext} title='Next'/>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-lg-3 col-sm-12'>
                                    <BtnConfirm title='Submit Test' onClick={() => setOpenSubmitDlg(true)} style={{float: 'right'}}/>
                                </div>
                            </div>
                            :
                            null
                    }
                </div>
                }
            </>
        );
};
export default Competition;

import React, {useEffect, useState} from "react";
import {useLocation} from 'react-router-dom';
import 'react-pro-sidebar/dist/css/styles.css';
import {makeStyles} from "@material-ui/core";
import ViewSlider from 'react-view-slider';

import {COLOR_DLG_BORDER_BLUE} from "../../Utils/ColorConstants";
import BtnCompetitionNumberSelect from "../../Components/User/BtnCompetitionNumberSelect";
import BtnAnswerNumber from "../../Components/User/BtnAnswerNumber";
import BtnConfirm from "../../Components/User/BtnConfirm";
import {firestore} from "../../firebase";
import {toast, ToastContainer} from "react-toastify";
import CircularProgress from "@material-ui/core/CircularProgress";

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

    const [initLoading, setInitLoading] = useState(false);
    const [currentCompetition, setCurrentCompetition] = useState(null);

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
                                        grade: competitionData.grade,
                                        competitionName: competitionData.competitionName,
                                        problems: tempProblems,
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

                                    console.log(setInfo);

                                    onStartTimer(setInfo, false);
                                }
                            })
                            .catch(error => {
                                toast.error(error.message)
                            });
                    }
                })
                .catch(error => {
                    toast.error(error.message);
                });
        }
    };

    useEffect(() => {
        // get selected competition index
        if (props.user) {
            competitionId = location.state.competitionId;

            if (competitionId != '') {
                loadInitProblems();
            } else {
                props.history.push('/user/dashboard');
            }
        }

    }, [props.user]);

    useEffect(() => {
        if (timeLeft != null && timeLeft < 0) {
            onEndTime();
            setTimeLeft(0);
            props.history.push('/user/submitted');
        }
    }, [timeLeft]);

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
        selectedProblem.selectedAnswer = answer;

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

    const renderView = ({index}) => (
        <>
            <h3>Question {index + 1}</h3>
            <div className='row'>
                <pre className='col-12' style={{height: '300px', overflow: 'auto'}}>
                    {currentCompetition.problems[index] ? currentCompetition.problems[index].question : ''}
                </pre>
            </div>
            <div className='row py-2'>
                <div className='col-12'>
                    <div className={classes.AnswerContainer}>
                    {
                        currentCompetition.problems[index] && currentCompetition.problems[index].answers.map((answer, key) => {
                            return (
                                <div style={{padding: '10px'}} key={key}>
                                    <BtnAnswerNumber selected={answer == currentCompetition.problems[index].selectedAnswer ? true : false} onClick={() => onSelectAnswer(currentCompetition.problems[index], answer)} title={answer}/>
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
                        <CircularProgress/>
                    </div>
                :
                <div className={classes.root}>
                    <ToastContainer
                        position='top-center'
                        autoClose={2000}
                        traggle/>
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
                                    <BtnConfirm title='Submit Test' style={{float: 'right'}}/>
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

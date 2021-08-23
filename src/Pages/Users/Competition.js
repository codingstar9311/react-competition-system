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
import LoadingOverlay from 'react-loading-overlay';
import CircularProgress from "@material-ui/core/CircularProgress";

const questionNumber = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
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



const Competition = (props) => {
    const classes = useStyles();

    const [initLoading, setInitLoading] = useState(false);

    const [curProblemIndex, setCurProblemIndex] = useState(0);
    const [problems, setProblems] = useState([]);
    const [limitTime, setLimitTime] = useState('');

    let competitionId = '';

    const location = useLocation();

    const loadInitProblems = () => {
        if (competitionId != '') {
            setInitLoading(true);
            // get problems form selected competition
            firestore.collection('competitions')
                .doc(competitionId)
                .get()
                .then(async competitionRef => {
                    if (competitionRef.exists) {
                        let tempProblems = [];

                        let data = competitionRef.data();
                        let selectedProblems = data.selectedProblems ? data.selectedProblems : [];

                        for (let i = 0; i < selectedProblems.length; i++) {
                            let selectedProblemItem = selectedProblems[i];
                            let problemId = selectedProblemItem.id;
                            let problemRef = await firestore.collection('problems').doc(problemId).get();

                            if (problemRef.exists) {
                                let dataProblem = problemRef.data();
                                tempProblems.push({
                                    id: problemRef.id,
                                    question: dataProblem.question,
                                    answers: dataProblem.answers ? dataProblem.answers : []
                                });
                            }
                        }

                        setProblems([...tempProblems]);
                    }
                })
                .catch(error => {
                    toast.error(error.message)
                })
                .finally(() => {
                    setInitLoading(false);
                //    start left time
                });
        }
    };

    useEffect(() => {
        // get selected competition index
        competitionId = location.state.competitionId;
        loadInitProblems();

    }, [location]);

    const onNext = () => {
        let nextIndex = curProblemIndex + 1;
        if (nextIndex > problems.length - 1) {
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

        setProblems([
            ...problems
        ]);
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
                    {problems[index] ? problems[index].question : ''}
                </pre>
            </div>
            <div className='row py-2'>
                <div className='col-12'>
                    <div className={classes.AnswerContainer}>
                    {
                        problems[index] && problems[index].answers.map((answer, key) => {
                            return (
                                <div style={{padding: '10px'}} key={key}>
                                    <BtnAnswerNumber selected={answer == problems[index].selectedAnswer ? true : false} onClick={() => onSelectAnswer(problems[index], answer)} title={answer}/>
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
                initLoading ? <div className='text-center' style={{paddingTop: '200px'}}>
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
                                    problems.map((problemItem, key) => {
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
                            <h3>12:48</h3>
                        </div>
                    </div>
                    <div className='row py-2'>
                        <div className={initLoading ? 'col-12 component-loading' : 'col-12'}>
                            <ViewSlider
                                renderView={renderView}
                                numViews={problems.length}
                                activeView={curProblemIndex}
                                animateHeight
                            />
                        </div>
                    </div>
                    {
                        initLoading == false ?
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
                                                        disabled={curProblemIndex == problems.length - 1 ? true : false}
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

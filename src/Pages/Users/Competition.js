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
import {toast} from "react-toastify";

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
    const [curProblemIndex, setCurProblemIndex] = useState(0);
    const [problems, setProblems] = useState([]);

    let competitionId = '';

    const location = useLocation();

    useEffect(() => {
        // get selected competition index
        competitionId = location.state.competitionId;

        if (competitionId != '') {
            // get problems form selected competition
            firestore.collection('competitions')
                .doc(competitionId)
                .get()
                .then(competitionRef => {
                    if (competitionRef.exists) {
                        let data = competitionRef.data();
                        let selectedProblems = data.selectedProblems ? data.selectedProblems : [];

                        let tempProblems = [];
                        selectedProblems.forEach(async item => {
                            let problemId = item.id;

                            let problemRef = await firestore.collection('problems').doc(problemId).get();

                            if (problemRef.exists) {
                                let dataProblem = problemRef.data();
                                setProblems([...problems, {
                                    id: problemRef.id,
                                    question: dataProblem.question,
                                    answers: dataProblem.answers ? dataProblem.answers : []
                                }])
                            }
                        });
                    }
                })
                .catch(error => {
                    toast.error(error.message)
                });
        }

    }, [location]);

    const onNext = () => {
        let nextIndex = curProblemIndex + 1;
        setCurProblemIndex(nextIndex);
    };

    const onPrev = () => {
        let prevIndex = curProblemIndex - 1;
        if (prevIndex < 0) {
            prevIndex = 0;
        }
        setCurProblemIndex(prevIndex);
    };

    const renderView = ({index}) => (
        <>
            <h3>Question {index + 1}</h3>
            <div className='row'>
                <div className='col-12'>
                    {problems.question}
                </div>
            </div>
        </>
    );

    return (
        <div className={classes.root}>
            <div className={'row py-2'}>
                <div className='col-lg-2 col-sm-12'>
                </div>
                <div className='col-lg-8 col-sm-12 text-center'>
                    <div className={classes.headerNumberContainer}>
                        {
                            questionNumber.map((numberItem, key) => {
                                return (
                                    <div style={{padding: '6px'}} key={key}>
                                        <BtnCompetitionNumberSelect number={numberItem} status={'process'}/>
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
                <div className='col-12' style={{height: '350px'}}>
                    <ViewSlider
                        renderView={renderView}
                        numViews={25}
                        activeView={curProblemIndex}
                        animateHeight
                    />
                </div>
            </div>
            <div className='row py-2'>
                <div className='col-12' style={{display: "flex"}}>
                    <div className={classes.AnswerContainer}>
                        <div style={{padding: '10px'}}>
                            <BtnAnswerNumber title='A'/>
                        </div>
                        <div style={{padding: '10px'}}>
                            <BtnAnswerNumber title='B'/>
                        </div>
                        <div style={{padding: '10px'}}>
                            <BtnAnswerNumber title='C' selected={true}/>
                        </div>
                        <div style={{padding: '10px'}}>
                            <BtnAnswerNumber title='D'/>
                        </div>
                        <div style={{padding: '10px'}}>
                            <BtnAnswerNumber title='E'/>
                        </div>
                    </div>
                </div>
            </div>
            <div className='row' style={{paddingTop: '40px'}}>
                <div className='col-lg-3 col-sm-12'>
                </div>
                <div className='col-lg-6 col-sm-12'>
                    <div className='row'>
                        <div className='col-6'>
                            <BtnConfirm title='Back' onClick={onPrev} />
                        </div>
                        <div className='col-6'>
                            <BtnConfirm style={{float: 'right'}} onClick={onNext} title='Next'/>
                        </div>
                    </div>
                </div>
                <div className='col-lg-3 col-sm-12'>
                    <BtnConfirm title='Submit Test' style={{float: 'right'}}/>
                </div>
            </div>
        </div>
    )
};
export default Competition;

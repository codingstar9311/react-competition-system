import React, { useContext, useEffect } from "react";
import {auth} from "../../firebase";
import {ProSidebar, MenuItem, Menu, SubMenu, FaHear} from "react-pro-sidebar";
import 'react-pro-sidebar/dist/css/styles.css';
import {makeStyles} from "@material-ui/core";
import {COLOR_DLG_BORDER_BLACK, COLOR_DLG_BORDER_BLUE} from "../../Utils/ColorConstants";
import BtnCompetitionSelect from "../../Components/User/BtnCompetitionSelect";
import BtnAnswerNumber from "../../Components/User/BtnAnswerNumber";
const guestionNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
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
        border: `solid 2px ${COLOR_DLG_BORDER_BLACK}`,
        borderRadius: 20,
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

    return (
        <div className={classes.root}>
            <div className={'row py-2'}>
                <div className='col-lg-2 col-sm-12'>
                </div>
                <div className='col-lg-8 col-sm-12 text-center'>
                    <div className={classes.headerNumberContainer}>
                        {
                            guestionNumbers.map((numberItem, key) => {
                                return (
                                    <div style={{padding: '6px'}} key={key}>
                                        <BtnCompetitionSelect number={numberItem} status={'done'}/>
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
        </div>
    )
};
export default Competition;

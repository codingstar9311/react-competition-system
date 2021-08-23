import React, {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import {
    COLOR_ADMIN_MAIN,
    COLOR_ANSWER_SELECT_BUTTON_BORDER, COLOR_DLG_BORDER_BLACK, COLOR_DLG_BORDER_BLUE, COLOR_DLG_TITLE,
    COLOR_USER_SELECTED_BUTTON
} from "../../Utils/ColorConstants";

const useStyles = makeStyles((theme) => ({
    root: {
        width : '120px',
        height: '60px',
        borderRadius: '30px',
        fontSize: '1.7em',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `solid 1px ${COLOR_DLG_BORDER_BLUE}`,
        minWidth: 'unset !important'
    }
}));

const BtnAnswerNumber = (props) => {

    const classes = useStyles();
    return (
        <Button className={classes.root} onClick={props.onClick}
                style={{backgroundColor: props.selected ? COLOR_DLG_TITLE : '#fff', color: props.selected ? '#fff' : COLOR_DLG_BORDER_BLACK}}>
            {props.title}
        </Button>
    )
};

export default BtnAnswerNumber;

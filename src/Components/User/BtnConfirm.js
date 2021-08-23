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
        height: '45px',
        borderRadius: '15px',
        fontSize: '1.4em',
        color: '#6f6f6f',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `solid 2px #6f6f6f`,
        minWidth: 'unset !important',
        padding: '10px 30px',
        textTransform: 'none',
        backgroundColor: '#ddd'
    }
}));

const BtnConfirm = (props) => {

    const classes = useStyles();
    return (
        <Button className={classes.root} disabled={props.disabled} style={props.style} onClick={props.onClick}>
            {props.title}
        </Button>
    )
};

export default BtnConfirm;

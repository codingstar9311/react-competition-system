import React from "react";
import {makeStyles} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import {COLOR_USER_SELECTED_BUTTON} from "../../Utils/ColorConstants";

const useStyles = makeStyles((theme) => ({
    root: {
        height: '30px',
        borderRadius: '30px',
        fontSize: '1.2em',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '70px',
        paddingLeft: '25px',
        paddingRight: '25px',
        textTransform: 'unset',
        border: 'solid 1px #306cb0'
    }
}));

const BtnDialogConfirm = (props) => {
    const classes = useStyles();
    return (
        <Button className={classes.root} onClick={props.onClick}
                style={{backgroundColor: props.backgroundColor ? props.backgroundColor : COLOR_USER_SELECTED_BUTTON, color: '#fff', width: props.width}}
                disabled={props.disabled}
                type={props.type}
        >
            {props.title}
        </Button>
    )
};

export default BtnDialogConfirm;

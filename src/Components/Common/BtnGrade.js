import React from "react";
import {makeStyles} from "@material-ui/core/index";
import Button from "@material-ui/core/Button/index";

const useStyles = makeStyles((theme) => ({
    root: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        fontSize: '1.5em',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'solid 2px #6f6f6f',
        minWidth: 'unset !important'
    }
}));

const BtnGrade = (props) => {
    const classes = useStyles();
    return (
        <Button className={classes.root} onClick={props.onClick}
             style={{backgroundColor: props.selected ? '#00A9AF' : '#fff', color: props.selected ? '#fff' : '#00A9AF'}}>
            {props.number}
        </Button>
    )
};

export default BtnGrade;

import React from "react";
import {makeStyles} from "@material-ui/core";
import Button from "@material-ui/core/Button";

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
        paddingLeft: '20px',
        paddingRight: '20px',
        textTransform: 'unset',
        border: 'solid 1px #306cb0'
    }
}));

const CompetitionButton = (props) => {
    const classes = useStyles();
    return (
        <Button className={classes.root} onClick={props.onClick}
                style={{backgroundColor: props.selected ? '#306cb0' : '#fff', color: props.selected ? '#fff' : '#306cb0'}}>
            {props.name} : {props.score}
        </Button>
    )
};

export default CompetitionButton;

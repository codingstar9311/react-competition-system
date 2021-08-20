import React from "react";
import {makeStyles} from "@material-ui/core";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles((theme) => ({
    root: {
        height: '40px',
        borderRadius: '50%',
        fontSize: '1.5em',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'solid 1px #000',
        minWidth: '70px'
    }
}));

const CompetitionItem = (props) => {
    const classes = useStyles();
    return (
        <Button className={classes.root} onClick={props.onClick}
                style={{backgroundColor: props.selected ? '#1f44af' : '#fff', color: props.selected ? '#fff' : '#00A9AF'}}>
            {props.number}
        </Button>
    )
};

export default CompetitionItem;

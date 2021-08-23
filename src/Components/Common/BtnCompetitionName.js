import React from "react";
import {makeStyles} from "@material-ui/core/index";
import Button from "@material-ui/core/Button/index";
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
        paddingLeft: '20px',
        paddingRight: '20px',
        textTransform: 'unset',
        border: 'solid 1px #306cb0'
    }
}));

const BtnCompetitionName = (props) => {
    const classes = useStyles();
    return (
        <Button className={classes.root} onClick={props.onClick}
                style={{backgroundColor: props.selected ? COLOR_USER_SELECTED_BUTTON : '#fff', color: props.selected ? '#fff' : COLOR_USER_SELECTED_BUTTON}}>
            {props.name} {props.score}
        </Button>
    )
};

export default BtnCompetitionName;

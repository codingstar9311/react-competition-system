import React, {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import {COLOR_USER_SELECTED_BUTTON} from "../../Utils/ColorConstants";

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
        border: 'solid 1px #000',
        minWidth: 'unset !important',
        fontFamily: 'sans-serif'
    }
}));

const BtnCompetitionNumberSelect = (props) => {

    const [bgColor, setBgColor] = useState('');
    const [fontColor, setFontColor] = useState('');
    useEffect(() => {
        if (props.status == 'done') {
            setBgColor(COLOR_USER_SELECTED_BUTTON);
            setFontColor('#fff');

        } else if (props.status == 'process') {
            setBgColor('#ddd');
            setFontColor('#111');
        } else if (props.status == 'none') {
            setBgColor('#fff');
            setFontColor('#111');
        }
    }, [props.status]);
    const classes = useStyles();
    return (
        <Button className={classes.root} onClick={props.onClick}
                style={{backgroundColor: bgColor, color: fontColor}}>
            {props.number}
        </Button>
    )
};

export default BtnCompetitionNumberSelect;

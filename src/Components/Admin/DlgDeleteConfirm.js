import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import React from "react";
import {makeStyles} from "@material-ui/core";
import {COLOR_CANCEL_BUTTON, COLOR_DLG_BORDER_BLUE, COLOR_DLG_TITLE} from "../../Utils/ColorConstants";
import BtnDialogConfirm from "../Common/BtnDialogConfirm";

const useStyles = makeStyles((theme) => ({
    dlgBlueBorder: {
        border: 'solid 2px',
        borderRadius: '50px',
        paddingTop: '40px',
        paddingBottom: '40px',
        marginBottom: '14%'
    },
}));

const DlgDeleteConfirm = (props) => {
    const classes = useStyles();
    return (
        <Dialog
            fullWidth={true}
            maxWidth={"sm"}
            open={props.open}
            classes={{
                paper: classes.dlgBlueBorder
            }}
            onClose={(event, reason) => {
                if (reason == 'backdropClick' || reason == 'escapeKeyDown') {
                    return;
                }
            }}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogContent>
                <h2 id="alert-dialog-title" className='text-center' style={{color: COLOR_DLG_TITLE, fontSize: '30px', fontWeight: 'bolder'}}>{props.title}</h2>
                <h5 className='text-center py-4'>{props.content}</h5>
            </DialogContent>
            <DialogActions className='justify-content-center'>
                <BtnDialogConfirm onClick={props.onNo} disabled={props.disabled} title='No' backgroundColor={props.disabled ? '#ddd' : COLOR_CANCEL_BUTTON}/>
                <BtnDialogConfirm onClick={props.onYes} title='Yes' disabled={props.disabled} backgroundColor={props.disabled ? '#ddd' : COLOR_DLG_BORDER_BLUE}/>
            </DialogActions>
        </Dialog>
    )
};

export default DlgDeleteConfirm;

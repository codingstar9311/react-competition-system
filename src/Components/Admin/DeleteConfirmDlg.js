import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import React from "react";

const DeleteConfirmDlg = (props) => {
    return (
        <Dialog
            fullWidth={true}
            maxWidth={"sm"}
            open={props.open}
            onClose={(event, reason) => {
                if (reason == 'backdropClick' || reason == 'escapeKeyDown') {
                    return;
                }
            }}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title" className='text-center'>{props.title}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {props.content}
                </DialogContentText>
            </DialogContent>
            <DialogActions className='justify-content-center'>
                <Button onClick={props.onNo} variant='contained' disabled={props.loading} color="secondary">
                    No
                </Button>
                <Button onClick={props.onYes} variant='contained' disabled={props.loading} color="primary" autoFocus>
                    Yes
                </Button>
            </DialogActions>
        </Dialog>
    )
};

export default DeleteConfirmDlg;

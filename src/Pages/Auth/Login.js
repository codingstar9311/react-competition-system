import React, {useEffect, useState} from "react";
import {auth, firestore, getUserDocument} from "../../firebase";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, makeStyles, TextField} from "@material-ui/core";

import logo from '../../Assets/Images/logo.png';
import {toast, ToastContainer} from "react-toastify";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import {Visibility, VisibilityOff} from "@material-ui/icons";
import {COLOR_CANCEL_BUTTON, COLOR_DLG_BORDER_BLUE, COLOR_DLG_TITLE} from "../../Utils/ColorConstants";
import BtnGrade from "../../Components/Common/BtnGrade";
import BtnDialogConfirm from "../../Components/Common/BtnDialogConfirm";
const title = 'Math Tournament';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    container: {
        height: 'calc(100% - 10px)',
    },
    dlgBlueBorder: {
        border: 'solid 2px',
        borderRadius: '50px',
        borderColor: COLOR_DLG_BORDER_BLUE,
        paddingBottom: '40px',
        marginBottom: '14%'
    },

}));

const Login = (props) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [showRegisterDlg, setShowRegisterDlg] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [registerValues, setRegisterValues] = useState({
        fullName: '',
        email: '',
        password: '',
        grade: '6',
        confirmPassword: '',
        showPassword: false
    });

    const classes = useStyles();

    const onLogin = (event) => {
        event.preventDefault();

        firestore.collection('users')
            .where('email', '==', email).where('password', '==', password)
            .get()
            .then(userRef => {
                if (userRef.docs.length > 0) {
                    let userInfo = userRef.docs[0];
                    if (userInfo.exists) {
                        let userData = userInfo.data();

                        let user = {
                            id: userInfo.id,
                            ...userInfo.data()
                        };

                        if (userInfo.type == 'admin') {
                            localStorage.setItem('user_info', JSON.stringify(user));
                            props.history.push('/admin/dashboard');
                        } else {
                            localStorage.setItem('user_info', JSON.stringify(user));
                            props.history.push('/user/dashboard');
                        }
                    }
                } else {
                    toast.error('Please insert correct email or password!');
                }
            });
    };

    const onRegister = async (event) => {
        event.preventDefault();
        let registerInfo = {
            fullName: registerValues.fullName,
            email: registerValues.email,
            grade: registerValues.grade,
            password: registerValues.password,
            dateTime: new Date(),
            type: 'user',
            status: false
        };

        setLoading(true);

        let results = await firestore.collection('users')
            .where('email', "==", registerValues.email)
            .get();

        if (results.docs && results.docs.length > 0) {
            toast.error('Current email already exists!');
            setLoading(false);
            return;
        }

        firestore.collection('users').add(registerInfo)
            .then(() => {
                toast.success('Registered successfully. Please login');
                setShowRegisterDlg(false);
            })
            .catch(error => {
                    toast.error(error.message);
                }
            )
            .finally(() => {
                setLoading(false);
            })
    };

    useEffect(() => {
        let userInfo = localStorage.getItem('user_info');

        if (userInfo == null) {
            // props.history.push('/login');
            console.log('here---------------');
        } else {
            let curUser = JSON.parse(userInfo);
            if (curUser.type === 'admin') {
                props.history.push('/admin/dashboard');
            } else if (curUser.type === 'user') {
                props.history.push('/user/dashboard');
            } else {
                localStorage.removeItem('user_info');
                console.log('here---------')
            }
        }
    }, []);

    const dialog = (<Dialog open={showRegisterDlg}
                            fullWidth={true}
                            maxWidth={'sm'}
                            classes={{
                                paper: classes.dlgBlueBorder
                            }}
                            onClose={(event, reason) => {
                                if (reason == 'backdropClick' || reason == 'escapeKeyDown') {
                                    return;
                                }
                                setShowRegisterDlg(false)
                            }}
                            aria-labelledby="form-dialog-title">
        <form onSubmit={onRegister} autoComplete="off">
            <DialogTitle className='text-center' style={{color: COLOR_DLG_TITLE}}>Register</DialogTitle>
            <DialogContent>
                <div className='row py-2 align-items-center justify-content-center'>
                    <div className='col-lg-10 col-sm-10 px-2'>
                        <TextField
                            autoFocus
                            label="Full Name"
                            type="text"
                            value={registerValues.fullName}
                            onChange={(e) => {
                                setRegisterValues({
                                    ...registerValues, fullName: e.target.value
                                })
                            }}
                            fullWidth
                            required
                        />
                    </div>
                </div>
                <div className='row py-2 align-items-center justify-content-center'>
                    <div className='col-lg-10 col-sm-10 px-2 text-center'>
                        <div className='row align-items-center'>
                            <div className='col-lg-3 col-sm-12 text-left'>
                                Grade
                            </div>
                            <div className='col-lg-9 col-sm-12 justify-content-around' style={{display: "flex"}}>
                                {
                                    [6, 7, 8, 9, 10].map((val, key) => {
                                        return (
                                            <div className='px-2' key={key}>
                                                <BtnGrade number={val} onClick={() => {
                                                    setRegisterValues({
                                                        ...registerValues,
                                                        grade: val
                                                    });
                                                }} selected={val == registerValues.grade ? true : false}/>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div className='row py-2 align-items-center justify-content-center'>
                    <div className='col-lg-10 col-sm-10 px-2'>
                        <TextField
                            autoFocus
                            label="Email Address"
                            autoComplete="false"
                            value={registerValues.email}
                            onChange={(e) => {
                                setRegisterValues({
                                    ...registerValues, email: e.target.value
                                })
                            }}
                            type="email"
                            fullWidth={true}
                            required
                        />
                    </div>
                </div>
                <div className='row py-2 align-items-center justify-content-center'>
                    <div className='col-lg-10 col-sm-10 px-2 text-center'>
                        <FormControl fullWidth required>
                            <InputLabel htmlFor="filled-adornment-password">Password</InputLabel>
                            <Input
                                id="standard-adornment-password"
                                type={registerValues.showPassword ? 'text' : 'password'}
                                value={registerValues.password}
                                onChange={(e) => {
                                    setRegisterValues({
                                        ...registerValues,
                                        password: e.target.value
                                    })
                                }}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => {
                                                setRegisterValues({
                                                    ...registerValues,
                                                    showPassword: !registerValues.showPassword
                                                })
                                            }}
                                            edge="end"
                                        >
                                            {registerValues.showPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                            />
                        </FormControl>
                    </div>
                </div>
            </DialogContent>
            <DialogActions className='justify-content-center py-3'>
                <BtnDialogConfirm disabled={loading} type='button' backgroundColor={COLOR_CANCEL_BUTTON} width={'100px'} type='button' onClick={() => setShowRegisterDlg(false)} title={'Cancel'}/>
                <BtnDialogConfirm disabled={loading} type='submit' width={'100px'} title='Register'/>
            </DialogActions>
        </form>
    </Dialog>);

    return (
        <div className="container">
            <ToastContainer
                position='top-center'
                autoClose={2000}
                traggle/>
            {
                dialog
            }
            <div className="row">
                <div className="col-sm-6 col-md-4 col-lg-3 px-0">
                    <div className="logo-wrapper">
                        <img src={logo} alt={""} style={{width: '100%'}}/>
                    </div>
                </div>
            </div>
            <div className='row py-2'>
                <h1>{title}</h1>
            </div>
            <form className='py-2' onSubmit={(event) => onLogin(event)}>
                <div className='row'>
                    <div className='col-sm-12 col-lg-4'>
                        <div className='form-group'>
                            <TextField fullWidth
                                       id={'email'}
                                       type={'email'}
                                       label={"Email"}
                                       variant='standard'
                                       onChange={(e) => setEmail(e.target.value)}
                                       required/>
                        </div>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-sm-12 col-lg-4'>
                        <FormControl fullWidth>
                            <InputLabel htmlFor="standard-adornment-password">Password</InputLabel>
                            <Input
                                id="standard-adornment-password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                            />
                        </FormControl>
                    </div>
                </div>
                <div className='row py-3'>
                    <div className='col-sm-12 col-lg-4'>
                        <Button style={{width: '100px'}} type='submit' variant="contained" color="primary">
                            Login
                        </Button>
                    </div>
                </div>
                <div className='row py-3'>
                    <div className='col-sm-12 col-lg-4' style={{color: COLOR_DLG_TITLE}}>
                        Do you need to register? <Button type='button' variant="text" color="secondary" onClick={() => {
                            setRegisterValues({
                                fullName: '',
                                email: '',
                                password: '',
                                grade: '6',
                                confirmPassword: '',
                                showPassword: false
                            });
                            setShowRegisterDlg(true);
                    }}>Register</Button>
                    </div>
                </div>
            </form>
        </div>
    );
};
export default Login;

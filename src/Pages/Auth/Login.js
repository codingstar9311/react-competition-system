import React, {useEffect, useState} from "react";
import {auth, firestore, getUserDocument} from "../../firebase";
import {Button, TextField} from "@material-ui/core";

import logo from '../../Assets/Images/logo.png';
import {toast, ToastContainer} from "react-toastify";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import {Visibility, VisibilityOff} from "@material-ui/icons";
const title = 'Math Tournament';

const Login = (props) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [showRegisterDlg, setShowRegisterDlg] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

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

    return (
        <div className="container">
            <ToastContainer
                position='top-center'
                autoClose={2000}
                traggle/>
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
                    <div className='col-sm-12 col-lg-4' style={{color: 'blue'}}>
                        Do you need to register? <Button type='button' variant="text" color="secondary" onClick={() => setShowRegisterDlg(true)}>Register</Button>
                    </div>
                </div>
            </form>
        </div>
    );
};
export default Login;

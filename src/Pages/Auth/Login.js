import React, {useState} from "react";
import {auth, firestore, getUserDocument} from "../../firebase";
import {Button, TextField} from "@material-ui/core";

import logo from '../../Assets/Images/logo.png';
import {toast, ToastContainer} from "react-toastify";
const title = 'Math Tournament';

const Login = (props) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

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
                        } else {
                            localStorage.setItem('user_info', JSON.stringify(user));
                            props.history.push('/user/dashboard');
                        }
                    }
                } else {
                    toast.error('Please insert correct email or password!');
                }
            });
        auth.signInWithEmailAndPassword(email, password)
            .then(async authUser => {
                let userInfo = await getUserDocument(authUser.uid);
                localStorage.setItem('@user_info', JSON.stringify(userInfo));
                props.history.push('/profile');
            })
            .catch(error => {
                console.log(error.message);
                setEmailError('Wrong Email or password!');
            });
    };

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
                <div className='col-sm-12 col-lg-4'>
                    <div className='form-group'>
                        <TextField style={{minWidth: '100%'}}
                                   id={'email'}
                                   error={emailError != '' ? true : false}
                                   type={'email'}
                                   label={"Email"}
                                   variant='standard'
                                   onChange={(e) => setEmail(e.target.value)}
                                   onFocus={() => setEmailError('')}
                                   helperText={emailError}
                                   required/>
                    </div>
                    <div className='form-group'>
                        <TextField
                            error={passwordError != '' ? true : false}
                            style={{minWidth: '100%'}}
                            id='password'
                            type={'password'}
                            label={"Password"}
                            color={'primary'}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setPasswordError('')}
                            variant="standard" required/>
                    </div>
                    <div className='form-group'>
                        <Button style={{width: '100px'}} type='submit' variant="contained" color="primary">
                            Login
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};
export default Login;

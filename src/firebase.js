import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

import "firebase/functions";

var firebaseConfig = {
    apiKey: "AIzaSyAYVeqKi3f9-W0HTd_H90u5BEsHpes4HlM",
    authDomain: "competition-system.firebaseapp.com",
    projectId: "competition-system",
    storageBucket: "competition-system.appspot.com",
    messagingSenderId: "257465949676",
    appId: "1:257465949676:web:412c9fd4e06742d2f6f4c9",
    measurementId: "G-E7Q8PB6421"
};

firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const functions = firebase.functions();

export const getUserDocument = async uid => {
    if (!uid)
        return null;
    try {
        const userDocument = await firestore.doc(`users/${uid}`).get();
        return {
            ...userDocument.data()
        };
    } catch (error) {
        console.error("Error fetching user", error);
    }
};

export const generateUserDocument = async (uid, userInfo) => {
    if (!uid)
        return;
    const userDoc = firestore.doc(`users/${uid}`);
    const snapshot = await userDoc.get();
    if (!snapshot.exists) {
        try {
            await userDoc.set({...userInfo});
        } catch (error) {
            console.error("Error creating user document", error);
        }
    }
    return getUserDocument(uid);
};

export const adminCreateUser = async (uid, userInfo) => {
    if (!uid)
        return;
    const userDoc = firestore.doc(`users/${uid}`);
    const snapshot = await userDoc.get();
    if (!snapshot.exists) {
        try {
            await userDoc.set({...userInfo});
        } catch (error) {
            console.error("Error creating user document", error);
        }
    }
    return getUserDocument(uid);
};


import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

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

export const generateUserDocument = async (user, additionalData) => {
    if (!user) return;
    const userRef = firestore.doc(`users/${user.uid}`);
    const snapshot = await userRef.get();
    if (!snapshot.exists) {
        const { email, displayName, photoURL } = user;
        try {
            await userRef.set({
                displayName,
                email,
                photoURL,
                ...additionalData
            });
        } catch (error) {
            console.error("Error creating user document", error);
        }
    }
    return getUserDocument(user.uid);
};

export const getUserDocument = async uid => {
    if (!uid)
        return null;
    try {
        const userDocument = await firestore.doc(`users/${uid}`).get();
        return {
            uid,
            ...userDocument.data()
        };
    } catch (error) {
        console.error("Error fetching user", error);
    }
};


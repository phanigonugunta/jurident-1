import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, signInWithRedirect } from 'firebase/auth';
import { getFirestore, doc, getDoc, getDocs, setDoc, collection, writeBatch } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBXTNnaEYD6GYrPIXmocCAWt5-ApRwFDKk",
    authDomain: "jurident-case-details.firebaseapp.com",
    projectId: "jurident-case-details",
    storageBucket: "jurident-case-details.appspot.com",
    messagingSenderId: "1001180279233",
    appId: "1:1001180279233:web:7dbe7d738338827c50ff40",
    measurementId: "G-NYKLT1EFGW"
};

const app = initializeApp(firebaseConfig);

// Providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export const auth = getAuth();

export const signInWithGooglePopup = () => signInWithPopup(auth, googleProvider);

export const signInWithFacebook = () => {
    signInWithRedirect(auth, facebookProvider);
    getRedirectResult(auth)
        .then((result) => {
            const credential = FacebookAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;

        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.customData.email;
            const credential = FacebookAuthProvider.credentialFromError(error);
        });
};

export const db = getFirestore();

export const addCollectionAndDocuments = async (collectionKey, objectsToAdd) => {
    const collectionRef = collection(db, collectionKey);
    const batch = writeBatch(db);

    objectsToAdd.forEach((object) => {
        const docRef = doc(collectionRef, object.title.toLowerCase());
        batch.set(docRef, object);
    });

    await batch.commit();
    console.log('done');
}

export const createUserDocumentFromAuth = async (userAuth, additionalInformation) => {
    if (!userAuth) { return; }
    const userDocRef = doc(db, 'users', userAuth.uid);
    const userSnapshot = await getDoc(userDocRef);

    if (!userSnapshot.exists()) {
        const { email } = userAuth;
        const createdAt = new Date();
        try {
            await setDoc(userDocRef, { email, createdAt, ...additionalInformation });
        } catch (error) {
            console.log('Error creating the user', error.message);
        }
    }

    return userDocRef;
}


export const createDocWithUserIDRef = async (userAuth, additionalInformation) => {
    if (!userAuth) { return; }
    const createdAt = new Date();
    const currenttime = Date.now();
    const userDocRef = doc(db, 'cases', userAuth.uid, 'case', `${currenttime}`);
    const userSnapshot = await getDoc(userDocRef);

    if (!userSnapshot.exists()) {
        try {
            await setDoc(userDocRef, { createdAt, ...additionalInformation });
        } catch (error) {
            console.log('Error creating the user', error.message);
        }
    }
}


export const fetchDocWithUserIDRef = async (userAuth) => {
    if (!userAuth) { return; }
    const casesDocRef = doc(db, 'cases', userAuth.uid);
    const caseDocRef = collection(casesDocRef, 'case');
    const caseSnapshot = await getDocs(caseDocRef);


    const latestCases = [];
    caseSnapshot.forEach(doc => {
        latestCases.push(doc.data());
    })
    return latestCases;

}

export const createAuthUserWithEmailAndPassword = async (email, password) => {
    if (!email || !password) { return; }
    return await createUserWithEmailAndPassword(auth, email, password)
}

export const signInAuthUserWithEmailAndPassword = async (email, password) => {
    if (!email || !password) { return; }
    return signInWithEmailAndPassword(auth, email, password);
}

export const signOutUser = async () => await signOut(auth)

export const onAuthStateChangedListner = (callback) => onAuthStateChanged(auth, callback); 
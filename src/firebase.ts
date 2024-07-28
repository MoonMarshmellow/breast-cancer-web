import { initializeApp, getApp, getApps} from "firebase/app";
import{getAuth} from 'firebase/auth'
import{getFirestore} from 'firebase/firestore'
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const firestore = getFirestore(app)
const auth = getAuth(app)
const functions = getFunctions(app, 'europe-west3')
const storage = getStorage(app, 'gs://breast-cancer-849aa.appspot.com')


export {app, firestore, auth, functions, storage}
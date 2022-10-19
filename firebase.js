// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {getFirestore} from "firebase/firestore"
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDUt8qU8081Wri5TRLAaxUnRNG4nPz_3fA",
  authDomain: "crypto-mat-bc6e4.firebaseapp.com",
  projectId: "crypto-mat-bc6e4",
  storageBucket: "crypto-mat-bc6e4.appspot.com",
  messagingSenderId: "404842140518",
  appId: "1:404842140518:web:92f2454cf9e84fe1f12ea7",
  measurementId: "G-VFEFLQKNXP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore();
export {db}
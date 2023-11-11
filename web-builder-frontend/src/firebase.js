// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAttQ4C1sxnVuGG9vuFZgg4dGOVAFdGgXo",
    authDomain: "cscc09-porject.firebaseapp.com",
    projectId: "cscc09-porject",
    storageBucket: "cscc09-porject.appspot.com",
    messagingSenderId: "975485542126",
    appId: "1:975485542126:web:ddb30c608e4039d403ddff",
    measurementId: "G-8D92M4DV33"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {
  auth,
  db
}
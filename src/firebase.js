// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDKPNb7xpu22SGGTZqsTZZb4TazMiQW_IY",
  authDomain: "nouns-jp-vote-dev.firebaseapp.com",
  projectId: "nouns-jp-vote-dev",
  storageBucket: "nouns-jp-vote-dev.appspot.com",
  messagingSenderId: "528851718328",
  appId: "1:528851718328:web:4e5f8bfa99e578866d644d",
  measurementId: "G-07D6QR74Y0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export default getFirestore();

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD0qof03vjLn7OuohMOvfi_OX94YM9jtxs",
  authDomain: "vote-app-db-f4346.firebaseapp.com",
  projectId: "vote-app-db-f4346",
  storageBucket: "vote-app-db-f4346.appspot.com",
  messagingSenderId: "93673972581",
  appId: "1:93673972581:web:99404d6e0dc956d7adb78c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export default getFirestore();
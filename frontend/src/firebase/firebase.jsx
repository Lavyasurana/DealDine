// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDVoWoxzR05FvTsFIgmJ1MulKecvuKA6eE",
  authDomain: "dealdine-882f2.firebaseapp.com",
  projectId: "dealdine-882f2",
  storageBucket: "dealdine-882f2.firebasestorage.app",
  messagingSenderId: "338701241306",
  appId: "1:338701241306:web:982c0316d7fb4dd87a0ee3",
  measurementId: "G-37SGXRXPRE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDVoWoxzR05FvTsFIgmJ1MulKecvuKA6eE",
  authDomain: "dealdine-882f2.firebaseapp.com",
  projectId: "dealdine-882f2",
  messagingSenderId: "338701241306",
  appId: "1:338701241306:web:982c0316d7fb4dd87a0ee3"
};

const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app);
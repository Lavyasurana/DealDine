importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js")

firebase.initializeApp({
    apiKey: "AIzaSyDVoWoxzR05FvTsFIgmJ1MulKecvuKA6eE",
    authDomain: "dealdine-882f2.firebaseapp.com",
    projectId: "dealdine-882f2",
    messagingSenderId: "338701241306",
    appId: "1:338701241306:web:982c0316d7fb4dd87a0ee3"
})

 const messaging = firebase.messaging()
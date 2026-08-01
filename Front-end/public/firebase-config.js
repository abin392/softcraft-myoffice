// Import the stable v10.8.1 Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-analytics.js";

// Your exact Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCzL2cDG4xf3rK3r6RwdT1Z5LJun7537ik",
    authDomain: "stackcraft-technologies-7f3eb.firebaseapp.com",
    projectId: "stackcraft-technologies-7f3eb",
    storageBucket: "stackcraft-technologies-7f3eb.firebasestorage.app",
    messagingSenderId: "1028413439593",
    appId: "1:1028413439593:web:425b467c7539114e76ecf8",
    measurementId: "G-DQH58HGD10"
};

// Initialize Firebase ONLY ONCE
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { app, auth, db };
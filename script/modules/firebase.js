import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCl4Tr2Cz1Q5-S4yw066CAKzIv2wUwDpvk",
    authDomain: "work-1e42f.firebaseapp.com",
    projectId: "work-1e42f",
    storageBucket: "work-1e42f.firebasestorage.app",
    messagingSenderId: "766761047257",
    appId: "1:766761047257:web:d848a496ca346862c21ac8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
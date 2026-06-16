import { db } 
from "./firebase.js";
import { getFirestore, collection, addDoc, getDocs }
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const auth = getAuth(app);

async function register(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("User created:", userCredential.user);
    } catch (error) {
        console.error(error.message);
    }
}

export async function login(email, password) {
    email = email.trim();

    if (!email.includes("@")) {
        alert("Invalid email format");
        return;
    }

    if (!password) {
        alert("Password required");
        return;
    }

    const result = await signInWithEmailAndPassword(auth, email, password);

    return result.user;
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Logged in as:", user.email);
    } else {
        console.log("Not logged in");
    }
});

async function logout() {
    await signOut(auth);
}
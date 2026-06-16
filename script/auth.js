import { auth } from "./firebase.js";
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

export async function login(email, password) {
    email = email.trim();
    return await signInWithEmailAndPassword(auth, email, password);
}

export function logout() {
    return signOut(auth);
}

export function watchAuth(callback) {
    onAuthStateChanged(auth, (user) => {
        callback(user);
    });
}
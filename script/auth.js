import { auth } from "./firebase.js";
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const allowedEmail = "you@example.com";

export async function login(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password);

    if (result.user.email !== allowedEmail) {
        alert("Not allowed");
        await signOut(auth);
        return null;
    }

    return result.user;
}

export function logout() {
    return signOut(auth);
}

export function watchAuth(callback) {
    onAuthStateChanged(auth, (user) => {
        if (user && user.email === allowedEmail) {
            callback(user);
        } else {
            callback(null);
        }
    });
}
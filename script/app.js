import { db } from "./firebase.js";
import { collection, addDoc } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { login, logout, watchAuth } from "./auth.js";

const loginBox = document.getElementById("loginBox");
const appBox = document.getElementById("app");

document.getElementById("loginBtn").onclick = async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    await login(email, password);
};

document.getElementById("logoutBtn").onclick = async () => {
    await logout();
};

document.getElementById("addBtn").onclick = async () => {
    await addDoc(collection(db, "data"), {
        text: "Hello",
        time: new Date()
    });
};

watchAuth((user) => {
    if (user) {
        loginBox.style.display = "none";
        appBox.style.display = "block";
    } else {
        loginBox.style.display = "block";
        appBox.style.display = "none";
    }
});
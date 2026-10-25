import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const errorMsg = document.getElementById("errorMsg");
const loginBtn = document.getElementById("loginBtn");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

emailInput.focus();

document.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !loginBtn.disabled) {
        loginBtn.click();
    }
});

loginBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        errorMsg.textContent = "Please enter both email and password.";
        return;
    }

    try {
        errorMsg.textContent = "";
        loginBtn.disabled = true;
        loginBtn.textContent = "Logging in...";

        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "homepage.html";
    } catch (error) {
        console.error("Login error:", error);

        switch (error.code) {
            case "auth/too-many-requests":
                errorMsg.textContent = "Too many login attempts. Please try again later.";
                break;
            case "auth/invalid-credential":
                errorMsg.textContent = "Invalid email or password.";
                break;
            case "auth/network-request-failed":
                errorMsg.textContent = "Network error. Check your internet connection.";
                break;
            default:
                errorMsg.textContent = "Login failed. Please try again.";
        }
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = ":3";
    }
});

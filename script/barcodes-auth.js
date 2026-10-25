import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
    document.getElementById("appNavbar").hidden = !user;
    document.getElementById("presetBarcode").hidden = !user;

    const barcodeInput = document.getElementById("barcodeValue");
    if (user && !barcodeInput.value) {
        barcodeInput.value = "100";
        barcodeInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
});

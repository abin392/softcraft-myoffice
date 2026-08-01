// Import centralized Firebase configuration
import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const authLoader = document.getElementById("auth-loader");
const secureContent = document.getElementById("secure-content");

// STRICT RBAC CHECK
onAuthStateChanged(auth, (user) => {
    if (user && user.email === "abinr392@gmail.com") {
        // Admin confirmed -> Reveal the Data Table
        console.log("Admin Access Granted for Client Search.");
        authLoader.style.display = "none";
        secureContent.style.display = "block";
    } else {
        // Unauthorized user -> Immediate ejection
        console.warn("Unauthorized access attempt. Redirecting to home...");
        window.location.replace("index.html");
    }
});
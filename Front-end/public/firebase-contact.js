// Import the stable v10.8.1 Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-analytics.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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
const analytics = getAnalytics(app);
const db = getFirestore(app);

// --- 1. AUTO-REFILL SAVED FORM DATA ---
window.addEventListener("DOMContentLoaded", function () {
    const pendingName = localStorage.getItem("pendingContactName");
    if (pendingName) {
        document.getElementById("contactName").value = pendingName;
        document.getElementById("contactEmail").value = localStorage.getItem("pendingContactEmail") || "";
        document.getElementById("contactCompany").value = localStorage.getItem("pendingContactCompany") || "";
        document.getElementById("contactMessage").value = localStorage.getItem("pendingContactMessage") || "";
    }
});

// --- 2. FIREBASE SUBMISSION & AUTH CHECK ---
const contactBtn = document.getElementById("contactBtn");

if (contactBtn) {
    contactBtn.addEventListener("click", async function (event) {
        event.preventDefault();

        // Grab values from the HTML inputs
        const name = document.getElementById("contactName").value.trim();
        const email = document.getElementById("contactEmail").value.trim();
        const company = document.getElementById("contactCompany").value.trim();
        const message = document.getElementById("contactMessage").value.trim();

        // Basic Validation
        if (!name || !email || !message) {
            if (typeof showToast === 'function') showToast("Please fill in your Name, Email, and Project Details.", "error");
            else alert("Please fill in your Name, Email, and Project Details.");
            return;
        }

        // AUTHENTICATION CHECK
        const currentUserEmail = localStorage.getItem("userEmail");
        const lastLogin = localStorage.getItem("lastLoginTimestamp");
        const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
        let isAuthenticated = false;

        if (currentUserEmail && lastLogin) {
            const timeSinceLastLogin = Date.now() - parseInt(lastLogin);
            if (timeSinceLastLogin <= THREE_DAYS_MS) {
                isAuthenticated = true;
            }
        }

        // If NOT logged in -> Save data & Redirect
        if (!isAuthenticated) {
            localStorage.setItem("pendingContactName", name);
            localStorage.setItem("pendingContactEmail", email);
            localStorage.setItem("pendingContactCompany", company);
            localStorage.setItem("pendingContactMessage", message);

            if (typeof showToast === 'function') showToast("Authentication required. Please sign in to submit your inquiry.", "error");
            else alert("Authentication required. Please create an account or sign in.");

            setTimeout(() => { window.location.href = "sign.html"; }, 2000);
            return;
        }

        // IF LOGGED IN -> PROCEED WITH SENDING
        const originalBtnText = contactBtn.innerHTML;
        contactBtn.innerHTML = `Sending... <i class="fa-solid fa-spinner fa-spin"></i>`;
        contactBtn.disabled = true;

        try {
            // 10-Second Timeout Safeguard
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("TIMEOUT")), 10000)
            );

            const saveTask = addDoc(collection(db, "inquiries"), {
                name: name, email: email, company: company, message: message,
                timestamp: new Date().toISOString()
            });

            await Promise.race([saveTask, timeoutPromise]);

            // Success
            if (typeof showToast === 'function') showToast("Inquiry successfully sent! Our team will contact you.", "success");
            else alert("Inquiry successfully sent!");

            // Clear the form fields completely
            document.getElementById("contactName").value = "";
            document.getElementById("contactEmail").value = "";
            document.getElementById("contactCompany").value = "";
            document.getElementById("contactMessage").value = "";

            // Wipe temporary data
            localStorage.removeItem("pendingContactName");
            localStorage.removeItem("pendingContactEmail");
            localStorage.removeItem("pendingContactCompany");
            localStorage.removeItem("pendingContactMessage");

        } catch (error) {
            console.error("Firebase Error: ", error);
            if (error.message === "TIMEOUT") {
                if (typeof showToast === 'function') showToast("Connection Timed Out! Check your database rules.", "error");
                else alert("Connection Timed Out!");
            } else {
                if (typeof showToast === 'function') showToast("Connection error. Check your Firestore database security.", "error");
                else alert("Connection error.");
            }
        } finally {
            contactBtn.innerHTML = originalBtnText;
            contactBtn.disabled = false;
        }
    });
}

// --- 3. ENTER KEY NAVIGATION LOGIC ---
window.addEventListener("DOMContentLoaded", function () {
    const nameInput = document.getElementById("contactName");
    const emailInput = document.getElementById("contactEmail");
    const companyInput = document.getElementById("contactCompany");
    const messageInput = document.getElementById("contactMessage");
    const submitBtn = document.getElementById("contactBtn");

    if (nameInput && emailInput && companyInput && messageInput && submitBtn) {
        const formInputs = [nameInput, emailInput, companyInput, messageInput];

        formInputs.forEach((input, index) => {
            input.addEventListener("keydown", function (event) {
                if (event.key === "Enter") {
                    // SAFEGUARD: Allow Shift+Enter for new lines in the textarea
                    if (index === formInputs.length - 1 && event.shiftKey) return;

                    event.preventDefault();

                    if (index < formInputs.length - 1) {
                        formInputs[index + 1].focus(); // Jump to next box
                    } else {
                        submitBtn.click(); // Click submit
                    }
                }
            });
        });
    }
});
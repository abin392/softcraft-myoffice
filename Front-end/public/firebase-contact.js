import { auth, db } from "./firebase-config.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// --- DYNAMIC MOBILE NUMBER VALIDATION ---
window.addEventListener("DOMContentLoaded", function () {
    const phoneInput = document.getElementById("contactPhone");
    const phoneCheckIcon = document.getElementById("phone-check-icon");

    if (phoneInput && phoneCheckIcon) {
        phoneInput.addEventListener("input", function () {
            // 1. Instantly strip out any letters, spaces, or symbols
            let digitsOnly = this.value.replace(/\D/g, '');
            
            // 2. Force it to never exceed 10 digits
            if (digitsOnly.length > 10) {
                digitsOnly = digitsOnly.substring(0, 10);
            }
            
            // 3. Update the input field with the cleaned numbers
            this.value = digitsOnly;
            
            // 4. Show the green checkmark ONLY when exactly 10 digits are present
            if (digitsOnly.length === 10) {
                phoneCheckIcon.style.opacity = "1";
            } else {
                phoneCheckIcon.style.opacity = "0";
            }
        });
    }
});

// --- 1. AUTO-REFILL SAVED FORM DATA ---
window.addEventListener("DOMContentLoaded", function () {
    const pendingName = localStorage.getItem("pendingContactName");
    if (pendingName) {
        document.getElementById("contactName").value = pendingName;
        document.getElementById("contactEmail").value = localStorage.getItem("pendingContactEmail") || "";
        document.getElementById("contactCompany").value = localStorage.getItem("pendingContactCompany") || "";
        document.getElementById("contactPhone").value = localStorage.getItem("pendingContactPhone") || "";
        document.getElementById("contactMessage").value = localStorage.getItem("pendingContactMessage") || "";
    }
});

// --- 2. FIREBASE SUBMISSION & AUTH CHECK ---
const contactBtn = document.getElementById("contactBtn");

if (contactBtn) {
    contactBtn.addEventListener("click", async function (event) {
        event.preventDefault();

        const name = document.getElementById("contactName").value.trim();
        const email = document.getElementById("contactEmail").value.trim();
        const company = document.getElementById("contactCompany").value.trim();
        const phone = document.getElementById("contactPhone").value.trim();
        const message = document.getElementById("contactMessage").value.trim();

        // --- NEW: MANDATORY PHONE NUMBER CHECK ---
        if (!name || !email || !message || phone.length !== 10) {
            if (typeof showToast === 'function') showToast("Please fill in your Name, Email, Project Details, and a valid 10-digit Mobile No.", "error");
            else alert("Please fill in your Name, Email, Project Details, and a valid 10-digit Mobile No.");
            return;
        }

        // --- NEW: CLIENT-SIDE RATE LIMITING (10 SECOND COOLDOWN) ---
        const lastSubmitTime = localStorage.getItem("lastInquiryTime");
        const currentTime = new Date().getTime();
        const cooldownMs = 10 * 1000; // 10 seconds in milliseconds

        if (lastSubmitTime && (currentTime - parseInt(lastSubmitTime)) < cooldownMs) {
            // Calculate remaining seconds instead of minutes
            const secondsLeft = Math.ceil((cooldownMs - (currentTime - parseInt(lastSubmitTime))) / 1000);
            
            if (typeof showToast === 'function') {
                showToast(`Rate limit active. Please wait ${secondsLeft} second(s) before sending another inquiry.`, "error");
            } else {
                alert(`Rate limit active. Please wait ${secondsLeft} second(s) before sending another inquiry.`);
            }
            return;
        }

        // FIREBASE AUTHENTICATION CHECK
        const isAuthenticated = auth.currentUser !== null;

        // If NOT logged in -> Save data & Redirect
        if (!isAuthenticated) {
            // ... (Keep your existing pending data save and redirect logic here) ...
            localStorage.setItem("pendingContactName", name);
            localStorage.setItem("pendingContactEmail", email);
            localStorage.setItem("pendingContactCompany", company);
            localStorage.setItem("pendingContactPhone", phone);
            localStorage.setItem("pendingContactMessage", message);

            if (typeof showToast === 'function') showToast("Authentication required. Please sign in to submit your inquiry.", "error");
            else alert("Authentication required. Please create an account or sign in.");

            setTimeout(() => { window.location.href = "login.html"; }, 2000);
            return;
        }

        // IF LOGGED IN -> PROCEED WITH SENDING
        const originalBtnText = contactBtn.innerHTML;
        contactBtn.innerHTML = `Sending... <i class="fa-solid fa-spinner fa-spin"></i>`;
        contactBtn.disabled = true;

        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("TIMEOUT")), 10000)
            );

            const saveTask = addDoc(collection(db, "inquiries"), {
                name: name, email: email, company: company, phone: phone, message: message,
                timestamp: new Date().toISOString(),
                userId: auth.currentUser.uid 
            });

            await Promise.race([saveTask, timeoutPromise]);

            // --- NEW: RECORD TIMESTAMP ON SUCCESSFUL SUBMISSION ---
            localStorage.setItem("lastInquiryTime", new Date().getTime().toString());

            if (typeof showToast === 'function') showToast("Inquiry successfully sent! Our team will contact you.", "success");
            else alert("Inquiry successfully sent!");

            // Clear fields
            document.getElementById("contactName").value = "";
            document.getElementById("contactEmail").value = "";
            document.getElementById("contactCompany").value = "";
            document.getElementById("contactPhone").value = "";
            document.getElementById("contactMessage").value = "";

            // Wipe temporary data
            localStorage.removeItem("pendingContactName");
            localStorage.removeItem("pendingContactEmail");
            localStorage.removeItem("pendingContactCompany");
            localStorage.removeItem("pendingContactPhone");
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
                    if (index === formInputs.length - 1 && event.shiftKey) return;
                    event.preventDefault();
                    if (index < formInputs.length - 1) formInputs[index + 1].focus();
                    else submitBtn.click();
                }
            });
        });
    }
});
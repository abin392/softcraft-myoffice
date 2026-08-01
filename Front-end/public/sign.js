import { auth } from "./firebase-config.js";
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", function () {

    // --- 1. SHOW/HIDE PASSWORD LOGIC ---
    const togglePasswords = document.querySelectorAll('.toggle-password');
    togglePasswords.forEach(icon => {
        icon.addEventListener('click', function () {
            const input = this.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
            }
        });
    });

    // --- 2. PASSWORD MATCH VALIDATION & FIREBASE EMAIL CREATION ---
    const form = document.getElementById("signup-form");
    const pass1 = document.getElementById("pass1");
    const pass2 = document.getElementById("pass2");
    const alertBox = document.getElementById("password-alert");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (pass1.value !== pass2.value) {
            alertBox.style.display = "flex";
            pass1.style.borderColor = "#ef4444";
            pass2.style.borderColor = "#ef4444";
            return;
        }

        const name = document.getElementById("fullName").value.trim();
        const email = document.getElementById("emailAdd").value.trim();
        const pass = pass1.value;
        const submitBtn = document.querySelector(".sign-btn");

        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = `Creating... <i class="fa-solid fa-spinner fa-spin"></i>`;
        submitBtn.disabled = true;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            await updateProfile(userCredential.user, { displayName: name });

            if (typeof showToast === 'function') showToast(`Welcome to the Elite, ${name}! Your account has been securely created.`, "success");
            else alert(`Welcome to the Elite, ${name}! Your account has been securely created.`);

            setTimeout(() => {
                if (localStorage.getItem("pendingContactName")) window.location.href = "index.html#contact";
                else window.location.href = "index.html";
            }, 2000);

        } catch (error) {
            console.error("Signup Error:", error);
            if (typeof showToast === 'function') showToast(error.message, "error");
            else alert(error.message);
            
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    // Clear warnings on typing
    pass1.addEventListener("input", function () {
        alertBox.style.display = "none";
        pass1.style.borderColor = "rgba(255, 255, 255, 0.08)";
        pass2.style.borderColor = "rgba(255, 255, 255, 0.08)";
    });

    pass2.addEventListener("input", function () {
        alertBox.style.display = "none";
        pass1.style.borderColor = "rgba(255, 255, 255, 0.08)";
        pass2.style.borderColor = "rgba(255, 255, 255, 0.08)";
    });

    // --- 3. GOOGLE AUTHENTICATION ---
    const googleBtn = document.getElementById("googleSignBtn");
    if (googleBtn) {
        googleBtn.addEventListener("click", async function () {
            const provider = new GoogleAuthProvider();
            const originalContent = googleBtn.innerHTML;
            
            googleBtn.innerHTML = `Connecting... <i class="fa-solid fa-spinner fa-spin"></i>`;
            googleBtn.disabled = true;

            try {
                const result = await signInWithPopup(auth, provider);
                const userName = result.user.displayName || "Engineer";

                if (typeof showToast === 'function') showToast(`Registration successful. Welcome, ${userName}.`, "success");
                else alert(`Registration successful. Welcome, ${userName}.`);

                setTimeout(() => {
                    if (localStorage.getItem("pendingContactName")) window.location.href = "index.html#contact";
                    else window.location.href = "index.html";
                }, 2000);

            } catch (error) {
                console.error("Google Signup Error:", error);
                if (typeof showToast === 'function') showToast("Google Sign-In failed or was cancelled.", "error");
                else alert("Google Sign-In failed.");

                googleBtn.innerHTML = originalContent;
                googleBtn.disabled = false;
            }
        });
    }
});
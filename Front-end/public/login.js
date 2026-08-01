import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

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

    // --- 2. FIREBASE EMAIL LOGIN VERIFICATION ---
    const form = document.getElementById("login-form");
    const emailInput = document.getElementById("loginEmail");
    const passInput = document.getElementById("loginPass");
    const loginBtn = document.querySelector(".login-btn");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const originalText = loginBtn.innerHTML;
        loginBtn.innerHTML = `Logging in... <i class="fa-solid fa-spinner fa-spin"></i>`;
        loginBtn.disabled = true;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, emailInput.value, passInput.value);
            const userName = userCredential.user.displayName || "Engineer";

            if (typeof showToast === 'function') showToast(`Authentication successful. Welcome back, ${userName}.`, "success");
            else alert(`Authentication successful. Welcome back, ${userName}.`);

            setTimeout(() => {
                if (localStorage.getItem("pendingContactName")) window.location.href = "index.html#contact";
                else window.location.href = "index.html";
            }, 2000);

        } catch (error) {
            console.error("Login Error:", error);
            if (typeof showToast === 'function') showToast("Authentication failed. Invalid Email or Password.", "error");
            else alert("Authentication failed. Invalid Email or Password.");
            
            loginBtn.innerHTML = originalText;
            loginBtn.disabled = false;
        }
    });

    // --- 3. GOOGLE AUTHENTICATION ---
    const googleBtn = document.getElementById("googleLoginBtn");
    if (googleBtn) {
        googleBtn.addEventListener("click", async function () {
            const provider = new GoogleAuthProvider();
            const originalContent = googleBtn.innerHTML;
            
            googleBtn.innerHTML = `Connecting... <i class="fa-solid fa-spinner fa-spin"></i>`;
            googleBtn.disabled = true;

            try {
                const result = await signInWithPopup(auth, provider);
                const userName = result.user.displayName || "Engineer";

                if (typeof showToast === 'function') showToast(`Authentication successful. Welcome, ${userName}.`, "success");
                else alert(`Authentication successful. Welcome, ${userName}.`);

                setTimeout(() => {
                    if (localStorage.getItem("pendingContactName")) window.location.href = "index.html#contact";
                    else window.location.href = "index.html";
                }, 2000);

            } catch (error) {
                console.error("Google Login Error:", error);
                if (typeof showToast === 'function') showToast("Google Sign-In failed or was cancelled.", "error");
                else alert("Google Sign-In failed.");

                googleBtn.innerHTML = originalContent;
                googleBtn.disabled = false;
            }
        });
    }
});
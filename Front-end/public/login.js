document.addEventListener("DOMContentLoaded", function () {

    // --- 1. PREMIUM REVEAL ANIMATION ---
    const reveals = document.querySelectorAll(".reveal-up");
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add("active");
        });
    });
    reveals.forEach(reveal => observer.observe(reveal));

    // --- 2. LOGIN VERIFICATION LOGIC ---
    const form = document.querySelector("form");
    const emailInput = document.querySelector("input[type='email']");
    const passInput = document.querySelector("input[type='password']");

    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent page reload

        // Grab the stored details
        const storedEmail = localStorage.getItem("userEmail");
        const storedPass = localStorage.getItem("userPass");
        const userName = localStorage.getItem("userName");

        // Verify credentials
        if (emailInput.value === storedEmail && passInput.value === storedPass) {

            // Success! Reset the 3-day timer
            localStorage.setItem("lastLoginTimestamp", Date.now().toString());

            // Show Custom Toast Notification (Fallback to alert if toast.js isn't linked)
            if (typeof showToast === 'function') {
                showToast(`Authentication successful. Welcome back, ${userName}.`, "success");
            } else {
                alert(`Authentication successful. Welcome back, ${userName}.`);
            }

            // Wait 2 seconds, then Smart Redirect
            setTimeout(() => {
                // If they have a pending form, jump directly to the contact section!
                if (localStorage.getItem("pendingContactName")) {
                    window.location.href = "index.html#contact";
                } else {
                    window.location.href = "index.html";
                }
            }, 2000);

        } else {
            // Failure
            if (typeof showToast === 'function') {
                showToast("Authentication failed. Invalid Email or Password.", "error");
            } else {
                alert("Authentication failed. Invalid Email or Password.");
            }
        }
    });
});
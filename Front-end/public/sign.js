document.addEventListener("DOMContentLoaded", function () {

    // --- 1. PREMIUM REVEAL ANIMATION ---
    const reveals = document.querySelectorAll(".reveal-up");
    const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
            } else {
                entry.target.classList.remove("active");
            }
        });
    }, observerOptions);

    reveals.forEach(reveal => {
        observer.observe(reveal);
    });

    // --- 2. PASSWORD MATCH VALIDATION & ACCOUNT CREATION ---
    const form = document.getElementById("signup-form");
    const pass1 = document.getElementById("pass1");
    const pass2 = document.getElementById("pass2");
    const alertBox = document.getElementById("password-alert");

    form.addEventListener("submit", function (event) {
        if (pass1.value !== pass2.value) {
            // Passwords don't match -> show error
            event.preventDefault();
            alertBox.style.display = "flex";
            pass1.style.borderColor = "#ef4444";
            pass2.style.borderColor = "#ef4444";
        } else {
            // Passwords DO match -> Save the user!
            event.preventDefault();

            // Grab the data from the inputs
            const name = document.getElementById("fullName").value;
            const email = document.getElementById("emailAdd").value;
            const pass = pass1.value;

            // Store securely
            localStorage.setItem("userName", name);
            localStorage.setItem("userEmail", email);
            localStorage.setItem("userPass", pass);
            localStorage.setItem("lastLoginTimestamp", Date.now().toString());

            // Show Custom Toast Notification (instead of ugly alert)
            if (typeof showToast === 'function') {
                showToast(`Welcome to the Elite, ${name}! Your account has been securely created.`, "success");
            } else {
                alert(`Welcome to the Elite, ${name}! Your account has been securely created.`);
            }

            // Wait 2 seconds, then Smart Redirect
            setTimeout(() => {
                // If they came from the contact form, jump right back to it!
                if (localStorage.getItem("pendingContactName")) {
                    window.location.href = "index.html#contact";
                } else {
                    window.location.href = "index.html";
                }
            }, 2000);
        }
    });

    // Remove the red warning styles as soon as the user starts typing again
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
});
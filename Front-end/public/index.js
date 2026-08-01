import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// Because this script is a module, the DOM is already fully loaded.
// We execute immediately to ensure the UI updates the moment Firebase confirms the login.

// --- 1. FIREBASE SESSION & AUTHENTICATION UI LOGIC ---
const navAuthWrapper = document.querySelector(".nav-auth-wrapper");
const navBtn = document.getElementById("nav-action-btn");
const profileName = document.getElementById("profile-name");
const profileEmail = document.getElementById("profile-email");
const profileAvatar = document.getElementById("profile-avatar");
const dropdownLogoutBtn = document.getElementById("dropdown-logout-btn");
const heroBtn = document.querySelector(".hero-buttons .btn-primary");
const logoutItem = document.getElementById("logout-item"); 

// Listens for login/logout state changes automatically
onAuthStateChanged(auth, (user) => {
    if (user) {
        // --- NEW: ADMIN AUTO-REDIRECT ---
        // If the admin logs in or visits index.html, immediately route them to the dashboard
        if (user.email === "abinr392@gmail.com" && !window.location.pathname.includes("admin.html")) {
            window.location.replace("admin.html");
            return; // Halt execution of the regular client UI logic
        }

        // --- USER IS LOGGED IN (Client Logic) ---
        const userName = user.displayName || "Engineer";
        const userEmail = user.email || "No email provided";
        
        // 1. Setup Navbar Button
        if (navBtn) {
            navBtn.innerHTML = `<i class="fa-solid fa-user-astronaut"></i> ${userName}`;
            navBtn.href = "#";
            
            // Replaces hover with a reliable click/tap toggle for mobile devices
            navBtn.onclick = function(e) {
                e.preventDefault();
                navAuthWrapper.classList.toggle("active");
            };
        }
        
        // 2. Populate User Profile Dropdown
        if (navAuthWrapper) navAuthWrapper.classList.add("is-logged-in");
        if (profileName) profileName.textContent = userName;
        if (profileEmail) profileEmail.textContent = userEmail;
        if (profileAvatar) {
            // If they signed in with Google, use their profile pic. Otherwise use an icon.
            if (user.photoURL) {
                profileAvatar.innerHTML = `<img src="${user.photoURL}" alt="${userName}">`;
            } else {
                profileAvatar.innerHTML = `<i class="fa-solid fa-user"></i>`;
            }
        }

        // 3. Setup Hero Section
        if (heroBtn) {
            heroBtn.style.display = "none";
            if (!document.getElementById("hero-welcome-msg")) {
                const welcomeMsg = document.createElement("h2");
                welcomeMsg.id = "hero-welcome-msg";
                welcomeMsg.className = "hero-welcome-text reveal-up active"; 
                welcomeMsg.innerHTML = `Welcome to <span class="glow-name">${userName}</span>`;
                const heroButtonsContainer = document.querySelector(".hero-buttons");
                if (heroButtonsContainer && heroButtonsContainer.parentNode) {
                    heroButtonsContainer.parentNode.insertBefore(welcomeMsg, heroButtonsContainer);
                }
            }
        }
        
        if (logoutItem && window.innerWidth > 768) logoutItem.style.display = "block";
    } else {
        // --- USER IS LOGGED OUT ---
        if (navAuthWrapper) navAuthWrapper.classList.remove("is-logged-in");
        if (navBtn) {
            navBtn.innerHTML = "Get Started";
            navBtn.href = "login.html";
        }
        if (heroBtn) {
            heroBtn.style.display = "inline-flex";
            heroBtn.href = "login.html";
        }
        if (logoutItem) logoutItem.style.display = "none";
        
        const welcomeMsg = document.getElementById("hero-welcome-msg");
        if (welcomeMsg) welcomeMsg.remove();
    }
});

// Execute Logout Logic (Handles both the old mobile link and the new dropdown button)
async function triggerLogout(event) {
    event.preventDefault();
    try {
        await signOut(auth);
        window.location.reload();
    } catch (error) {
        console.error("Logout Error:", error);
    }
}
if (dropdownLogoutBtn) dropdownLogoutBtn.addEventListener("click", triggerLogout);
const oldLogoutBtn = document.getElementById("logout-btn");
if (oldLogoutBtn) oldLogoutBtn.addEventListener("click", triggerLogout);



// --- 2. IMAGE LIGHTBOX LOGIC ---
const lightbox = document.getElementById('image-lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeBtn = document.querySelector('.lightbox-close');
const glassImages = document.querySelectorAll('.glass-img');

if (lightbox && lightboxImg) {
    glassImages.forEach(img => {
        img.addEventListener('click', function () {
            lightbox.classList.add('show');
            lightboxImg.src = this.src;
            document.body.style.overflow = 'hidden';
        });
    });

    function closeLightbox() {
        lightbox.classList.remove('show');
        document.body.style.overflow = 'auto';
        setTimeout(() => {
            if (!lightbox.classList.contains('show')) lightboxImg.src = "";
        }, 300);
    }

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', function (event) {
        if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === "Escape" && lightbox.classList.contains('show')) {
            closeLightbox();
        }
    });
}


// --- 3. PRIVACY POLICY MODAL LOGIC ---
const privacyLinks = document.querySelectorAll('a');
const privacyModal = document.getElementById('privacy-modal');
const privacyCheckbox = document.getElementById('privacy-checkbox');
const privacyGotItBtn = document.getElementById('privacy-got-it');

if (privacyModal) {
    privacyLinks.forEach(link => {
        if (link.textContent.trim().toLowerCase() === "privacy policy") {
            link.addEventListener('click', function (event) {
                event.preventDefault();
                privacyModal.classList.add('show');
                document.body.style.overflow = 'hidden';

                if (privacyCheckbox && privacyGotItBtn) {
                    privacyCheckbox.checked = false;
                    privacyGotItBtn.disabled = true;
                }
            });
        }
    });

    function closePrivacy() {
        privacyModal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }

    if (privacyCheckbox && privacyGotItBtn) {
        privacyCheckbox.addEventListener('change', function () {
            privacyGotItBtn.disabled = !this.checked;
        });
        privacyGotItBtn.addEventListener('click', closePrivacy);
    }
}


// --- 4. TERMS OF SERVICE MODAL LOGIC ---
const termsModal = document.getElementById('terms-modal');
const termsCheckbox = document.getElementById('terms-checkbox');
const termsGotItBtn = document.getElementById('terms-got-it');

if (termsModal) {
    const allLinks = document.querySelectorAll('a');
    allLinks.forEach(link => {
        if (link.textContent.trim().toLowerCase() === "terms of service") {
            link.addEventListener('click', function (event) {
                event.preventDefault();
                termsModal.classList.add('show');
                document.body.style.overflow = 'hidden';

                if (termsCheckbox && termsGotItBtn) {
                    termsCheckbox.checked = false;
                    termsGotItBtn.disabled = true;
                }
            });
        }
    });

    function closeTerms() {
        termsModal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }

    if (termsCheckbox && termsGotItBtn) {
        termsCheckbox.addEventListener('change', function () {
            termsGotItBtn.disabled = !this.checked;
        });
        termsGotItBtn.addEventListener('click', closeTerms);
    }
}

// --- AUTO-CLOSE DROPDOWN ON MOBILE TAP OUTSIDE ---
document.addEventListener("click", (e) => {
    const navAuthWrapper = document.querySelector(".nav-auth-wrapper");
    // If the click happened entirely outside the auth wrapper, close the dropdown
    if (navAuthWrapper && !navAuthWrapper.contains(e.target)) {
        navAuthWrapper.classList.remove("active");
    }
});
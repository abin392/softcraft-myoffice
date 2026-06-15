document.addEventListener("DOMContentLoaded", function () {
    // --- 1. REVEAL ANIMATIONS ---
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

    // --- 2. SESSION & AUTHENTICATION LOGIC ---
    const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
    const currentUserEmail = localStorage.getItem("userEmail");
    const lastLogin = localStorage.getItem("lastLoginTimestamp");
    const userName = localStorage.getItem("userName");

    const navBtn = document.querySelector(".navbar .btn-primary");
    const heroBtn = document.querySelector(".hero-buttons .btn-primary");
    const logoutItem = document.getElementById("logout-item");
    const logoutBtn = document.getElementById("logout-btn");

    function applyScreenRules() {
        if (currentUserEmail && lastLogin && logoutItem) {
            if (window.innerWidth <= 768) {
                logoutItem.style.display = "none"; // Mobile: ALWAYS hide
            } else {
                logoutItem.style.display = "block"; // PC/Tablet: ALWAYS show
            }
        }
    }

    if (currentUserEmail && lastLogin) {
        const timeSinceLastLogin = Date.now() - parseInt(lastLogin);

        if (timeSinceLastLogin > THREE_DAYS_MS) {
            window.location.href = "login.html";
        } else {
            if (navBtn) {
                navBtn.innerHTML = `<i class="fa-solid fa-user-astronaut"></i> ${userName}`;
                navBtn.href = "#";
                navBtn.addEventListener("click", e => e.preventDefault());
            }

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

            applyScreenRules();
            window.addEventListener("resize", applyScreenRules);
        }
    } else {
        if (navBtn) navBtn.href = "sign.html";
        if (heroBtn) heroBtn.href = "sign.html";
        if (logoutItem) logoutItem.style.display = "none";
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", function (event) {
            event.preventDefault();
            localStorage.removeItem("userEmail");
            localStorage.removeItem("userName");
            localStorage.removeItem("userPass");
            localStorage.removeItem("lastLoginTimestamp");
            window.location.reload();
        });
    }

    // --- 3. IMAGE LIGHTBOX LOGIC ---
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

        // Lightboxes CAN be safely closed by clicking background or pressing escape
        lightbox.addEventListener('click', function (event) {
            if (event.target === lightbox) closeLightbox();
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === "Escape" && lightbox.classList.contains('show')) {
                closeLightbox();
            }
        });
    }

    // --- 4. PRIVACY POLICY MODAL LOGIC ---
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

        // BUG FIX: Removed background-click bypass so user MUST click Got It
    }

    // --- 5. TERMS OF SERVICE MODAL LOGIC ---
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

        // BUG FIX: Removed background-click bypass so user MUST click Got It
    }
});

// --- 6. SKELETON PRELOADER LOGIC ---
window.addEventListener("load", function () {
    const preloader = document.getElementById("skeleton-preloader");

    if (preloader) {
        setTimeout(() => {
            preloader.classList.add("loaded");
            setTimeout(() => { preloader.remove(); }, 800);
        }, 600);
    }
});
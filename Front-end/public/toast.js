document.addEventListener("DOMContentLoaded", () => {
    // Automatically build the notification container when the page loads
    const container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
});

// Global function to trigger notifications from any file
window.showToast = function (message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `custom-toast toast-${type}`;

    // Choose the correct FontAwesome icon based on success or error
    const icon = type === "success" ? "fa-circle-check" : "fa-circle-exclamation";

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    // Animate the toast onto the screen
    setTimeout(() => toast.classList.add("show"), 10);

    // Keep it on screen for 3.5 seconds, then animate it away and delete it
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 400);
    }, 3500);
};
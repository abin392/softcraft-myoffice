// --- IMPORT FROM YOUR EXISTING CENTRALIZED FIREBASE CONFIG ---
// Ensure the path to firebase-config.js is correct based on your folder structure
import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// DOM Elements
const adminLoader = document.getElementById("admin-loader");
const adminContent = document.getElementById("admin-content");
const inquiriesGrid = document.getElementById("inquiries-grid");
const logoutBtn = document.getElementById("admin-logout-btn");

// The strict Admin Email
const ADMIN_EMAIL = "abinr392@gmail.com";

// --- 1. RBAC SECURITY CHECK ---
onAuthStateChanged(auth, (user) => {
    if (user && user.email === ADMIN_EMAIL) {
        // User is the Admin -> Initialize Data Fetching
        console.log("Admin Authenticated. Establishing secure data link...");
        fetchRealTimeInquiries();
    } else {
        // Unauthorized -> Redirect immediately to home
        console.warn("Unauthorized access attempt. Redirecting...");
        window.location.href = "index.html";
    }
});

// --- 2. REAL-TIME DATA PIPELINE ---
function fetchRealTimeInquiries() {
    // Create a query to get inquiries ordered by newest first
    const q = query(collection(db, "inquiries"), orderBy("timestamp", "desc"));

    // onSnapshot creates a real-time listener. If a client submits a form on index.html,
    // this will update the admin dashboard instantly without refreshing the page.
    onSnapshot(q, (snapshot) => {
        // Hide loader, show content on first successful fetch
        adminLoader.style.display = "none";
        adminContent.style.display = "block";

        inquiriesGrid.innerHTML = ""; // Clear existing grid

        if (snapshot.empty) {
            inquiriesGrid.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1; text-align: center;">No client inquiries found in the database.</p>`;
            return;
        }

        snapshot.forEach((docSnap) => { // Renamed parameter slightly to avoid confusion with the 'doc' import
            const data = docSnap.data();
            const docId = docSnap.id; // Capture the unique Firebase Document ID
            
            // Format Timestamp
            const dateObj = new Date(data.timestamp);
            const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

            // 1. WhatsApp Contacted Badge (Top Left)
            const contactedBadge = data.whatsappContacted 
                ? `<i class="fa-solid fa-circle-check contacted-badge" title="Contacted via WhatsApp"></i>` 
                : '';

            // --- SMART WHATSAPP MESSAGE GENERATOR ---
            let phoneActions = `<span style="color: var(--text-muted);">Not provided</span>`;
            
            if (data.phone) {
                let waNumber = data.phone.replace(/\D/g, '');
                if (waNumber.length === 10) waNumber = '91' + waNumber; 

                let contextSnippet = data.message.length > 50 ? data.message.substring(0, 50).trim() + "..." : data.message.trim();
                let companyTextEn = data.company ? `for ${data.company}` : "for your enterprise";
                let companyTextTa = data.company ? `${data.company} நிறுவனத்திற்கான` : "உங்கள் நிறுவனத்திற்கான";

                let waMessage = `Hello ${data.name},\n\nThis is StackCraft Technologies. We received your inquiry regarding: "${contextSnippet}"\n\nOur elite engineering team has reviewed your initial requirements ${companyTextEn}. We would love to discuss the technical architecture and how we can bring this vision to life.\n\nWhen would be a good time for a brief consultation?\n\n---\n\nவணக்கம் ${data.name},\n\nஇது StackCraft Technologies. உங்கள் திட்டத்தின் தேவை குறித்த தகவலைப் பெற்றோம்: "${contextSnippet}"\n\nஎங்கள் சிறந்த பொறியியல் குழு ${companyTextTa} உங்கள் ஆரம்ப தேவைகளை மதிப்பாய்வு செய்துள்ளது. இதன் தொழில்நுட்பக் கட்டமைப்பு மற்றும் இந்தத் திட்டத்தை எவ்வாறு வெற்றிகரமாக உருவாக்கலாம் என்பது குறித்து உங்களுடன் விவாதிக்க ஆவலாக உள்ளோம்.\n\nஇது குறித்துச் சுருக்கமாகப் பேச உங்களுக்கு எந்த நேரம் வசதியாக இருக்கும்?`;
                
                let encodedWaText = encodeURIComponent(waMessage);

                // ADDED: data-id="${docId}" and wa-track-btn class to track the click
                phoneActions = `
                    <span style="color:var(--text-main); font-weight: 600;">${data.phone}</span>
                    <a href="tel:+${waNumber}" class="admin-action-btn call-btn" title="Call Client"><i class="fa-solid fa-phone"></i></a>
                    <a href="https://wa.me/${waNumber}?text=${encodedWaText}" target="_blank" data-id="${docId}" class="admin-action-btn wa-btn wa-track-btn" title="Message on WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
                `;
            }

            // 2. Technical Notes UI Generation
            let notesHTML = "";
            if (data.adminNotes) {
                // If notes exist: Show the text + Edit button
                notesHTML = `
                    <div class="admin-notes-section">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <strong style="color: var(--text-main); font-size: 0.9rem;"><i class="fa-solid fa-laptop-code"></i> Tech Requirements:</strong>
                            <button class="btn btn-outline edit-note-btn" data-id="${docId}" style="padding: 4px 10px; font-size: 0.7rem; min-width: auto; height: auto;"><i class="fa-solid fa-pen"></i> Edit</button>
                        </div>
                        <div class="admin-note-display" id="display-note-${docId}">${data.adminNotes}</div>
                        <div id="edit-box-${docId}" style="display: none; margin-top: 10px;">
                            <textarea class="admin-note-input" id="input-note-${docId}">${data.adminNotes}</textarea>
                            <button class="btn save-note-btn" data-id="${docId}" style="padding: 6px 12px; font-size: 0.8rem; width: 100%;"><i class="fa-solid fa-cloud-arrow-up"></i> Update Notes</button>
                        </div>
                    </div>
                `;
            } else {
                // If no notes: Show input box
                notesHTML = `
                    <div class="admin-notes-section">
                        <strong style="color: var(--text-main); font-size: 0.9rem; display: block; margin-bottom: 8px;"><i class="fa-solid fa-laptop-code"></i> Tech Requirements:</strong>
                        <textarea class="admin-note-input" id="input-note-${docId}" placeholder="Enter technical requirements, stack details, or internal notes here..."></textarea>
                        <button class="btn save-note-btn" data-id="${docId}" style="padding: 6px 12px; font-size: 0.8rem; width: 100%;"><i class="fa-solid fa-floppy-disk"></i> Save Notes</button>
                    </div>
                `;
            }

            const card = document.createElement("div");
            // ADDED: client-card class for filtering, and data-timestamp for accurate date sorting
            card.className = "card inquiry-card client-card reveal-up active";
            card.setAttribute("data-timestamp", data.timestamp); 
            
            // Injecting the new Badge, Delete Button, Notes, and PDF Classes
            card.innerHTML = `
                ${contactedBadge}
                <div class="timestamp-badge">${dateStr} - ${timeStr}</div>
                
                <h3 style="margin-top: 10px; margin-bottom: 1.5rem; color: var(--accent-cyan); font-size: 1.2rem; padding-left: ${data.whatsappContacted ? '35px' : '0'};">
                    <i class="fa-solid fa-building" style="margin-right: 8px;"></i> <span class="pdf-company">${data.company || "Independent Client"}</span>
                    <button class="delete-btn" data-id="${docId}"><i class="fa-solid fa-trash"></i> Delete</button>
                </h3>
                
                <div class="data-row"><i class="fa-solid fa-user"></i> <strong>Name:</strong> <span class="pdf-name">${data.name}</span></div>
                <div class="data-row"><i class="fa-solid fa-envelope"></i> <strong>Email:</strong> <a href="mailto:${data.email}" class="pdf-email" style="color:var(--text-main);">${data.email}</a></div>
                <div class="data-row" style="display: flex; align-items: center; margin-top: 5px;">
                    <i class="fa-solid fa-phone" style="margin-top: -3px;"></i> <strong style="margin-right: 10px;">Mobile:</strong> <span class="pdf-phone">${phoneActions}</span>
                </div>
                
                <div class="message-box">
                    <strong style="color: var(--text-main);">Project Details:</strong><br>
                    <span style="line-height: 1.8;">${data.message}</span>
                </div>

                ${notesHTML}
            `;

            inquiriesGrid.appendChild(card);
        });
    }, (error) => {
        console.error("Error fetching real-time data:", error);
        adminLoader.innerHTML = `<h3 style="color: #ef4444;"><i class="fa-solid fa-triangle-exclamation"></i> Security Error: Could not fetch data. Check Firebase Rules.</h3>`;
    });
}

// --- 3. LOGOUT LOGIC ---
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        try {
            await signOut(auth);
            // Redirect happens automatically via the onAuthStateChanged listener above
        } catch (error) {
            console.error("Logout Error:", error);
        }
    });
}

// --- DATABASE UPDATE LISTENERS (NOTES & WHATSAPP) ---
document.getElementById("inquiries-grid").addEventListener("click", async (e) => {
    
    // 1. WhatsApp Button Clicked -> Mark as Contacted
    const waBtn = e.target.closest('.wa-track-btn');
    if (waBtn) {
        const docId = waBtn.getAttribute('data-id');
        const docRef = doc(db, "inquiries", docId);
        // This fires silently in the background while the WhatsApp tab opens
        await updateDoc(docRef, { whatsappContacted: true }); 
    }

    // 2. Edit Note Button Clicked -> Show Textarea
    const editBtn = e.target.closest('.edit-note-btn');
    if (editBtn) {
        const docId = editBtn.getAttribute('data-id');
        document.getElementById(`display-note-${docId}`).style.display = 'none';
        document.getElementById(`edit-box-${docId}`).style.display = 'block';
        editBtn.style.display = 'none'; // Hide the edit button while editing
    }

    // 3. Save Note Button Clicked -> Update Database
    const saveBtn = e.target.closest('.save-note-btn');
    if (saveBtn) {
        const docId = saveBtn.getAttribute('data-id');
        const noteInput = document.getElementById(`input-note-${docId}`).value.trim();
        
        // Show loading state on button
        saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;
        saveBtn.disabled = true;

        const docRef = doc(db, "inquiries", docId);
        await updateDoc(docRef, { adminNotes: noteInput });
        
        // Note: We don't need to manually reset the UI here because the `onSnapshot` 
        // listener at the top of the file will instantly detect the database update 
        // and re-render the specific card automatically!
    }

    // 4. Delete Button Clicked -> Erase from Database
    const deleteBtn = e.target.closest('.delete-btn');
    if (deleteBtn) {
        if (confirm("Are you sure you want to completely erase this client's data? This action cannot be undone.")) {
            const docId = deleteBtn.getAttribute('data-id');
            deleteDoc(doc(db, "inquiries", docId)).catch((error) => {
                console.error("Error deleting document: ", error);
                alert("Failed to delete client data.");
            });
        }
    }
});

// --- NEW: Global Search & Date Filtering Logic ---
function filterClientData() {
    const searchTerm = document.getElementById('adminSearch').value.toLowerCase();
    const timeFilter = document.getElementById('timeFilter').value;
    
    const cards = document.querySelectorAll('.client-card'); 
    const now = new Date();

    cards.forEach(card => {
        // Search text match
        const textContent = card.textContent.toLowerCase();
        const matchesSearch = textContent.includes(searchTerm);
        
        // Time filter match using the accurate timestamp data attribute
        let matchesTime = true;
        const timestamp = parseInt(card.getAttribute('data-timestamp'));
        
        if (timeFilter !== 'all' && !isNaN(timestamp)) {
            const cardDate = new Date(timestamp);
            if (timeFilter === 'week') {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(now.getDate() - 7);
                matchesTime = cardDate >= oneWeekAgo;
            } else if (timeFilter === 'month') {
                matchesTime = cardDate.getMonth() === now.getMonth() && cardDate.getFullYear() === now.getFullYear();
            } else if (timeFilter === 'year') {
                matchesTime = cardDate.getFullYear() === now.getFullYear();
            }
        }
        
        // Toggle visibility
        card.style.display = (matchesSearch && matchesTime) ? '' : 'none';
    });
}

// Attach filter listeners
document.getElementById('adminSearch').addEventListener('input', filterClientData);
document.getElementById('timeFilter').addEventListener('change', filterClientData);

// --- NEW: Export to Professional PDF Logic ---
document.getElementById('exportPdfBtn').addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const docPdf = new jsPDF();
    
    // Professional Header
    docPdf.setFontSize(18);
    docPdf.setTextColor(44, 62, 80);
    docPdf.text('StackCraft Client Inquiries Report', 14, 20);
    
    docPdf.setFontSize(10);
    docPdf.setTextColor(100);
    docPdf.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
    
    const tableData = [];
    const visibleCards = document.querySelectorAll('.client-card');
    
    // Scrape data only from currently visible/filtered cards
    visibleCards.forEach(card => {
        if (card.style.display !== 'none') {
            const name = card.querySelector('.pdf-name')?.textContent.trim() || '-';
            const company = card.querySelector('.pdf-company')?.textContent.trim() || '-';
            const email = card.querySelector('.pdf-email')?.textContent.trim() || '-';
            // Extract just the raw phone number string, ignoring the action buttons
            let phone = card.querySelector('.pdf-phone')?.textContent.trim() || '-';
            phone = phone.replace(/[^0-9+]/g, '').substring(0, 13); // Clean up button text bleed
            
            tableData.push([name, company, email, phone]);
        }
    });
    
    if (tableData.length === 0) {
        alert("No data available to export based on current filters.");
        return;
    }

    docPdf.autoTable({
        startY: 35,
        head: [['Client Name', 'Shop/Company', 'Email', 'Phone']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [44, 62, 80] }, 
        styles: { fontSize: 9, cellPadding: 4 }
    });
    
    docPdf.save('StackCraft_Client_Report.pdf');
});
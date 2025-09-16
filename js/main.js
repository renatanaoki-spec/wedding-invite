// Wedding Invitation Main JavaScript - Updated with External Countdown
// Configuration
const CONFIG = {
    scriptURL: "https://script.google.com/macros/s/AKfycbwRSHvhi28_Fes26DuLR8Ywf0zqY2U7ePzQCdb_4vyUH_Nq0_culqdSfb1U7tajj8zT/exec",
    weddingDate: "Jan 17, 2026 09:00:00",
    notesPerPage: 5
};

// Global variables
let notes = [];
let currentPage = 1;
let weddingCountdown = null;

// DOM Elements
const elements = {
    cover: null,
    openBtn: null,
    music: null,
    controlBtn: null,
    form: null,
    nameInput: null,
    nameError: null,
    attendanceInput: null,
    attendanceError: null,
    responseMsg: null,
    notesContainer: null,
    prevBtn: null,
    nextBtn: null,
    guestName: null,
    referer: null,
    countdown: null
};

// Initialize DOM elements
function initializeElements() {
    elements.cover = document.getElementById("coverPage");
    elements.openBtn = document.getElementById("openBtn");
    elements.music = document.getElementById("bg-music");
    elements.controlBtn = document.getElementById("music-control");
    elements.form = document.getElementById("rsvpForm");
    elements.nameInput = document.getElementById("nameInput");
    elements.nameError = document.getElementById("nameError");
    elements.attendanceInput = document.getElementById("attendanceInput");
    elements.attendanceError = document.getElementById("attendanceError");
    elements.responseMsg = document.getElementById("responseMsg");
    elements.notesContainer = document.getElementById("notesContainer");
    elements.prevBtn = document.getElementById("prevBtn");
    elements.nextBtn = document.getElementById("nextBtn");
    elements.guestName = document.getElementById("guestName");
    elements.referer = document.getElementById("referer");
    elements.countdown = document.getElementById("countdown");
}

// Cover Page & Music Control
function initializeCoverPage() {
    // Set guest name from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const guest = urlParams.get("to");
    if (guest && elements.guestName) {
        elements.guestName.textContent = guest;
    }

    // Set referrer
    if (elements.referer) {
        elements.referer.value = window.location.hostname;
    }

    // Cover page open button
    if (elements.openBtn) {
        elements.openBtn.addEventListener("click", openInvitation);
    }

    // Music control button
    if (elements.controlBtn) {
        elements.controlBtn.addEventListener("click", toggleMusic);
    }

    // Auto-pause music when page is hidden
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", pauseMusic);
}

function openInvitation() {
    if (elements.cover) {
        elements.cover.classList.add("hidden");
    }
    if (elements.controlBtn) {
        elements.controlBtn.style.display = "block";
    }
    if (elements.music) {
        elements.music.play().catch(err => console.log("Autoplay blocked:", err));
    }
}

function toggleMusic() {
    if (!elements.music || !elements.controlBtn) return;
    
    if (elements.music.paused) {
        elements.music.play();
        elements.controlBtn.textContent = "⏸️";
    } else {
        elements.music.pause();
        elements.controlBtn.textContent = "▶️";
    }
}

function handleVisibilityChange() {
    if (document.hidden) {
        pauseMusic();
    }
}

function pauseMusic() {
    if (elements.music) {
        elements.music.pause();
    }
    if (elements.controlBtn) {
        elements.controlBtn.textContent = "▶️";
    }
}

// Countdown Timer (Using External Countdown.js)
function initializeCountdown() {
    if (!elements.countdown) {
        console.warn("Countdown container not found");
        return;
    }

    // Check if WeddingCountdown is available
    if (typeof WeddingCountdown === 'undefined') {
        console.warn("WeddingCountdown not loaded. Loading fallback countdown...");
        loadFallbackCountdown();
        return;
    }

    weddingCountdown = new WeddingCountdown({
        // ... rest of the code stays the same
    });
}

    // Check if WeddingCountdown is available
    if (typeof WeddingCountdown === 'undefined') {
        console.warn("WeddingCountdown not loaded. Loading fallback countdown...");
        loadFallbackCountdown();
        return;
    }

    weddingCountdown = new WeddingCountdown({
        targetDate: CONFIG.weddingDate,
        containerId: "countdown",
        daysId: "days",
        hoursId: "hours",
        minutesId: "minutes", 
        secondsId: "seconds",
        completedMessage: "🎉 Today is the wedding day!",
        animate: true,
        onUpdate: (timeLeft) => {
            // Add special effects when getting close (less than 7 days)
            if (timeLeft.totalMs < 7 * 24 * 60 * 60 * 1000 && timeLeft.totalMs > 0) {
                document.querySelectorAll('.time-box').forEach(box => {
                    box.style.animation = 'pulse 2s infinite';
                    box.style.background = 'rgba(188, 108, 137, 0.2)';
                });
                
                // Add pulse animation if not already defined
                if (!document.querySelector('#pulse-animation-style')) {
                    const style = document.createElement('style');
                    style.id = 'pulse-animation-style';
                    style.textContent = `
                        @keyframes pulse {
                            0% { transform: scale(1); }
                            50% { transform: scale(1.05); }
                            100% { transform: scale(1); }
                        }
                    `;
                    document.head.appendChild(style);
                }
            }
        },
        onComplete: () => {
            console.log("Wedding day has arrived! 🎉");
            
            // Trigger confetti effect if available
            if (typeof triggerWeddingCelebration === 'function') {
                triggerWeddingCelebration();
            }
            
            // Show special celebration message
            showCelebrationMessage();
        }
    });
}

// Fallback countdown if external countdown.js is not loaded
function loadFallbackCountdown() {
    console.log("Loading fallback countdown...");
    
    function updateFallbackCountdown() {
        const weddingDate = new Date(CONFIG.weddingDate).getTime();
        const now = new Date().getTime();
        const diff = weddingDate - now;
        
        if (diff <= 0) {
            if (elements.countdown) {
                elements.countdown.innerHTML = "🎉 Today is the wedding day!";
            }
            return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        const daysEl = document.getElementById("days");
        const hoursEl = document.getElementById("hours");
        const minutesEl = document.getElementById("minutes");
        const secondsEl = document.getElementById("seconds");
        
        if (daysEl) daysEl.textContent = days;
        if (hoursEl) hoursEl.textContent = hours;
        if (minutesEl) minutesEl.textContent = minutes;
        if (secondsEl) secondsEl.textContent = seconds;
    }
    
    // Initial update and set interval
    updateFallbackCountdown();
    setInterval(updateFallbackCountdown, 1000);
}

function showCelebrationMessage() {
    // Create celebration overlay
    const celebration = document.createElement('div');
    celebration.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #fbd3e9, #91a1f0);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 1s ease-in-out;
    `;
    
    celebration.innerHTML = `
        <h1 style="font-family: 'Great Vibes', cursive; font-size: 4rem; color: white; text-shadow: 2px 2px 10px rgba(0,0,0,0.5); margin-bottom: 20px;">
            🎉 Wedding Day! 🎉
        </h1>
        <p style="font-size: 1.5rem; color: white; margin-bottom: 30px; text-align: center;">
            Zen & Yessica's special day has arrived!
        </p>
        <button onclick="this.parentElement.remove()" style="padding: 15px 30px; border: none; border-radius: 25px; background: white; color: #bc6c89; font-size: 1.2rem; font-weight: 600; cursor: pointer;">
            Continue to Wedding
        </button>
    `;
    
    document.body.appendChild(celebration);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (celebration.parentElement) {
            celebration.remove();
        }
    }, 10000);
}

// RSVP Form Handling
function initializeRSVPForm() {
    if (!elements.form) return;

    elements.form.addEventListener("submit", handleRSVPSubmit);
}

function validateForm() {
    let isValid = true;

    // Validate name
    if (!elements.nameInput.value.trim()) {
        elements.nameError.style.display = "block";
        isValid = false;
    } else {
        elements.nameError.style.display = "none";
    }

    // Validate attendance
    if (!elements.attendanceInput.value) {
        elements.attendanceError.style.display = "block";
        isValid = false;
    } else {
        elements.attendanceError.style.display = "none";
    }

    return isValid;
}

function handleRSVPSubmit(e) {
    e.preventDefault();

    const isValid = validateForm();

    if (!isValid) {
        showMessage("⚠️ Please check the form again, some fields are missing 🌸", "#d46a6a");
        return;
    }

    showMessage("⏳ Sending...", "gray");

    fetch(CONFIG.scriptURL, {
        method: "POST",
        body: new FormData(elements.form)
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            showMessage("✅ RSVP berhasil dikirim! Thank you 💕", "green");
            elements.form.reset();
            loadNotes();
        } else {
            showMessage("❌ Gagal mengirim RSVP.", "red");
        }
    })
    .catch(err => {
        showMessage("❌ Error: " + err, "red");
    });
}

function showMessage(text, color) {
    if (elements.responseMsg) {
        elements.responseMsg.textContent = text;
        elements.responseMsg.style.color = color;
        
        // Add background color based on message type
        if (color === "green") {
            elements.responseMsg.style.background = "rgba(76, 175, 80, 0.1)";
            elements.responseMsg.style.borderLeft = "4px solid #4caf50";
        } else if (color === "red" || color === "#d46a6a") {
            elements.responseMsg.style.background = "rgba(244, 67, 54, 0.1)";
            elements.responseMsg.style.borderLeft = "4px solid #f44336";
        } else {
            elements.responseMsg.style.background = "rgba(158, 158, 158, 0.1)";
            elements.responseMsg.style.borderLeft = "4px solid #9e9e9e";
        }
        
        elements.responseMsg.style.padding = "12px 16px";
        elements.responseMsg.style.borderRadius = "8px";
        elements.responseMsg.style.marginTop = "15px";
    }
}

// Notes Management
async function loadNotes() {
    try {
        const res = await fetch(CONFIG.scriptURL);
        notes = await res.json();
        notes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        renderNotes();
    } catch (err) {
        if (elements.notesContainer) {
            elements.notesContainer.innerHTML = "<p>❌ Gagal load notes.</p>";
        }
    }
}

function renderNotes() {
    if (!elements.notesContainer) return;

    elements.notesContainer.innerHTML = "";

    if (!notes.length) {
        elements.notesContainer.innerHTML = "<p style='text-align: center; color: #666; font-style: italic;'>No notes yet. Be the first to leave a message! 💕</p>";
        return;
    }

    const start = (currentPage - 1) * CONFIG.notesPerPage;
    const end = start + CONFIG.notesPerPage;
    const pageNotes = notes.slice(start, end);

    pageNotes.forEach(note => {
        let attendanceIcon = "";
        if (note.attendance === "Yes") attendanceIcon = "💖";
        if (note.attendance === "No") attendanceIcon = "🌸";

        const noteElement = document.createElement('div');
        noteElement.className = 'note';
        noteElement.innerHTML = `
            <strong>${note.name}</strong> ${attendanceIcon}<br>
            <em>${note.notes || 'No message provided'}</em><br>
            <small style="color: #999;">${timeAgo(note.timestamp)}</small>
        `;
        
        elements.notesContainer.appendChild(noteElement);
    });

    // Update pagination buttons
    if (elements.prevBtn) {
        elements.prevBtn.disabled = currentPage === 1;
    }
    if (elements.nextBtn) {
        elements.nextBtn.disabled = end >= notes.length;
    }
}

function initializePagination() {
    if (elements.prevBtn) {
        elements.prevBtn.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                renderNotes();
                scrollToNotes();
            }
        });
    }

    if (elements.nextBtn) {
        elements.nextBtn.addEventListener("click", () => {
            if ((currentPage * CONFIG.notesPerPage) < notes.length) {
                currentPage++;
                renderNotes();
                scrollToNotes();
            }
        });
    }
}

function scrollToNotes() {
    if (elements.notesContainer) {
        elements.notesContainer.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Utility Functions
function timeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diff = (now - date) / 1000;

    if (diff < 60) return "baru saja";

    const minutes = Math.floor(diff / 60);
    if (minutes < 60) return `${minutes} menit lalu`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam lalu`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} hari lalu`;

    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} minggu lalu`;

    const months = Math.floor(days / 30);
    return `${months} bulan lalu`;
}

// Additional Wedding Features
function triggerWeddingCelebration() {
    // Add confetti animation or other celebration effects
    console.log("🎊 Celebrating the wedding day! 🎊");
    
    // Could add confetti.js or similar library here
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
}

// Error Handling
function handleError(error, context = '') {
    console.error(`Error ${context}:`, error);
    
    // Show user-friendly error message
    if (elements.responseMsg) {
        showMessage("❌ Something went wrong. Please try again later.", "red");
    }
}

// Main Initialization
function init() {
    try {
        initializeElements();
        initializeCoverPage();
        initializeCountdown();
        initializeRSVPForm();
        initializePagination();
        loadNotes();
        
        console.log("Wedding invitation initialized successfully! 💕");
    } catch (error) {
        handleError(error, 'during initialization');
    }
}

// Start everything when DOM is loaded
document.addEventListener("DOMContentLoaded", init);

// Expose functions for external access if needed
window.WeddingApp = {
    init,
    toggleMusic,
    loadNotes,
    weddingCountdown,
    CONFIG
};

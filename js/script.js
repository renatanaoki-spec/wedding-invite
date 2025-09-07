// 🎶 Music autoplay fix
const music = document.getElementById("bg-music");
const controlBtn = document.getElementById("music-control");
window.addEventListener("load", () => {
  music.play().then(() => { music.muted = false; }).catch(err => console.log("Autoplay blocked:", err));
});
controlBtn.addEventListener("click", () => {
  if (music.paused) { music.play(); controlBtn.textContent = "⏸️"; }
  else { music.pause(); controlBtn.textContent = "▶️"; }
});

// ⏳ Countdown
function updateCountdown() {
  const weddingDate = new Date("Jan 17, 2026 09:00:00").getTime();
  const now = new Date().getTime();
  const diff = weddingDate - now;
  if (diff <= 0) {
    document.getElementById("countdown").innerHTML = "🎉 Today is the wedding day!";
    return;
  }
  const days = Math.floor(diff / (1000*60*60*24));
  const hours = Math.floor((diff % (1000*60*60*24)) / (1000*60*60));
  const minutes = Math.floor((diff % (1000*60*60)) / (1000*60));
  const seconds = Math.floor((diff % (1000*60)) / 1000);
  document.getElementById("days").textContent = days;
  document.getElementById("hours").textContent = hours;
  document.getElementById("minutes").textContent = minutes;
  document.getElementById("seconds").textContent = seconds;
}
setInterval(updateCountdown, 1000);
updateCountdown();

// 📝 Notes + RSVP integration with Google Sheets
const scriptURL = "YOUR_GOOGLE_APPS_SCRIPT_WEBAPP_URL"; // <-- replace
let submitting = false;
let currentPage = 1;
const notesPerPage = 5;
let allNotes = [];

document.getElementById("notesForm").addEventListener("submit", async e => {
  e.preventDefault();
  if (submitting) return;
  submitting = true;
  const name = document.getElementById("name").value.trim();
  const notes = document.getElementById("notes").value.trim();
  const attendance = document.getElementById("attendance").value;
  const formMsg = document.getElementById("formMsg");
  formMsg.textContent = "Submitting...";
  try {
    const res = await fetch(scriptURL, {
      method: "POST",
      body: JSON.stringify({ name, notes, attendance }),
      headers: { "Content-Type": "application/json" }
    });
    const result = await res.json();
    if (result.status === "success") {
      formMsg.textContent = "✅ Thank you for your response!";
      formMsg.style.color = "green";
      document.getElementById("notesForm").reset();
      loadNotes();
    } else if (result.status === "duplicate") {
      formMsg.textContent = "⚠️ Duplicate submission detected.";
      formMsg.style.color = "orange";
    } else {
      formMsg.textContent = "❌ Failed to submit.";
      formMsg.style.color = "red";
    }
  } catch (err) {
    formMsg.textContent = "❌ Error connecting to server.";
    formMsg.style.color = "red";
  }
  submitting = false;
});

async function loadNotes() {
  try {
    const res = await fetch(scriptURL);
    const data = await res.json();
    allNotes = data.reverse();
    currentPage = 1;
    renderNotes();
  } catch {
    document.getElementById("notesList").innerHTML = "<p>❌ Failed to load notes.</p>";
  }
}

function renderNotes() {
  const start = (currentPage - 1) * notesPerPage;
  const end = start + notesPerPage;
  const pageNotes = allNotes.slice(start, end);
  document.getElementById("notesList").innerHTML = pageNotes.map(n => `
    <div><strong>${n.name}</strong> (${n.attendance})<br><em>${n.notes}</em></div>
  `).join("");
  const totalPages = Math.ceil(allNotes.length / notesPerPage) || 1;
  document.getElementById("pageInfo").textContent = `Page ${currentPage} of ${totalPages}`;
  document.getElementById("prevBtn").disabled = currentPage === 1;
  document.getElementById("nextBtn").disabled = currentPage === totalPages;
}

document.getElementById("prevBtn").addEventListener("click", () => {
  if (currentPage > 1) { currentPage--; renderNotes(); }
});
document.getElementById("nextBtn").addEventListener("click", () => {
  const totalPages = Math.ceil(allNotes.length / notesPerPage);
  if (currentPage < totalPages) { currentPage++; renderNotes(); }
});

loadNotes();

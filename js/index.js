/* ===== Constants ===== */
const WEDDING_DATE = new Date("2026-01-17T09:00:00+07:00");
const scriptURL = "https://script.google.com/macros/s/AKfycbwRSHvhi28_Fes26DuLR8Ywf0zqY2U7ePzQCdb_4vyUH_Nq0_culqdSfb1U7tajj8zT/exec";

/* ===== Music ===== */
const audio = document.getElementById('bgm');
const musicBtn = document.getElementById('music');
const musicIcon = musicBtn.querySelector('i');

function setPlayUI(playing){
  if(playing){
    musicIcon.classList.remove('fa-play'); musicIcon.classList.add('fa-pause');
    musicBtn.setAttribute('aria-label','Pause music');
  }else{
    musicIcon.classList.remove('fa-pause'); musicIcon.classList.add('fa-play');
    musicBtn.setAttribute('aria-label','Play music');
  }
}

musicBtn.addEventListener('click', ()=>{
  if(audio.paused){
    audio.play().then(()=>{ setPlayUI(true); sessionStorage.removeItem('autoplay'); })
                .catch(()=>setPlayUI(false));
  }else{ audio.pause(); setPlayUI(false); }
});

// Autoplay setelah klik "Open Invitation" di cover
function tryAutoplay(){
  audio.play().then(()=>{ setPlayUI(true); sessionStorage.removeItem('autoplay'); })
              .catch(()=>setPlayUI(false));
}
document.addEventListener('DOMContentLoaded', ()=>{
  if (sessionStorage.getItem('autoplay') === '1') {
    requestAnimationFrame(tryAutoplay);
    setTimeout(tryAutoplay, 150);
  }
});
window.addEventListener('pageshow', ()=>{
  if (sessionStorage.getItem('autoplay') === '1') tryAutoplay();
});
// Fallback: klik pertama di halaman
document.addEventListener('click', function once(){
  if(audio.paused) tryAutoplay();
  document.removeEventListener('click', once);
}, { once:true });
// Pause saat tab disembunyikan
document.addEventListener('visibilitychange', ()=>{ if(document.hidden){ audio.pause(); setPlayUI(false); }});

/* ===== Countdown ===== */
const dEl=document.getElementById('d'), hEl=document.getElementById('h'),
      mEl=document.getElementById('m'), sEl=document.getElementById('s');
let prev={};
const pop=(el,v,k)=>{ if(prev[k]!==v){ el.textContent=v; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); prev[k]=v; } };
function tick(){
  const t=WEDDING_DATE.getTime(), now=Date.now(), diff=t-now;
  const wrap=document.getElementById('countdown');
  if(diff<=0){ wrap.innerHTML="🎉 Today is the wedding day!"; return; }
  pop(dEl, Math.floor(diff/86400000), 'd');
  pop(hEl, Math.floor((diff%86400000)/3600000), 'h');
  pop(mEl, Math.floor((diff%3600000)/60000), 'm');
  pop(sEl, Math.floor((diff%60000)/1000), 's');
}
setInterval(tick,1000); tick();

/* ===== Dear ?to= ===== */
(function(){
  const to = new URLSearchParams(location.search).get('to');
  if(to){ const el=document.getElementById('dearLine'); el.textContent=`Dear ${to}`; el.style.display='block'; }
})();

/* ===== RSVP & Notes ===== */
document.getElementById("referer").value = location.hostname;

const form = document.getElementById('rsvpForm');
const msg  = document.getElementById('responseMsg');

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  if(!form.Name.value.trim() || !form.Attendance.value){
    msg.textContent="⚠️ Please fill out name and attendance 🌸"; msg.style.color="#c66"; return;
  }
  msg.textContent="⏳ Sending..."; msg.style.color="#666";
  try{
    const r=await fetch(scriptURL, { method:"POST", body:new FormData(form) });
    const data=await r.json();
    if(data.status==="success"){ msg.textContent="✅ RSVP berhasil dikirim! Thank you 💕"; msg.style.color="green"; form.reset(); currentPage=1; loadNotes(); }
    else if(data.status==="duplicate"){ msg.textContent="⚠️ You already submitted recently."; msg.style.color="#bb8a4e"; }
    else if(data.status==="unauthorized" || data.status==="forbidden"){ msg.textContent="❌ Access denied. Please open from official link."; msg.style.color="crimson"; }
    else{ msg.textContent="❌ Gagal mengirim RSVP."; msg.style.color="crimson"; }
  }catch(err){ msg.textContent="❌ Error: "+err; msg.style.color="crimson"; }
});

function timeAgo(ts){
  const now=new Date(), d=new Date(ts), s=(now-d)/1000;
  if(s<60) return "baru saja";
  const m=Math.floor(s/60); if(m<60) return `${m} menit lalu`;
  const h=Math.floor(m/60); if(h<24) return `${h} jam lalu`;
  const day=Math.floor(h/24); if(day<7) return `${day} hari lalu`;
  const w=Math.floor(day/7); if(w<4) return `${w} minggu lalu`;
  const mo=Math.floor(day/30); return `${mo} bulan lalu`;
}

let notes=[], currentPage=1, perPage=5;
async function loadNotes(){
  try{
    const res=await fetch(scriptURL);
    notes=await res.json();
    notes.sort((a,b)=> new Date(b.timestamp)-new Date(a.timestamp));
    renderNotes();
  }catch{
    document.getElementById("notesContainer").innerHTML="<p>❌ Gagal load notes.</p>";
  }
}
function renderNotes(){
  const box=document.getElementById('notesContainer'); box.innerHTML="";
  if(!notes.length){ box.innerHTML="<p>No notes yet.</p>"; return; }
  const start=(currentPage-1)*perPage; const page=notes.slice(start,start+perPage);
  page.forEach((n,i)=>{
    const el=document.createElement('div'); el.className='note'; el.style.transitionDelay=(i*80)+"ms";
    const icon = n.attendance==="Yes" ? "💖" : (n.attendance==="No" ? "🌸" : "");
    el.innerHTML = `<strong style="color:var(--accent)">${(n.name||"Guest").toString().replace(/</g,"&lt;")}</strong> ${icon}<br>
                    <em>${(n.notes||'').toString().replace(/</g,'&lt;')}</em><br>
                    <small>${timeAgo(n.timestamp)}</small>`;
    box.appendChild(el); requestAnimationFrame(()=> el.classList.add('show'));
  });
  document.getElementById('prevBtn').disabled = start<=0;
  document.getElementById('nextBtn').disabled = start+perPage >= notes.length;
}
document.getElementById('prevBtn').addEventListener('click', ()=>{ if(currentPage>1){ currentPage--; renderNotes(); }});
document.getElementById('nextBtn').addEventListener('click', ()=>{ if(currentPage*perPage<notes.length){ currentPage++; renderNotes(); }});
loadNotes();

/* ===== Aira Chat ===== */
const KNOWLEDGE = {
  couple: "Zen & Yessica",
  date: new Date("2026-01-17T09:00:00+07:00"),
  datingAnniversary: new Date("2019-05-28T00:00:00+07:00"),
  favorites: { groomColor: "Biru", brideColor: "Kuning" },
  dreams: { groom: "Memiliki rumah di pegunungan", couple: "Keluarga bahagia" },
  hobbies: { groom: [], bride: [], couple: [] },
  funFacts: [],
  maps: {
    matrimony: "https://www.google.com/maps/search/?api=1&query=Gereja+Santo+Fransiskus+Asisi,+Cibinong",
    reception: "https://www.google.com/maps/search/?api=1&query=Bagas+Raya+Cibinong"
  },
  calendarLink:
    "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Zen+%26+Yessica+Wedding&dates=20260117T030000Z/20260117T090000Z&details=Join+us+for+our+wedding+day!&location=Gereja+Santo+Fransiskus+Asisi,+Cibinong"
};

const aiFab   = document.getElementById('aiFab');
const aiPanel = document.getElementById('aiPanel');
const aiClose = document.getElementById('aiClose');
const aiBody  = document.getElementById('aiBody');
const aiForm  = document.getElementById('aiForm');
const aiText  = document.getElementById('aiText');
const guest   = new URLSearchParams(location.search).get('to');

function openAI(){
  aiPanel.classList.add('open'); aiText.focus();
  if (!sessionStorage.getItem('aira_welcomed')) {
    botSay(`Halo${guest ? ' ' + guest : ''}! Aku <b>Aira</b> 👋. Aku bisa bantu info acara ${KNOWLEDGE.couple}: waktu, lokasi, RSVP, arah ke tempat, dan lainnya.`);
    sessionStorage.setItem('aira_welcomed','1');
  }
}
function closeAI(){ aiPanel.classList.remove('open'); }
aiFab.addEventListener('click', ()=> aiPanel.classList.contains('open') ? closeAI() : openAI());
aiClose.addEventListener('click', closeAI);
document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeAI(); });

function renderMsg(role, html){
  const wrap=document.createElement('div'); wrap.className='ai-msg '+(role==='user'?'user':'ai');
  const b=document.createElement('div'); b.className='ai-bubble'; b.innerHTML=html;
  wrap.appendChild(b); aiBody.appendChild(wrap); aiBody.scrollTop=aiBody.scrollHeight;
}
function userSay(t){ renderMsg('user', t.replace(/[<>&"]/g,c=>({ '<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c])) ) }
function botSay(h){ renderMsg('ai', h) }

const fmtDate = d => d.toLocaleString('id-ID',{weekday:'long',year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',timeZone:'Asia/Jakarta'});
const formatDateShort = d => d.toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric',timeZone:'Asia/Jakarta'});
const daysTo = d => { const ms=d.getTime()-Date.now(); if(ms<=0) return "Hari ini!"; const DD=Math.floor(ms/86400000), HH=Math.floor((ms%86400000)/3600000); return `${DD} hari ${HH} jam lagi`; };

function reply(text){
  const q=text.toLowerCase();
  if(/\b(hai|halo|hello|hi)\b/.test(q)) return `Halo${guest?' '+guest:''}! Ada yang bisa Aira bantu?`;
  if(/siapa|pengantin|couple|bride|groom/.test(q)) return `Acara ini untuk <b>${KNOWLEDGE.couple}</b> 🥂.`;
  if(/kapan|tanggal|jam|time|when|countdown|berapa hari/.test(q)) return `Pemberkatan dimulai <b>${fmtDate(KNOWLEDGE.date)}</b> (WIB). Tersisa <b>${daysTo(KNOWLEDGE.date)}</b>.`;
  if(/jadian|anniv|anniversary|sejak.*(bersama|pacaran)|kapan.*jadian|tanggal.*jadian/.test(q)) return `Tanggal jadian: <b>${formatDateShort(KNOWLEDGE.datingAnniversary)}</b> 💞`;
  if(/warna( favorit| kesukaan)?|favorite color/.test(q)){
    const g=/(zen|groom|laki|cowok)/.test(q), b=/(yessica|bride|perempuan|cewek)/.test(q);
    if(g) return `Warna kesukaan Zen: <b>${KNOWLEDGE.favorites.groomColor}</b> 💙`;
    if(b) return `Warna kesukaan Yessica: <b>${KNOWLEDGE.favorites.brideColor}</b> 💛`;
    return `Warna favorit: Zen <b>${KNOWLEDGE.favorites.groomColor}</b> 💙 & Yessica <b>${KNOWLEDGE.favorites.brideColor}</b> 💛`;
  }
  if(/impian|cita-cita|mimpi|goals?/.test(q)) return `Impian Zen: <b>${KNOWLEDGE.dreams.groom}</b> 🏔️<br>Impian bersama: <b>${KNOWLEDGE.dreams.couple}</b> 🫶`;
  if(/hobi|hobby|kegemaran|interest/.test(q)) return `Hobi Zen/Yessica belum diisi.`;
  if(/fun\s*fact|fakta unik|unik/.test(q)) return `Fun fact belum ditambahkan 🙂`;
  if(/di mana|lokasi|alamat|where|maps|arah|route|direction/.test(q)) return `Lokasi: <br>• Pemberkatan: <a href="${KNOWLEDGE.maps.matrimony}" target="_blank">Gereja Santo Fransiskus Asisi, Cibinong</a><br>• Resepsi: <a href="${KNOWLEDGE.maps.reception}" target="_blank">Bagas Raya Cibinong</a>`;
  if(/rsvp|konfirmasi|hadir|attend|daftar/.test(q)){ setTimeout(()=>document.querySelector('#rsvp').scrollIntoView({behavior:'smooth'}), 300); return `Kamu bisa RSVP di bagian <b>RSVP & Notes</b>. Aku sudah menggulir ke sana 😉.`; }
  if(/calendar|kalender|save the date|ingatkan/.test(q)) return `Klik <a href="${KNOWLEDGE.calendarLink}" target="_blank">Add to Google Calendar</a> untuk menyimpan tanggalnya.`;
  if(/musik|music|lagu|sound/.test(q)) return `Tombol musik ada di kanan bawah (ikon ▶️/⏸️).`;
  if(/dress|tema|baju|warna/.test(q)) return `Pilihan aman: <b>semi-formal</b> warna lembut/pastel.`;
  return `Aku bisa bantu: “Kapan mulai?”, “Lokasinya?”, “Kapan jadian?”, “Warna favorit?”, “Impian?”, “Cara RSVP?”`;
}

document.getElementById('aiForm').addEventListener('submit',(e)=>{
  e.preventDefault();
  const t=document.getElementById('aiText').value.trim(); if(!t) return;
  userSay(t); botSay(reply(t)); document.getElementById('aiText').value='';
});

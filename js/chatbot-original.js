// Wedding Chatbot JavaScript - Original Version (Exact Match)
let fuse;
let qaData = [];

function loadData() {
  const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR9ryftjbytcsFzmU4KAactGkErWIvh7mzfZ4kpuXREGuPCb6RkNo2qlea5IPE6SpCKYTn7Jzh0QMzb/pub?gid=2043771999&single=true&output=csv";

  Papa.parse(CSV_URL, {
    download: true,
    header: true, // use first row as headers
    complete: function(results) {
      qaData = results.data
        .filter(r => r.Questions && r.Answer) // skip empty rows
        .map(r => ({
          id: r.ID,
          question: r.Questions,
          answer: r.Answer
        }));

      fuse = new Fuse(qaData, { keys: ["question"], threshold: 0.4 });
      console.log("Chatbot data loaded:", qaData);
    },
    error: function(err) {
      console.error("Error loading CSV", err);
    }
  });
}

function searchAnswer(query) {
  if (!fuse) return "Data is still loading, please wait...";
  const result = fuse.search(query);
  if (result.length > 0) {
    return result[0].item.answer;
  }
  return "Sorry, I don't know the answer yet. Please contact Zen & Yessica.";
}

function addMessage(sender, text) {
  const chatBox = document.getElementById("chat-box");
  const msg = document.createElement("div");
  msg.className = "msg " + sender;
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function sendMessage() {
  const input = document.getElementById("chat-input");
  const userMsg = input.value.trim();
  if (!userMsg) return;

  addMessage("user", userMsg);
  const reply = searchAnswer(userMsg);
  addMessage("bot", reply);

  input.value = "";
}

document.addEventListener("DOMContentLoaded", () => {
  loadData();

  const btn = document.getElementById("chatbot-btn");
  const chatWin = document.getElementById("chat-window");
  const input = document.getElementById("chat-input");
  const sendBtn = document.getElementById("send-btn");

  btn.addEventListener("click", () => {
    chatWin.style.display = chatWin.style.display === "flex" ? "none" : "flex";
  });

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
});

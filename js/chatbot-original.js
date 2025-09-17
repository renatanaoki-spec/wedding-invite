// Enhanced Wedding Chatbot - FIXED VERSION with Question Suggestions
let fuse;
let qaData = [];

// Suggested questions for the helper
const SUGGESTED_QUESTIONS = [
    "Who are the bride and groom?",
    "When is the wedding?", 
    "Where is the wedding?",
    "What time does the ceremony start?",
    "What should I wear?",
    "Is there parking available?",
    "Can I bring children?",
    "What's the dress code?",
    "Where is the reception?",
    "How do I RSVP?"
];

// Random questions to show when chatbot doesn't know answer
const FALLBACK_QUESTIONS = [
    "When is the wedding?",
    "Where is the wedding?", 
    "What time does the ceremony start?"
];

function loadData() {
    const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR9ryftjbytcsFzmU4KAactGkErWIvh7mzfZ4kpuXREGuPCb6RkNo2qlea5IPE6SpCKYTn7Jzh0QMzb/pub?gid=2043771999&single=true&output=csv";

    Papa.parse(CSV_URL, {
        download: true,
        header: true,
        complete: function(results) {
            qaData = results.data
                .filter(r => r.Questions && r.Answer)
                .map(r => ({
                    id: r.ID,
                    question: r.Questions,
                    answer: r.Answer
                }));

            fuse = new Fuse(qaData, { keys: ["question"], threshold: 0.4 });
            console.log("Chatbot data loaded:", qaData);
            
            // Show welcome message after data loads
            showWelcomeMessage();
        },
        error: function(err) {
            console.error("Error loading CSV", err);
            addMessage("bot", "Sorry, I'm having trouble loading my knowledge base. Please try again later.");
            // Show question helper even on error
            setTimeout(() => showQuestionHelper(), 1000);
        }
    });
}

function searchAnswer(query) {
    if (!fuse) return "Data is still loading, please wait...";
    
    const result = fuse.search(query);
    if (result.length > 0) {
        return result[0].item.answer;
    }
    
    // **KEY FIX**: Return null when no answer found, so we can show question helper
    return null;
}

function addMessage(sender, text) {
    const chatBox = document.getElementById("chat-box");
    if (!chatBox) return;

    const msg = document.createElement("div");
    msg.className = "msg " + sender;
    msg.textContent = text;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Hide question helper if user sends a message
    if (sender === "user") {
        hideQuestionHelper();
    }
}

function sendMessage() {
    const input = document.getElementById("chat-input");
    if (!input) return;

    const userMsg = input.value.trim();
    if (!userMsg) return;

    addMessage("user", userMsg);
    
    // Show typing indicator
    showTypingIndicator();
    
    // Simulate slight delay for more natural conversation
    setTimeout(() => {
        hideTypingIndicator();
        const reply = searchAnswer(userMsg);
        
        // **KEY FIX**: Handle no answer found case
        if (reply === null) {
            // Show "don't know" message
            addMessage("bot", "Sorry, I don't know the answer to that question yet. Please contact Zen & Yessica directly, or try asking something else!");
            
            // **IMPORTANT**: Show question suggestions after a short delay
            setTimeout(() => {
                showFallbackQuestionHelper();
            }, 800);
        } else {
            addMessage("bot", reply);
        }
    }, 800);

    input.value = "";
}

function showTypingIndicator() {
    const chatBox = document.getElementById("chat-box");
    if (!chatBox) return;

    const typingDiv = document.createElement("div");
    typingDiv.id = "typing-indicator";
    typingDiv.className = "msg bot typing";
    typingDiv.innerHTML = `
        <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById("typing-indicator");
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function showWelcomeMessage() {
    const welcomeMessage = "Hi! I'm here to help answer questions about Zen & Yessica's wedding. What would you like to know? 💒";
    addMessage("bot", welcomeMessage);
    
    // Show question helper after welcome
    setTimeout(() => {
        showQuestionHelper();
    }, 1000);
}

function showQuestionHelper() {
    const chatBox = document.getElementById("chat-box");
    if (!chatBox) return;

    // Remove existing helper
    const existingHelper = document.getElementById("question-helper");
    if (existingHelper) {
        existingHelper.remove();
    }

    const helperDiv = document.createElement("div");
    helperDiv.id = "question-helper";
    helperDiv.className = "question-helper";
    
    helperDiv.innerHTML = `
        <div class="helper-title">💡 Try asking:</div>
        <div class="helper-questions">
            ${SUGGESTED_QUESTIONS.slice(0, 4).map(q => 
                `<button class="helper-question" onclick="askQuestion('${q}')">${q}</button>`
            ).join('')}
        </div>
        <button class="show-more-btn" onclick="toggleMoreQuestions()">Show more questions</button>
        <div class="more-questions" id="more-questions" style="display: none;">
            ${SUGGESTED_QUESTIONS.slice(4).map(q => 
                `<button class="helper-question" onclick="askQuestion('${q}')">${q}</button>`
            ).join('')}
        </div>
    `;
    
    chatBox.appendChild(helperDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// **NEW FUNCTION**: Show fallback questions when chatbot doesn't know answer
function showFallbackQuestionHelper() {
    const chatBox = document.getElementById("chat-box");
    if (!chatBox) return;

    // Remove existing helper
    const existingHelper = document.getElementById("question-helper");
    if (existingHelper) {
        existingHelper.remove();
    }

    const helperDiv = document.createElement("div");
    helperDiv.id = "question-helper";
    helperDiv.className = "question-helper";
    
    helperDiv.innerHTML = `
        <div class="helper-title">🤔 Maybe try asking:</div>
        <div class="helper-questions">
            ${FALLBACK_QUESTIONS.map(q => 
                `<button class="helper-question" onclick="askQuestion('${q}')">${q}</button>`
            ).join('')}
        </div>
        <button class="show-more-btn" onclick="showAllQuestions()">Show all questions</button>
    `;
    
    chatBox.appendChild(helperDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// **NEW FUNCTION**: Show all questions when user clicks "Show all questions"
function showAllQuestions() {
    const helperDiv = document.getElementById("question-helper");
    if (!helperDiv) return;
    
    helperDiv.innerHTML = `
        <div class="helper-title">💡 All available questions:</div>
        <div class="helper-questions">
            ${SUGGESTED_QUESTIONS.map(q => 
                `<button class="helper-question" onclick="askQuestion('${q}')">${q}</button>`
            ).join('')}
        </div>
        <button class="show-more-btn" onclick="showFallbackQuestionHelper()">Show less</button>
    `;
}

function hideQuestionHelper() {
    const helper = document.getElementById("question-helper");
    if (helper) {
        helper.style.opacity = '0';
        helper.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            if (helper.parentElement) {
                helper.remove();
            }
        }, 300);
    }
}

function askQuestion(question) {
    const input = document.getElementById("chat-input");
    if (input) {
        input.value = question;
        sendMessage();
    }
}

function toggleMoreQuestions() {
    const moreQuestions = document.getElementById("more-questions");
    const showMoreBtn = document.querySelector(".show-more-btn");
    
    if (moreQuestions && showMoreBtn) {
        if (moreQuestions.style.display === "none") {
            moreQuestions.style.display = "block";
            showMoreBtn.textContent = "Show less questions";
        } else {
            moreQuestions.style.display = "none";
            showMoreBtn.textContent = "Show more questions";
        }
    }
}

function openChat() {
    const chatWin = document.getElementById("chat-window");
    const chatBtn = document.getElementById("chatbot-btn");
    
    if (chatWin && chatBtn) {
        chatWin.style.display = "flex";
        chatBtn.style.transform = "scale(0.9)";
        
        // Focus on input
        setTimeout(() => {
            const input = document.getElementById("chat-input");
            if (input) {
                input.focus();
            }
        }, 300);
        
        // Show question helper if chat is empty
        setTimeout(() => {
            const chatBox = document.getElementById("chat-box");
            if (chatBox && chatBox.children.length <= 1) {
                showQuestionHelper();
            }
        }, 500);
    }
}

function closeChat() {
    const chatWin = document.getElementById("chat-window");
    const chatBtn = document.getElementById("chatbot-btn");
    
    if (chatWin && chatBtn) {
        chatWin.style.display = "none";
        chatBtn.style.transform = "scale(1)";
    }
}

function toggleChat() {
    const chatWin = document.getElementById("chat-window");
    
    if (chatWin) {
        if (chatWin.style.display === "flex") {
            closeChat();
        } else {
            openChat();
        }
    }
}

// Add some utility functions
function clearChat() {
    const chatBox = document.getElementById("chat-box");
    if (chatBox) {
        chatBox.innerHTML = "";
        showWelcomeMessage();
    }
}

function minimizeChat() {
    const chatWin = document.getElementById("chat-window");
    if (chatWin) {
        chatWin.classList.toggle("minimized");
    }
}

// **NEW FUNCTION**: Return to main menu / reset chat
function returnToMainMenu() {
    clearChat();
    setTimeout(() => {
        showQuestionHelper();
    }, 500);
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    loadData();

    // Get elements
    const btn = document.getElementById("chatbot-btn");
    const chatWin = document.getElementById("chat-window");
    const input = document.getElementById("chat-input");
    const sendBtn = document.getElementById("send-btn");
    const closeBtn = document.getElementById("chat-close-btn");

    // Event listeners
    if (btn) {
        btn.addEventListener("click", toggleChat);
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", closeChat);
    }

    if (sendBtn) {
        sendBtn.addEventListener("click", sendMessage);
    }

    if (input) {
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                sendMessage();
            }
        });

        // Show helper when input is focused and empty
        input.addEventListener("focus", () => {
            const chatBox = document.getElementById("chat-box");
            if (chatBox && input.value.trim() === "" && chatBox.children.length <= 2) {
                setTimeout(() => showQuestionHelper(), 200);
            }
        });
    }

    // Close chat when clicking outside
    document.addEventListener("click", (e) => {
        const chatWin = document.getElementById("chat-window");
        const chatBtn = document.getElementById("chatbot-btn");
        
        if (chatWin && chatBtn) {
            if (chatWin.style.display === "flex" && 
                !chatWin.contains(e.target) && 
                !chatBtn.contains(e.target)) {
                // Don't close if clicking on helper questions
                if (!e.target.closest(".question-helper")) {
                    closeChat();
                }
            }
        }
    });

    console.log("Enhanced wedding chatbot initialized! 🤖💒");
});

// Expose functions globally for inline event handlers
window.askQuestion = askQuestion;
window.toggleMoreQuestions = toggleMoreQuestions;
window.showAllQuestions = showAllQuestions;
window.showFallbackQuestionHelper = showFallbackQuestionHelper;
window.clearChat = clearChat;
window.closeChat = closeChat;
window.openChat = openChat;
window.returnToMainMenu = returnToMainMenu;

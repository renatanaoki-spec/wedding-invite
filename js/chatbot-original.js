// Enhanced Wedding Chatbot - CSV DATA PRIORITIZED VERSION
// Replace your entire js/chatbot-original.js file with this code

let fuse;
let qaData = [];

// Suggested questions for the helper
const SUGGESTED_QUESTIONS = [
    "Who are the bride and groom?",
    "When is the wedding?", 
    "Where is the wedding?",
    "What time does the ceremony start?",
    "What time is the reception?",
    "How do I RSVP?",
    "What should I wear?",
    "Is there parking available?",
    "Can I bring children?",
    "What's the dress code?"
];

// Random questions to show when chatbot doesn't know answer
const FALLBACK_QUESTIONS = [
    "When is the wedding?",
    "Where is the ceremony?", 
    "How do I RSVP?"
];

// Enhanced navigation keywords with specific venue information
const NAVIGATION_KEYWORDS = {
    rsvp: {
        keywords: ['rsvp', 'respond', 'confirmation', 'attend', 'attending', 'confirm attendance', 'reply', 'guest list'],
        section: 'rsvp',
        message: "I'll help you with RSVP! Here's the information about confirming your attendance."
    },
    ceremony: {
        keywords: ['ceremony', 'holy matrimony', 'church', 'gereja', 'santo fransiskus', 'fransiskus asisi', 'morning', '8 am', 'pagi', 'nikah'],
        section: 'ceremony',
        message: "Here's information about the Holy Matrimony ceremony."
    },
    reception: {
        keywords: ['reception', 'party', 'celebration', 'bagas raya', '11 am', 'siang', 'lunch', 'resepsi'],
        section: 'reception', 
        message: "Here's information about the wedding reception."
    },
    location: {
        keywords: ['where', 'location', 'venue', 'place', 'address', 'cibinong', 'tempat'],
        section: 'venues',
        message: "Here are the wedding venue locations and details."
    },
    timing: {
        keywords: ['when', 'time', 'date', 'schedule', 'start', 'begin', 'hour', 'day', 'january', 'jam', 'waktu'],
        section: 'venues',
        message: "Here are the wedding date and time details."
    },
    maps: {
        keywords: ['maps', 'direction', 'how to get', 'navigate', 'driving', 'location maps', 'google maps', 'arah'],
        section: 'venues',
        message: "Here are the Google Maps links for both wedding venues."
    },
    countdown: {
        keywords: ['countdown', 'how long', 'days left', 'time left', 'until wedding', 'berapa hari'],
        section: 'hero',
        message: "Let me show you the wedding countdown!"
    }
};

function loadData() {
    const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR9ryftjbytcsFzmU4KAactGkErWIvh7mzfZ4kpuXREGuPCb6RkNo2qlea5IPE6SpCKYTn7Jzh0QMzb/pub?gid=2043771999&single=true&output=csv";

    console.log("📊 Loading chatbot data from CSV...");
    
    Papa.parse(CSV_URL, {
        download: true,
        header: true,
        complete: function(results) {
            qaData = results.data
                .filter(r => r.Questions && r.Answer)
                .map(r => ({
                    id: r.ID,
                    question: r.Questions.trim(),
                    answer: r.Answer.trim()
                }));

            fuse = new Fuse(qaData, { 
                keys: ["question"], 
                threshold: 0.4,
                includeScore: true
            });
            
            console.log("✅ Chatbot data loaded successfully:");
            console.log(`   📝 ${qaData.length} Q&A pairs from CSV`);
            console.log("   🔍 Sample questions:", qaData.slice(0, 3).map(q => q.question));
            
            // Show welcome message after data loads
            showWelcomeMessage();
        },
        error: function(err) {
            console.error("❌ Error loading CSV data:", err);
            addMessage("bot", "Sorry, I'm having trouble loading my knowledge base. Please try again later or contact Zen & Yessica directly.");
            // Show question helper even on error
            setTimeout(() => showQuestionHelper(), 1000);
        }
    });
}

// Check if question requires navigation to section
function checkForNavigation(query) {
    const lowerQuery = query.toLowerCase();
    
    for (const [type, config] of Object.entries(NAVIGATION_KEYWORDS)) {
        if (config.keywords.some(keyword => lowerQuery.includes(keyword))) {
            return {
                type: type,
                section: config.section,
                message: config.message
            };
        }
    }
    return null;
}

// Primary search function - CSV DATA FIRST
function searchAnswer(query) {
    if (!fuse || !qaData.length) {
        return "Data is still loading, please wait...";
    }
    
    console.log(`🔍 Searching for: "${query}"`);
    
    // Search in CSV data using fuzzy matching
    const result = fuse.search(query);
    
    if (result.length > 0) {
        const bestMatch = result[0];
        console.log(`✅ Found answer in CSV (score: ${bestMatch.score}):`, bestMatch.item.question);
        return bestMatch.item.answer;
    }
    
    console.log("❌ No answer found in CSV data");
    return null; // No answer found in CSV
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

// Add message with navigation button
function addMessageWithNavigation(text, navigationInfo) {
    const chatBox = document.getElementById("chat-box");
    if (!chatBox) return;

    const msgContainer = document.createElement("div");
    msgContainer.className = "msg bot";
    
    msgContainer.innerHTML = `
        <div>${text}</div>
        <div style="margin-top: 12px;">
            <button 
                class="nav-button" 
                onclick="navigateToSection('${navigationInfo.section}', '${navigationInfo.type}')"
                style="
                    background: linear-gradient(135deg, #6b8e72, #557a60);
                    color: white;
                    border: none;
                    padding: 10px 18px;
                    border-radius: 20px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    margin-right: 8px;
                    box-shadow: 0 2px 8px rgba(107, 142, 114, 0.3);
                "
                onmouseover="this.style.transform='scale(1.05) translateY(-2px)'"
                onmouseout="this.style.transform='scale(1)'"
            >
                📍 Take me there
            </button>
            <button 
                class="helper-button" 
                onclick="showQuestionHelper()"
                style="
                    background: transparent;
                    color: #6b8e72;
                    border: 2px solid #6b8e72;
                    padding: 8px 16px;
                    border-radius: 20px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    font-weight: 600;
                    transition: all 0.3s ease;
                "
                onmouseover="this.style.background='#6b8e72'; this.style.color='white'"
                onmouseout="this.style.background='transparent'; this.style.color='#6b8e72'"
            >
                💡 More questions
            </button>
        </div>
    `;
    
    chatBox.appendChild(msgContainer);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Enhanced navigation function with venue-specific targeting
function navigateToSection(sectionType, navigationType) {
    console.log(`🧭 Navigating to ${sectionType} for ${navigationType}`);
    
    let targetElement = null;
    
    // Find the target section
    switch(sectionType) {
        case 'rsvp':
            targetElement = document.querySelector('#rsvpForm') || 
                           document.querySelector('[id*="rsvp" i]') ||
                           document.querySelector('section:has(form)') ||
                           document.querySelector('form');
            break;
            
        case 'ceremony':
            targetElement = document.querySelector('.ceremony-card') ||
                           document.querySelector('.venue-card:first-of-type') ||
                           document.querySelector('section:has(.ceremony-card)');
            break;
            
        case 'reception':
            targetElement = document.querySelector('.reception-card') ||
                           document.querySelector('.venue-card:last-of-type') ||
                           document.querySelector('section:has(.reception-card)');
            break;
            
        case 'venues':
            targetElement = document.querySelector('.venue-card') ||
                           document.querySelector('.timeline-container') ||
                           document.querySelector('section:has(.venue-card)');
            break;
            
        case 'hero':
            targetElement = document.querySelector('#countdown') ||
                           document.querySelector('.countdown-container') ||
                           document.querySelector('.hero') ||
                           document.querySelector('section:has(#countdown)');
            break;
    }
    
    if (targetElement) {
        // Close the chat first
        closeChat();
        
        // Wait a bit for chat to close, then scroll
        setTimeout(() => {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            
            // Add highlight effect
            highlightSection(targetElement);
            
            console.log(`✅ Successfully navigated to ${sectionType}`);
        }, 300);
    } else {
        console.warn(`⚠️ Could not find section: ${sectionType}`);
        addMessage("bot", "Sorry, I couldn't find that section on the page. Please scroll manually to find the information you need.");
    }
}

// Highlight section with animation
function highlightSection(element) {
    // Create highlight overlay
    const highlight = document.createElement('div');
    highlight.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(107, 142, 114, 0.1);
        border: 3px solid #6b8e72;
        border-radius: 15px;
        pointer-events: none;
        z-index: 1000;
        animation: highlightPulse 2s ease-in-out;
    `;
    
    // Make parent relative if needed
    const originalPosition = element.style.position;
    if (!element.style.position || element.style.position === 'static') {
        element.style.position = 'relative';
    }
    
    element.appendChild(highlight);
    
    // Add highlight animation CSS
    if (!document.querySelector('#highlight-animation-style')) {
        const style = document.createElement('style');
        style.id = 'highlight-animation-style';
        style.textContent = `
            @keyframes highlightPulse {
                0% { opacity: 0; transform: scale(0.95); }
                50% { opacity: 1; transform: scale(1.02); }
                100% { opacity: 0; transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Remove highlight after animation
    setTimeout(() => {
        if (highlight.parentElement) {
            highlight.remove();
        }
        // Restore original position
        if (originalPosition) {
            element.style.position = originalPosition;
        } else {
            element.style.position = '';
        }
    }, 2000);
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
        
        // FIRST: Try to get answer from CSV data
        const csvAnswer = searchAnswer(userMsg);
        
        // SECOND: Check if question requires navigation
        const navigationInfo = checkForNavigation(userMsg);
        
        if (csvAnswer) {
            // Show CSV answer first
            addMessage("bot", csvAnswer);
            
            // Then offer navigation if applicable
            if (navigationInfo) {
                setTimeout(() => {
                    addMessageWithNavigation(navigationInfo.message, navigationInfo);
                }, 500);
            }
        } else if (navigationInfo) {
            // If no CSV answer but navigation is relevant, show navigation directly
            addMessageWithNavigation(navigationInfo.message, navigationInfo);
        } else {
            // No answer found anywhere
            addMessage("bot", "Sorry, I don't know the answer to that question yet. Please contact Zen & Yessica directly, or try asking something else!");
            
            setTimeout(() => {
                showFallbackQuestionHelper();
            }, 800);
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

function returnToMainMenu() {
    clearChat();
    setTimeout(() => {
        showQuestionHelper();
    }, 500);
}

// Debug function to show CSV data
function debugShowCSVData() {
    console.log("🔍 CSV Data Debug:");
    console.log(`   📊 Total Q&A pairs: ${qaData.length}`);
    console.log("   📝 All questions:");
    qaData.forEach((item, index) => {
        console.log(`   ${index + 1}. Q: "${item.question}"`);
        console.log(`      A: "${item.answer}"`);
    });
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    console.log("🤖 Initializing CSV-Prioritized Wedding Chatbot...");
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
        console.log("✅ Chat button listener attached");
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", closeChat);
        console.log("✅ Close button listener attached");
    }

    if (sendBtn) {
        sendBtn.addEventListener("click", sendMessage);
        console.log("✅ Send button listener attached");
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
        
        console.log("✅ Input field listeners attached");
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

    console.log("🎉 CSV-prioritized wedding chatbot initialized! 💒🤖");
    
    // Expose debug function for testing
    window.debugShowCSVData = debugShowCSVData;
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
window.navigateToSection = navigateToSection;
window.showQuestionHelper = showQuestionHelper;

// Enhanced Venue-Specific Navigation for Chatbot
// ADD these functions to your existing chatbot-original.js file

// Enhanced navigation keywords with venue-specific targeting
const ENHANCED_NAVIGATION_KEYWORDS = {
    rsvp: {
        keywords: ['rsvp', 'respond', 'confirmation', 'attend', 'attending', 'confirm attendance', 'reply', 'guest list'],
        section: 'rsvp',
        message: "I'll help you with RSVP! Here's the information about confirming your attendance."
    },
    ceremony_specific: {
        keywords: [
            'ceremony', 'holy matrimony', 'church', 'gereja', 'santo fransiskus', 'fransiskus asisi', 
            'morning', '8 am', 'pagi', 'nikah', 'pemberkatan', 'upacara', 'pernikahan',
            'ceremony venue', 'church location', 'morning event', 'first event'
        ],
        section: 'ceremony-specific',
        message: "Here's specific information about the Holy Matrimony ceremony at Gereja Santo Fransiskus Asisi."
    },
    reception_specific: {
        keywords: [
            'reception', 'party', 'celebration', 'bagas raya', '11 am', 'siang', 'lunch', 'resepsi',
            'pesta', 'acara makan', 'second event', 'after ceremony', 'reception venue', 'party location'
        ],
        section: 'reception-specific', 
        message: "Here's specific information about the wedding reception at Bagas Raya Cibinong."
    },
    both_venues: {
        keywords: [
            'where', 'location', 'venue', 'place', 'address', 'cibinong', 'tempat',
            'both venues', 'all locations', 'wedding venues', 'both places'
        ],
        section: 'venues',
        message: "Here are both wedding venue locations and details."
    },
    timing: {
        keywords: ['when', 'time', 'date', 'schedule', 'start', 'begin', 'hour', 'day', 'january', 'jam', 'waktu'],
        section: 'venues',
        message: "Here are the wedding date and time details."
    },
    maps: {
        keywords: ['maps', 'direction', 'how to get', 'navigate', 'driving', 'location maps', 'google maps', 'arah'],
        section: 'venues',
        message: "Here are the Google Maps links for both wedding venues."
    },
    countdown: {
        keywords: ['countdown', 'how long', 'days left', 'time left', 'until wedding', 'berapa hari'],
        section: 'hero',
        message: "Let me show you the wedding countdown!"
    }
};

// Enhanced venue-specific answers
const VENUE_SPECIFIC_ANSWERS = {
    // Ceremony-specific questions
    "Where is the ceremony?": "The Holy Matrimony ceremony will be held at Gereja Santo Fransiskus Asisi, Cibinong at 8:00 AM on January 17, 2026.",
    "What time is the ceremony?": "The Holy Matrimony ceremony starts at 8:00 AM on Saturday, January 17, 2026.",
    "Where is the church?": "The ceremony will be at Gereja Santo Fransiskus Asisi in Cibinong at 8:00 AM.",
    "What time does the ceremony start?": "The ceremony starts at 8:00 AM sharp. Please arrive 15 minutes early.",
    
    // Reception-specific questions
    "Where is the reception?": "The wedding reception will be at Bagas Raya Cibinong at 11:00 AM on January 17, 2026.",
    "What time is the reception?": "The wedding reception starts at 11:00 AM on Saturday, January 17, 2026.",
    "Where is the party?": "The reception party will be at Bagas Raya Cibinong at 11:00 AM.",
    "What time does the reception start?": "The reception starts at 11:00 AM with lunch being served.",
    
    // General venue questions
    "Are the venues close to each other?": "Yes, both the ceremony and reception are in the Cibinong area with 3 hours between events.",
    "How long between ceremony and reception?": "There are 3 hours between the ceremony (8 AM) and reception (11 AM) - perfect time to refresh and prepare for the celebration!",
    "Is there parking available?": "Yes, parking is available at both Gereja Santo Fransiskus Asisi and Bagas Raya Cibinong.",
    
    // Timing questions
    "What time does it start?": "The ceremony starts at 8:00 AM and the reception starts at 11:00 AM on January 17, 2026.",
    "When is the wedding?": "The wedding is on Saturday, January 17, 2026. Ceremony at 8:00 AM, Reception at 11:00 AM.",
    
    // Navigation questions
    "Can you give me directions?": "I can provide Google Maps links to both venues for easy navigation!",
    "How do I get to the venues?": "Both venues are in Cibinong. I can provide Google Maps links to help you navigate to each specific location."
};

// Enhanced navigation function with venue-specific targeting
function navigateToVenueSection(sectionType, navigationType) {
    console.log(`🧭 Navigating to ${sectionType} for ${navigationType}`);
    
    let targetElement = null;
    let highlightClass = '';
    
    // Find the target section with enhanced specificity
    switch(sectionType) {
        case 'rsvp':
            targetElement = document.querySelector('#rsvpForm') || 
                           document.querySelector('[id*="rsvp" i]') ||
                           document.querySelector('section:has(form)') ||
                           document.querySelector('form');
            break;
            
        case 'ceremony-specific':
            targetElement = document.querySelector('#ceremony-venue') ||
                           document.querySelector('.ceremony-card') ||
                           document.querySelector('.venue-card:first-of-type');
            highlightClass = 'ceremony-highlight';
            break;
            
        case 'reception-specific':
            targetElement = document.querySelector('#reception-venue') ||
                           document.querySelector('.reception-card') ||
                           document.querySelector('.venue-card:last-of-type');
            highlightClass = 'reception-highlight';
            break;
            
        case 'venues':
            targetElement = document.querySelector('#wedding-venues') ||
                           document.querySelector('.venue-card') ||
                           document.querySelector('section:has(.venue-card)');
            break;
            
        case 'hero':
            targetElement = document.querySelector('#countdown') ||
                           document.querySelector('.countdown-container') ||
                           document.querySelector('.hero') ||
                           document.querySelector('section:has(#countdown)');
            break;
    }
    
    if (targetElement) {
        // Close the chat first
        closeChat();
        
        // Wait a bit for chat to close, then scroll
        setTimeout(() => {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            
            // Add venue-specific highlight effect
            highlightVenueSection(targetElement, highlightClass);
            
            console.log(`✅ Successfully navigated to ${sectionType}`);
        }, 300);
    } else {
        console.warn(`⚠️ Could not find section: ${sectionType}`);
        addMessage("bot", "Sorry, I couldn't find that section on the page. Please scroll manually to find the information you need.");
    }
}

// Enhanced venue-specific highlighting
function highlightVenueSection(element, highlightClass = '') {
    // Remove any existing highlights
    document.querySelectorAll('.venue-highlighted, .ceremony-highlight, .reception-highlight').forEach(el => {
        el.classList.remove('venue-highlighted', 'ceremony-highlight', 'reception-highlight');
    });
    
    // Add specific highlight class
    if (highlightClass) {
        element.classList.add(highlightClass);
    } else {
        element.classList.add('venue-highlighted');
    }
    
    // Add dynamic highlight styles if not already present
    if (!document.querySelector('#venue-highlight-styles')) {
        const style = document.createElement('style');
        style.id = 'venue-highlight-styles';
        style.textContent = `
            .ceremony-highlight {
                animation: ceremonyPulse 2s ease-in-out;
                border: 3px solid var(--primary-pink) !important;
            }
            
            .reception-highlight {
                animation: receptionPulse 2s ease-in-out;
                border: 3px solid var(--primary-green) !important;
            }
            
            @keyframes ceremonyPulse {
                0%, 100% { 
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
                    transform: translateY(0) scale(1);
                }
                50% { 
                    box-shadow: 0 30px 80px rgba(188, 108, 137, 0.6);
                    transform: translateY(-8px) scale(1.03);
                }
            }
            
            @keyframes receptionPulse {
                0%, 100% { 
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
                    transform: translateY(0) scale(1);
                }
                50% { 
                    box-shadow: 0 30px 80px rgba(107, 142, 114, 0.6);
                    transform: translateY(-8px) scale(1.03);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Remove highlight after animation
    setTimeout(() => {
        element.classList.remove('venue-highlighted', 'ceremony-highlight', 'reception-highlight');
    }, 2000);
}

// Enhanced navigation check with venue specificity
function checkForVenueNavigation(query) {
    const lowerQuery = query.toLowerCase();
    
    for (const [type, config] of Object.entries(ENHANCED_NAVIGATION_KEYWORDS)) {
        if (config.keywords.some(keyword => lowerQuery.includes(keyword))) {
            return {
                type: type,
                section: config.section,
                message: config.message
            };
        }
    }
    return null;
}

// Enhanced search with venue-specific answers
function searchVenueAnswer(query) {
    if (!fuse || !qaData.length) {
        return "Data is still loading, please wait...";
    }
    
    console.log(`🔍 Searching for venue-specific answer: "${query}"`);
    
    // First check venue-specific predefined answers
    const lowerQuery = query.toLowerCase();
    for (const [question, answer] of Object.entries(VENUE_SPECIFIC_ANSWERS)) {
        if (lowerQuery.includes(question.toLowerCase()) || 
            question.toLowerCase().includes(lowerQuery)) {
            console.log(`✅ Found venue-specific answer: ${question}`);
            return answer;
        }
    }
    
    // Then search in CSV data using fuzzy matching
    const result = fuse.search(query);
    
    if (result.length > 0) {
        const bestMatch = result[0];
        console.log(`✅ Found answer in CSV (score: ${bestMatch.score}):`, bestMatch.item.question);
        return bestMatch.item.answer;
    }
    
    console.log("❌ No answer found in venue data or CSV");
    return null;
}

// REPLACE the existing sendMessage function with this enhanced version
function sendVenueAwareMessage() {
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
        
        // FIRST: Try to get venue-specific answer
        const venueAnswer = searchVenueAnswer(userMsg);
        
        // SECOND: Check if question requires venue-specific navigation
        const navigationInfo = checkForVenueNavigation(userMsg);
        
        if (venueAnswer) {
            // Show venue-specific answer first
            addMessage("bot", venueAnswer);
            
            // Then offer specific navigation if applicable
            if (navigationInfo) {
                setTimeout(() => {
                    addMessageWithVenueNavigation(navigationInfo.message, navigationInfo);
                }, 500);
            }
        } else if (navigationInfo) {
            // If no specific answer but navigation is relevant, show navigation directly
            addMessageWithVenueNavigation(navigationInfo.message, navigationInfo);
        } else {
            // No answer found anywhere
            addMessage("bot", "Sorry, I don't know the answer to that question yet. Please contact Zen & Yessica directly, or try asking something else!");
            
            setTimeout(() => {
                showFallbackQuestionHelper();
            }, 800);
        }
    }, 800);

    input.value = "";
}

// Enhanced message with venue-specific navigation
function addMessageWithVenueNavigation(text, navigationInfo) {
    const chatBox = document.getElementById("chat-box");
    if (!chatBox) return;

    const msgContainer = document.createElement("div");
    msgContainer.className = "msg bot";
    
    // Determine button style based on venue type
    let buttonStyle = "background: linear-gradient(135deg, #6b8e72, #557a60);";
    if (navigationInfo.section === 'ceremony-specific') {
        buttonStyle = "background: linear-gradient(135deg, #bc6c89, #a44d6c);";
    } else if (navigationInfo.section === 'reception-specific') {
        buttonStyle = "background: linear-gradient(135deg, #6b8e72, #557a60);";
    }
    
    msgContainer.innerHTML = `
        <div>${text}</div>
        <div style="margin-top: 12px;">
            <button 
                class="nav-button" 
                onclick="navigateToVenueSection('${navigationInfo.section}', '${navigationInfo.type}')"
                style="
                    ${buttonStyle}
                    color: white;
                    border: none;
                    padding: 10px 18px;
                    border-radius: 20px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    margin-right: 8px;
                    box-shadow: 0 2px 8px rgba(107, 142, 114, 0.3);
                "
                onmouseover="this.style.transform='scale(1.05) translateY(-2px)'"
                onmouseout="this.style.transform='scale(1)'"
            >
                📍 Take me there
            </button>
            <button 
                class="helper-button" 
                onclick="showQuestionHelper()"
                style="
                    background: transparent;
                    color: #6b8e72;
                    border: 2px solid #6b8e72;
                    padding: 8px 16px;
                    border-radius: 20px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    font-weight: 600;
                    transition: all 0.3s ease;
                "
                onmouseover="this.style.background='#6b8e72'; this.style.color='white'"
                onmouseout="this.style.background='transparent'; this.style.color='#6b8e72'"
            >
                💡 More questions
            </button>
        </div>
    `;
    
    chatBox.appendChild(msgContainer);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Expose the enhanced functions globally
window.navigateToVenueSection = navigateToVenueSection;
window.addMessageWithVenueNavigation = addMessageWithVenueNavigation;
window.searchVenueAnswer = searchVenueAnswer;
window.checkForVenueNavigation = checkForVenueNavigation;

// Enhanced suggested questions with venue specificity
const VENUE_SPECIFIC_QUESTIONS = [
    "Where is the ceremony?",
    "Where is the reception?",
    "What time is the ceremony?",
    "What time is the reception?",
    "How do I get to the church?",
    "How do I get to Bagas Raya?",
    "Is there parking at both venues?",
    "How long between events?",
    "When is the wedding?",
    "How do I RSVP?"
];

console.log("🎯 Enhanced venue-specific chatbot navigation loaded! 🏛️💒");

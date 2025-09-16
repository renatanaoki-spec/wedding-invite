/**
 * Wedding Countdown Timer
 * Enhanced countdown timer with multiple display options and callbacks
 */

class WeddingCountdown {
    constructor(options = {}) {
        // Configuration
        this.config = {
            targetDate: options.targetDate || "Jan 17, 2026 09:00:00",
            containerId: options.containerId || "countdown",
            daysId: options.daysId || "days",
            hoursId: options.hoursId || "hours", 
            minutesId: options.minutesId || "minutes",
            secondsId: options.secondsId || "seconds",
            completedMessage: options.completedMessage || "🎉 Today is the wedding day!",
            updateInterval: options.updateInterval || 1000,
            onComplete: options.onComplete || null,
            onUpdate: options.onUpdate || null,
            format: options.format || "full", // "full", "compact", "minimal"
            showLabels: options.showLabels !== false,
            animate: options.animate !== false,
            language: options.language || "en"
        };

        // State
        this.targetTime = new Date(this.config.targetDate).getTime();
        this.intervalId = null;
        this.isCompleted = false;
        this.previousValues = { days: 0, hours: 0, minutes: 0, seconds: 0 };

        // Language support
        this.labels = {
            en: {
                days: "Days", day: "Day",
                hours: "Hours", hour: "Hour", 
                minutes: "Minutes", minute: "Minute",
                seconds: "Seconds", second: "Second"
            },
            id: {
                days: "Hari", day: "Hari",
                hours: "Jam", hour: "Jam",
                minutes: "Menit", minute: "Menit", 
                seconds: "Detik", second: "Detik"
            }
        };

        this.init();
    }

    init() {
        this.cacheElements();
        if (this.validateElements()) {
            this.start();
        }
    }

    cacheElements() {
        this.elements = {
            container: document.getElementById(this.config.containerId),
            days: document.getElementById(this.config.daysId),
            hours: document.getElementById(this.config.hoursId),
            minutes: document.getElementById(this.config.minutesId),
            seconds: document.getElementById(this.config.secondsId)
        };
    }

    validateElements() {
        if (!this.elements.container) {
            console.warn(`Countdown container #${this.config.containerId} not found`);
            return false;
        }
        return true;
    }

    calculateTimeLeft() {
        const now = new Date().getTime();
        const difference = this.targetTime - now;

        if (difference <= 0) {
            return {
                days: 0,
                hours: 0, 
                minutes: 0,
                seconds: 0,
                isCompleted: true,
                totalMs: 0
            };
        }

        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((difference % (1000 * 60)) / 1000),
            isCompleted: false,
            totalMs: difference
        };
    }

    formatNumber(number) {
        return number.toString().padStart(2, '0');
    }

    getLabel(key, value) {
        const lang = this.labels[this.config.language] || this.labels.en;
        return value === 1 ? lang[key.slice(0, -1)] : lang[key];
    }

    updateDisplay(timeLeft) {
        if (timeLeft.isCompleted && !this.isCompleted) {
            this.handleCompletion();
            return;
        }

        // Update individual elements if they exist
        if (this.elements.days) {
            const newValue = this.formatNumber(timeLeft.days);
            if (this.config.animate && newValue !== this.elements.days.textContent) {
                this.animateChange(this.elements.days, newValue);
            } else {
                this.elements.days.textContent = newValue;
            }
        }

        if (this.elements.hours) {
            const newValue = this.formatNumber(timeLeft.hours);
            if (this.config.animate && newValue !== this.elements.hours.textContent) {
                this.animateChange(this.elements.hours, newValue);
            } else {
                this.elements.hours.textContent = newValue;
            }
        }

        if (this.elements.minutes) {
            const newValue = this.formatNumber(timeLeft.minutes);
            if (this.config.animate && newValue !== this.elements.minutes.textContent) {
                this.animateChange(this.elements.minutes, newValue);
            } else {
                this.elements.minutes.textContent = newValue;
            }
        }

        if (this.elements.seconds) {
            const newValue = this.formatNumber(timeLeft.seconds);
            if (this.config.animate && newValue !== this.elements.seconds.textContent) {
                this.animateChange(this.elements.seconds, newValue);
            } else {
                this.elements.seconds.textContent = newValue;
            }
        }

        // Call update callback if provided
        if (this.config.onUpdate) {
            this.config.onUpdate(timeLeft);
        }

        this.previousValues = { ...timeLeft };
    }

    animateChange(element, newValue) {
        if (!element) return;

        element.style.transform = 'scale(1.1)';
        element.style.color = '#bc6c89';
        
        setTimeout(() => {
            element.textContent = newValue;
            element.style.transform = 'scale(1)';
            element.style.color = '';
        }, 150);
    }

    handleCompletion() {
        this.isCompleted = true;
        
        if (this.elements.container) {
            this.elements.container.innerHTML = this.config.completedMessage;
            this.elements.container.style.fontSize = '1.5rem';
            this.elements.container.style.fontWeight = 'bold';
            this.elements.container.style.textAlign = 'center';
            this.elements.container.style.padding = '20px';
        }

        if (this.config.onComplete) {
            this.config.onComplete();
        }

        this.stop();
    }

    start() {
        if (this.intervalId) {
            this.stop();
        }

        // Initial update
        const timeLeft = this.calculateTimeLeft();
        this.updateDisplay(timeLeft);

        // Start interval
        this.intervalId = setInterval(() => {
            const timeLeft = this.calculateTimeLeft();
            this.updateDisplay(timeLeft);
        }, this.config.updateInterval);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    restart() {
        this.isCompleted = false;
        this.start();
    }

    // Update target date
    setTargetDate(newDate) {
        this.config.targetDate = newDate;
        this.targetTime = new Date(newDate).getTime();
        this.isCompleted = false;
        this.restart();
    }

    // Get current countdown values
    getCurrentValues() {
        return this.calculateTimeLeft();
    }

    // Generate HTML structure (utility method)
    generateHTML(containerId = 'countdown') {
        return `
            <div id="${containerId}" class="countdown-container">
                <div class="time-box">
                    <span id="days">00</span>
                    ${this.config.showLabels ? '<div class="time-label">Days</div>' : ''}
                </div>
                <div class="time-box">
                    <span id="hours">00</span>
                    ${this.config.showLabels ? '<div class="time-label">Hours</div>' : ''}
                </div>
                <div class="time-box">
                    <span id="minutes">00</span>
                    ${this.config.showLabels ? '<div class="time-label">Minutes</div>' : ''}
                </div>
                <div class="time-box">
                    <span id="seconds">00</span>
                    ${this.config.showLabels ? '<div class="time-label">Seconds</div>' : ''}
                </div>
            </div>
        `;
    }

    // Destroy countdown
    destroy() {
        this.stop();
        this.elements = {};
    }
}

// Simple function for basic countdown (backward compatibility)
function createSimpleCountdown(targetDate, containerId = 'countdown') {
    return new WeddingCountdown({
        targetDate: targetDate,
        containerId: containerId
    });
}

// Auto-initialize for wedding (maintains original functionality)
function initWeddingCountdown() {
    const weddingDate = "Jan 17, 2026 09:00:00";
    
    const countdown = new WeddingCountdown({
        targetDate: weddingDate,
        containerId: "countdown",
        daysId: "days",
        hoursId: "hours", 
        minutesId: "minutes",
        secondsId: "seconds",
        completedMessage: "🎉 Today is the wedding day!",
        animate: true,
        onUpdate: (timeLeft) => {
            // Optional: Add special effects when getting close
            if (timeLeft.totalMs < 24 * 60 * 60 * 1000) { // Less than 24 hours
                document.querySelectorAll('.time-box').forEach(box => {
                    box.style.background = 'rgba(188, 108, 137, 0.2)';
                });
            }
        },
        onComplete: () => {
            // Optional: Trigger confetti or other celebration effects
            console.log("Wedding day has arrived! 🎉");
            
            // Could trigger confetti animation here
            if (typeof triggerConfetti === 'function') {
                triggerConfetti();
            }
        }
    });

    return countdown;
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WeddingCountdown, createSimpleCountdown, initWeddingCountdown };
}

if (typeof window !== 'undefined') {
    window.WeddingCountdown = WeddingCountdown;
    window.createSimpleCountdown = createSimpleCountdown;
    window.initWeddingCountdown = initWeddingCountdown;
}

// Auto-initialize if DOM is ready and countdown elements exist
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('countdown')) {
        initWeddingCountdown();
    }
});

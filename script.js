var video1 = document.getElementById("video1");
var video2 = document.getElementById("video2");
var root = document.documentElement;

// Sync video2 to video1 on play
video1.addEventListener("play", function () {
    video2.currentTime = video1.currentTime;
    video2.play();
});

// Periodic sync check to prevent drift
video1.addEventListener("timeupdate", function () {
    if (Math.abs(video1.currentTime - video2.currentTime) > 0.1) {
        video2.currentTime = video1.currentTime;
    }
});

// Color interpolation helper: lerp between two RGB arrays
function lerpColor(a, b, t) {
    return [
        Math.round(a[0] + (b[0] - a[0]) * t),
        Math.round(a[1] + (b[1] - a[1]) * t),
        Math.round(a[2] + (b[2] - a[2]) * t)
    ];
}

function rgbStr(c) {
    return 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
}

// Light theme colors
var lightBg = [245, 245, 245]; // #f5f5f5
var lightText = [0, 0, 0];    // #000000
var lightCardBg = [26, 26, 26];    // #1a1a1a
var lightShadowDark = [208, 208, 208]; // Dark shadow for f5f5f5
var lightShadowLight = [255, 255, 255]; // Light shadow for f5f5f5

// Dark theme colors
var darkBg = [18, 18, 22];    // #121216 - Rich Slate Dark Background
var darkText = [230, 230, 240]; // #e6e6f0
var darkCardBg = [28, 28, 34];    // #1c1c22 - Cohesive Dark Card
var darkShadowDark = [5, 5, 8];
var darkShadowLight = [28, 28, 34];

function updateOpacity() {
    var maxDrag = this.maxX;
    var progress = maxDrag > 0 ? Math.max(0, Math.min(1, this.x / maxDrag)) : 0;

    // Set video1 (dark) opacity dynamically: 1 (start) to 0 (end)
    var opacityVal = 1 - progress;
    video1.style.opacity = opacityVal;

    // Set arrow icon opacity
    document.querySelector("#dragme i").style.opacity = opacityVal;

    // Synchronize playheads while dragging
    if (Math.abs(video1.currentTime - video2.currentTime) > 0.05) {
        video2.currentTime = video1.currentTime;
    }

    // Change circular indicator color based on completion
    var onCir = document.querySelector(".on-cir");
    if (progress > 0.95) {
        onCir.style.backgroundColor = "#fff";
    } else {
        onCir.style.backgroundColor = "orange";
    }

    // ── Theme interpolation ──
    var bg = lerpColor(lightBg, darkBg, progress);
    var text = lerpColor(lightText, darkText, progress);
    var cardBg = lerpColor(lightCardBg, darkCardBg, progress);
    var shadowDark = lerpColor(lightShadowDark, darkShadowDark, progress);
    var shadowLight = lerpColor(lightShadowLight, darkShadowLight, progress);

    root.style.setProperty('--bg', rgbStr(bg));
    root.style.setProperty('--nav-bg', rgbStr(bg));
    root.style.setProperty('--section-padding-bg', rgbStr(bg));
    root.style.setProperty('--text', rgbStr(text));
    root.style.setProperty('--card-bg', rgbStr(cardBg));
    root.style.setProperty('--logo-filter', 'invert(' + progress + ')');

    // Innovations card theme — white in light, dark in dark
    var cardBgTheme = lerpColor([255, 255, 255], [28, 28, 34], progress);
    root.style.setProperty('--card-bg-theme', rgbStr(cardBgTheme));
    root.style.setProperty('--shadow-dark', rgbStr(shadowDark));
    root.style.setProperty('--shadow-light', rgbStr(shadowLight));

    // Bento card backgrounds (tinted)
    var outstaffingBg = lerpColor([243, 232, 255], [30, 27, 75], progress);
    var aiBg = lerpColor([224, 242, 254], [7, 89, 133], progress);
    var webBg = lerpColor([254, 243, 199], [120, 53, 4], progress);

    root.style.setProperty('--outstaffing-bg', rgbStr(outstaffingBg));
    root.style.setProperty('--ai-bg', rgbStr(aiBg));
    root.style.setProperty('--web-bg', rgbStr(webBg));

    // Card border: highly visible subtle dark grey in light, subtle white in dark
    var borderAlpha = 0.22 + (0.15 - 0.22) * progress;
    var borderColorVal = Math.round(100 + (255 - 100) * progress);
    root.style.setProperty('--card-border', 'rgba(' + borderColorVal + ',' + borderColorVal + ',' + borderColorVal + ', ' + borderAlpha + ')');
}

var myDraggable = Draggable.create("#dragme", {
    type: 'x',
    bounds: "#slider-track",
    onDrag: updateOpacity,
    onThrowUpdate: updateOpacity
});

// ── Marquee word-hover decode animation ──
var decodeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!?';

function scrambleWord(word) {
    var out = '';
    for (var i = 0; i < word.length; i++) {
        out += decodeChars[Math.floor(Math.random() * decodeChars.length)];
    }
    return out;
}

function hoverDecodeWord(el) {
    var word = el.getAttribute('data-word');
    var len = word.length;
    var step = 0;
    if (el._hoverInterval) clearInterval(el._hoverInterval);

    // Phase 1: scramble fully first (quick)
    var scramblePhase = 0;
    var totalScrambles = 6;
    el._hoverInterval = setInterval(function () {
        el.textContent = scrambleWord(word);
        scramblePhase++;
        if (scramblePhase >= totalScrambles) {
            clearInterval(el._hoverInterval);
            // Phase 2: decode left to right
            el._hoverInterval = setInterval(function () {
                var out = '';
                for (var i = 0; i < len; i++) {
                    if (i < step) out += word[i];
                    else out += decodeChars[Math.floor(Math.random() * decodeChars.length)];
                }
                el.textContent = out;
                step += 1;
                if (step > len) {
                    clearInterval(el._hoverInterval);
                    el._hoverInterval = null;
                    el.textContent = word;
                }
            }, 30);
        }
    }, 40);
}

// Attach hover to every marquee word
(function initMarqueeWords() {
    var words = document.querySelectorAll('.marquee-word');
    words.forEach(function (el) {
        el.addEventListener('mouseenter', function () {
            hoverDecodeWord(el);
        });
        el.addEventListener('mouseleave', function () {
            // If still animating, let it finish naturally
            // If already done, do nothing
        });
    });
})();

// ── Scroll Listener for Navbar transformation ──
window.addEventListener('scroll', function () {
    var navbar = document.getElementById('navbar');
    if (window.scrollY >= 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ── Statement Section Animation ──
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from(".statement-text", {
        scrollTrigger: {
            trigger: "#statement-section",
            start: "top 80%",
            toggleActions: "play none none reverse"
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
    });

    gsap.from(".statement-sticker", {
        scrollTrigger: {
            trigger: "#statement-section",
            start: "top 80%",
            toggleActions: "play none none reverse"
        },
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "back.out(1.5)",
        delay: 0.3
    });

    // ── Products Section Animation ──
    gsap.from(".section-title", {
        scrollTrigger: {
            trigger: "#products-section",
            start: "top 85%",
            toggleActions: "play none none reverse"
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
    });

    gsap.from(".product-card", {
        scrollTrigger: {
            trigger: ".products-grid",
            start: "top 85%",
            toggleActions: "play none none reverse"
        },
        y: 60,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out"
    });

    // ── FAQ Section Animation ──
    gsap.from(".faq-item", {
        scrollTrigger: {
            trigger: ".faq-accordion",
            start: "top 85%",
            toggleActions: "play none none reverse"
        },
        y: 30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out"
    });
}

// ── FAQ Accordion Toggle ──
(function initFaqAccordion() {
    var faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(function (item) {
        var question = item.querySelector('.faq-question');
        question.addEventListener('click', function () {
            var answer = item.querySelector('.faq-answer');
            var isActive = item.classList.contains('active');

            // Close all other items
            faqItems.forEach(function (other) {
                if (other !== item) {
                    other.classList.remove('active');
                    other.querySelector('.faq-answer').style.maxHeight = null;
                }
            });

            // Toggle current item
            if (isActive) {
                item.classList.remove('active');
                answer.style.maxHeight = null;
            } else {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });
})();

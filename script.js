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
var darkBg = [0, 0, 0];    // #111111
var darkText = [230, 230, 230]; // #e6e6e6
var darkCardBg = [30, 30, 30];    // #1e1e1e
var darkShadowDark = [0, 0, 0];
var darkShadowLight = [25, 25, 25];

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
    
    // Innovations card theme — white in light, dark in dark
    var cardBgTheme = lerpColor([255, 255, 255], [28, 28, 28], progress);
    root.style.setProperty('--card-bg-theme', rgbStr(cardBgTheme));
    root.style.setProperty('--shadow-dark', rgbStr(shadowDark));
    root.style.setProperty('--shadow-light', rgbStr(shadowLight));

    // Card border: invisible in light, subtle in dark
    var borderAlpha = progress * 0.15;
    root.style.setProperty('--card-border', 'rgba(255, 255, 255, ' + borderAlpha + ')');
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

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
    
    // Innovations card theme
    root.style.setProperty('--card-bg-theme', rgbStr(bg));
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

// ── Marquee decode animation (position-based) ──
var decodeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!?';

function scrambleString(text) {
    var result = '';
    for (var i = 0; i < text.length; i++) {
        if (text[i] === ' ') result += ' ';
        else result += decodeChars[Math.floor(Math.random() * decodeChars.length)];
    }
    return result;
}

// Decode: scrambled → real text, reveals left-to-right
function decodeText(element, cb) {
    if (element._decodeInterval) clearInterval(element._decodeInterval);
    var finalText = element.getAttribute('data-text');
    var len = finalText.length;
    var step = 0;
    element._decodeInterval = setInterval(function () {
        var out = '';
        for (var i = 0; i < len; i++) {
            if (finalText[i] === ' ') out += ' ';
            else if (i < step) out += finalText[i];
            else out += decodeChars[Math.floor(Math.random() * decodeChars.length)];
        }
        element.textContent = out;
        step += 2;
        if (step > len) {
            clearInterval(element._decodeInterval);
            element._decodeInterval = null;
            element.textContent = finalText;
            if (cb) cb();
        }
    }, 25);
}

// Encode: real text → scrambled, scrambles left-to-right
function encodeText(element, cb) {
    if (element._decodeInterval) clearInterval(element._decodeInterval);
    var finalText = element.getAttribute('data-text');
    var len = finalText.length;
    var step = 0;
    element._decodeInterval = setInterval(function () {
        var out = '';
        for (var i = 0; i < len; i++) {
            if (finalText[i] === ' ') out += ' ';
            else if (i < step) out += decodeChars[Math.floor(Math.random() * decodeChars.length)];
            else out += finalText[i];
        }
        element.textContent = out;
        step += 2;
        if (step > len) {
            clearInterval(element._decodeInterval);
            element._decodeInterval = null;
            element.textContent = scrambleString(finalText);
            if (cb) cb();
        }
    }, 25);
}

// Setup: attach state directly to each element
(function initMarquee() {
    var items = document.querySelectorAll('.marquee-item');
    items.forEach(function (item) {
        item._mState = 'scrambled';
        item.textContent = scrambleString(item.getAttribute('data-text'));
    });

    var wrapper = document.querySelector('.marquee-wrapper');

    function tick() {
        var wRect = wrapper.getBoundingClientRect();
        var wLeft = wRect.left;
        var wRight = wRect.right;
        var wWidth = wRect.width;

        items.forEach(function (item) {
            var r = item.getBoundingClientRect();
            var state = item._mState;
            var isInside = r.right > wLeft && r.left < wRight;

            if (state === 'scrambled' && isInside && r.left < wRight) {
                // Entered the visible area — decode it
                item._mState = 'decoding';
                decodeText(item, function () {
                    item._mState = 'decoded';
                });
            }

            if (state === 'decoded' && r.right < wLeft + wWidth * 0.3 && r.right > wLeft - 100) {
                // Approaching left edge — encode it back
                item._mState = 'encoding';
                encodeText(item, function () {
                    item._mState = 'scrambled';
                });
            }

            // Fully off-screen to the left or jumped back to right — reset
            if ((r.right < wLeft - 100 || r.left > wRight + 100) && state !== 'scrambled' && !item._decodeInterval) {
                item.textContent = scrambleString(item.getAttribute('data-text'));
                item._mState = 'scrambled';
            }
        });

        requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
})();

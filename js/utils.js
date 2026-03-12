// =========================================================
// UTILITY FUNCTIONS
// =========================================================

function escHtml(s) {
    return String(s)
        .replace(/&/g, "&amp;")
        .replace(/'/g, "&#39;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function escJs(s) {
    return String(s).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function safeId(str) {
    return String(str).replace(/[^a-zA-Z0-9_-]/g, "_");
}

function rotateArray(arr) {
    if (!arr || !arr.length) return arr;
    var copy = arr.slice();
    var last = copy.pop();
    copy.unshift(last);
    return copy;
}

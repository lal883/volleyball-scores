// =========================================================
// MODE MANAGEMENT
// =========================================================

function enterViewerMode() {
    isScorer = false;
    document.body.classList.add("viewer-mode");
    document.getElementById("loginOverlay").style.display = "none";
    document.getElementById("switchModeBtn").textContent = "Scorer Mode";
    showModeBanner("viewer", "👁 Viewer Mode — Live scores update automatically");
    rebuildAllMatchUI();
}

function attemptScorerLogin() {
    var pw = document.getElementById("passwordInput").value;
    if (pw === SCORER_PASSWORD) {
        isScorer = true;
        document.body.classList.remove("viewer-mode");
        document.getElementById("loginOverlay").style.display = "none";
        document.getElementById("loginError").style.display = "none";
        document.getElementById("switchModeBtn").textContent = "← Exit Scorer";
        showModeBanner("scorer", "✏️ Scorer Mode — Changes sync live to all viewers");
        rebuildAllMatchUI();
    } else {
        document.getElementById("loginError").style.display = "block";
    }
}

function handleSwitchMode() {
    if (isScorer) {
        enterViewerMode();
    } else {
        document.getElementById("loginOverlay").style.display = "flex";
        document.getElementById("passwordInput").value = "";
        document.getElementById("loginError").style.display = "none";
    }
}

function closeLoginOverlay() {
    document.getElementById("loginOverlay").style.display = "none";
}

function showModeBanner(mode, text) {
    var el = document.getElementById("modeBanner");
    el.className = "mode-banner " + mode;
    el.textContent = text;
    el.style.display = "block";
}

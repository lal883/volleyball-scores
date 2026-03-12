// =========================================================
// EDIT TOURNAMENT TEAMS
// =========================================================

function showEditTeamsModal() {
    if (!isScorer) return;
    var grid = document.getElementById("editTeamsGrid");
    if (!grid) return;
    grid.innerHTML = "";
    teams.forEach(function (t, i) {
        var html =
            "<div class='form-card'>" +
            "  <strong>Team " + (i + 1) + ": " + escHtml(t.name) + "</strong>" +
            "  <span class='form-label'>Team Name</span>" +
            "  <input type='text' id='editTeamName_" + i + "' value='" + escHtml(t.name) + "' />" +
            "  <span class='form-label'>Court Players (6, comma sep.)</span>" +
            "  <input type='text' id='editPlayers_" + i + "' value='" + escHtml((t.players || []).join(", ")) + "' />" +
            "  <span class='form-label'>Subs (comma sep.)</span>" +
            "  <input type='text' id='editSubs_" + i + "' value='" + escHtml((t.subs || []).join(", ")) + "' />" +
            "</div>";
        grid.insertAdjacentHTML("beforeend", html);
    });
    document.getElementById("editTeamsModal").classList.add("open");
}

function closeEditTeamsModal() {
    document.getElementById("editTeamsModal").classList.remove("open");
}

function saveEditTeams() {
    if (!isScorer) return;
    teams.forEach(function (t, i) {
        var nameInput = document.getElementById("editTeamName_" + i);
        var playersInput = document.getElementById("editPlayers_" + i);
        var subsInput = document.getElementById("editSubs_" + i);
        if (nameInput) t.name = nameInput.value.trim() || t.name;
        if (playersInput) t.players = playersInput.value.split(",").map(function (p) { return p.trim(); }).filter(Boolean);
        if (subsInput) t.subs = subsInput.value.split(",").map(function (p) { return p.trim(); }).filter(Boolean);
    });
    // Reset per-match active rosters so they pick up the new player names
    Object.keys(matchData).forEach(function (matchId) {
        var m = matchData[matchId];
        if (m) {
            m.activePlayersA = null;
            m.activePlayersB = null;
            m.availableSubsA = null;
            m.availableSubsB = null;
            m.pendingSubA = -1;
            m.pendingSubB = -1;
        }
    });
    closeEditTeamsModal();
    rebuildAllMatchUI();
    renderTeamSetup();
    saveToFirebase();
}

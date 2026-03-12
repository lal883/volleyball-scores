// =========================================================
// ROTATION MANAGEMENT
// =========================================================

function renderRotation(matchId, teamKey) {
    var m = matchData[matchId]; if (!m) return;
    var rot = (teamKey === "A") ? m.rotationA : m.rotationB;
    // Use active (possibly substituted) roster if available
    var players = (teamKey === "A" ? m.activePlayersA : m.activePlayersB)
        || teams[(teamKey === "A") ? m.team1Index : m.team2Index].players || [];

    function slotLabel(posNum) {
        var name = players[posNum - 1] || ("P" + posNum);
        return posNum + ": " + name;
    }

    var containerId = "rotCourt_" + matchId + "_" + teamKey;
    var container = document.getElementById(containerId);
    if (!container) return;

    var pos4 = rot[3], pos3 = rot[2], pos2 = rot[1];
    var pos5 = rot[4], pos1 = rot[0], pos6 = rot[5];

    function posCell(courtPos, label, isServerSlot) {
        var classes = "rot-pos" + (isServerSlot ? " server-slot" : "") + (isScorer ? " draggable" : "");
        if (!isScorer) return "<div class='" + classes + "'>" + label + "</div>";
        return "<div class='" + classes + "' draggable='true'" +
            " ondragstart=\"onRotationDragStart(event,'" + matchId + "','" + teamKey + "'," + courtPos + ")\"" +
            " ondragover='onRotationDragOver(event)'" +
            " ondragleave='onRotationDragLeave(event)'" +
            " ondrop=\"onRotationDrop(event,'" + matchId + "','" + teamKey + "'," + courtPos + ")\">" +
            label + "</div>";
    }

    container.innerHTML =
        "<div class='rot-row'>" +
        "  " + posCell(4, slotLabel(pos4), false) +
        "  " + posCell(3, slotLabel(pos3), false) +
        "  " + posCell(2, slotLabel(pos2), false) +
        "</div>" +
        "<div class='rot-row'>" +
        "  " + posCell(5, slotLabel(pos5), false) +
        "  " + posCell(1, slotLabel(pos1), true) +
        "  " + posCell(6, slotLabel(pos6), false) +
        "</div>";
}

function onRotationDragStart(event, matchId, teamKey, courtPos) {
    if (!isScorer) return;
    rotationDragState = { matchId: matchId, teamKey: teamKey, courtPos: courtPos };
    if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
}

function onRotationDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add("drag-over");
}

function onRotationDragLeave(event) {
    event.currentTarget.classList.remove("drag-over");
}

function onRotationDrop(event, matchId, teamKey, targetPos) {
    event.preventDefault();
    event.currentTarget.classList.remove("drag-over");
    if (!isScorer || !rotationDragState) return;
    if (rotationDragState.matchId !== matchId || rotationDragState.teamKey !== teamKey) return;
    var fromPos = rotationDragState.courtPos;
    rotationDragState = null;
    if (fromPos === targetPos) return;
    var m = matchData[matchId]; if (!m) return;
    var rot = (teamKey === "A") ? m.rotationA : m.rotationB;
    var fromIdx = fromPos - 1;
    var toIdx = targetPos - 1;
    var temp = rot[fromIdx];
    rot[fromIdx] = rot[toIdx];
    rot[toIdx] = temp;
    if (teamKey === "A") m.rotationA = rot; else m.rotationB = rot;
    renderRotation(matchId, teamKey);
    saveToFirebase();
}

function manualRotate(matchId, teamKey) {
    if (!isScorer) return;
    var m = matchData[matchId]; if (!m) return;
    var rot = (teamKey === "A") ? m.rotationA : m.rotationB;
    rot = rotateArray(rot);
    if (teamKey === "A") m.rotationA = rot; else m.rotationB = rot;

    // NOTE: Do NOT change m.serverTeam here — manual rotation is only for
    // arranging player positions, not for declaring who's serving.
    // Only setServer() and side-out logic in changeScore() change serverTeam.

    renderRotation(matchId, teamKey);
    highlightServerButton(matchId);
    saveToFirebase();
}

// Internal rotate that doesn't trigger a separate save
function manualRotateInternal(matchId, teamKey) {
    var m = matchData[matchId]; if (!m) return;
    var rot = (teamKey === "A") ? m.rotationA : m.rotationB;
    rot = rotateArray(rot);
    if (teamKey === "A") m.rotationA = rot; else m.rotationB = rot;

    var players = (teamKey === "A")
        ? (m.activePlayersA || teams[m.team1Index].players || [])
        : (m.activePlayersB || teams[m.team2Index].players || []);
    var pos1Num = rot[0];
    var newServerPlayer = players[pos1Num - 1] || null;
    m.serverTeam = teamKey;
    if (teamKey === "A") m.serverPlayerA = newServerPlayer;
    else m.serverPlayerB = newServerPlayer;

    renderRotation(matchId, teamKey);
    highlightServerButton(matchId);
}

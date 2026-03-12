// =========================================================
// SERVER SELECTION & SERVICE LOG
// =========================================================

function setServer(matchId, teamKey, playerName) {
    if (!isScorer) return;
    var m = matchData[matchId]; if (!m) return;
    m.serverTeam = teamKey;
    if (teamKey === "A") m.serverPlayerA = playerName;
    else m.serverPlayerB = playerName;
    highlightServerButton(matchId);
    saveToFirebase();
}

// Render server-selection buttons using the active (possibly substituted) roster.
function renderServerButtons(matchId) {
    var m = matchData[matchId]; if (!m) return;
    ensureActivePlayers(matchId);
    var t1 = teams[m.team1Index], t2 = teams[m.team2Index];
    var playersA = m.activePlayersA || t1.players || [];
    var playersB = m.activePlayersB || t2.players || [];

    var containerA = document.getElementById("srvContainer_" + matchId + "_A");
    var containerB = document.getElementById("srvContainer_" + matchId + "_B");

    if (containerA) {
        containerA.innerHTML = playersA.map(function (p) {
            var sid = "srv_" + matchId + "_A_" + safeId(p);
            return "<span id='" + sid + "' class='player-btn' onclick=\"setServer('" + matchId + "','A','" + escJs(p) + "')\">" + escHtml(p) + "</span>";
        }).join("");
    }
    if (containerB) {
        containerB.innerHTML = playersB.map(function (p) {
            var sid = "srv_" + matchId + "_B_" + safeId(p);
            return "<span id='" + sid + "' class='player-btn' onclick=\"setServer('" + matchId + "','B','" + escJs(p) + "')\">" + escHtml(p) + "</span>";
        }).join("");
    }
    highlightServerButton(matchId);
}

function highlightServerButton(matchId) {
    var m = matchData[matchId]; if (!m) return;
    var t1 = teams[m.team1Index], t2 = teams[m.team2Index];
    // Clear highlights from all possible names (original + active roster)
    var pA = (t1.players || []).concat(m.activePlayersA || []);
    var pB = (t2.players || []).concat(m.activePlayersB || []);

    pA.forEach(function (p) {
        var el = document.getElementById("srv_" + matchId + "_A_" + safeId(p));
        if (el) el.classList.remove("server-highlight");
    });
    pB.forEach(function (p) {
        var el = document.getElementById("srv_" + matchId + "_B_" + safeId(p));
        if (el) el.classList.remove("server-highlight");
    });

    if (m.serverPlayerA) {
        var elA = document.getElementById("srv_" + matchId + "_A_" + safeId(m.serverPlayerA));
        if (elA) elA.classList.add("server-highlight");
    }
    if (m.serverPlayerB) {
        var elB = document.getElementById("srv_" + matchId + "_B_" + safeId(m.serverPlayerB));
        if (elB) elB.classList.add("server-highlight");
    }
}

function logServiceEvent(matchId, scoringTeam) {
    var m = matchData[matchId]; if (!m) return;
    var serverTeam = m.serverTeam;
    var serverPlayer = (serverTeam === "A") ? m.serverPlayerA : m.serverPlayerB;
    if (!m.serviceLog) m.serviceLog = [];
    m.serviceLog.push({
        time: new Date().toLocaleTimeString(),
        serverTeam: serverTeam,
        serverPlayer: serverPlayer || "",
        scoringTeam: scoringTeam,
        scoreA: m.scoreA,
        scoreB: m.scoreB,
        rally: m.rallyCounter
    });
}

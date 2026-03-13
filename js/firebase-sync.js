// =========================================================
// FIREBASE INIT & SYNC
// =========================================================
var app, db, dbRef;
var firebaseReady = false;
var pendingWrite = false;
var lastWriteAckAt = 0;
var writeErrorState = false;
var activeWriteToken = null;
var activeWriteTimeout = null;

function clearActiveWriteTimeout() {
    if (activeWriteTimeout) clearTimeout(activeWriteTimeout);
    activeWriteTimeout = null;
}

try {
    app = firebase.initializeApp(FIREBASE_CONFIG);
    db = firebase.database();
    dbRef = db.ref("tournament");
    firebaseReady = true;
} catch (e) {
    console.warn("Firebase init failed. Running in offline/demo mode.", e);
}

function setConnectionLabel(text, connectedClass) {
    var statusEl = document.getElementById("connectionStatus");
    var labelEl = document.getElementById("connectionLabel");
    if (!statusEl || !labelEl) return;
    statusEl.className = "connection-status " + connectedClass;
    labelEl.textContent = text;
}

function saveToFirebase() {
    if (!firebaseReady || !isScorer) return;

    var writeToken = String(Date.now()) + "_" + Math.random().toString(36).slice(2, 7);
    activeWriteToken = writeToken;
    localUpdate = true;

    var state = {
        teams: teams,
        schedule: schedule,
        matchData: matchData,
        autoRotate: autoRotate,
        activeMatchId: activeMatchId,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    pendingWrite = true;
    writeErrorState = false;
    setConnectionLabel("Syncing…", "connected");

    clearActiveWriteTimeout();
    activeWriteTimeout = setTimeout(function () {
        if (activeWriteToken !== writeToken) return;
        pendingWrite = false;
        writeErrorState = true;
        localUpdate = false;
        activeWriteToken = null;
        setConnectionLabel("Sync timeout", "disconnected");
    }, 8000);

    dbRef.set(state).then(function () {
        if (activeWriteToken !== writeToken) return;
        clearActiveWriteTimeout();
        lastWriteAckAt = Date.now();
        pendingWrite = false;
        writeErrorState = false;
        localUpdate = false;
        activeWriteToken = null;
        setConnectionLabel("Synced", "connected");
    }).catch(function (err) {
        if (activeWriteToken !== writeToken) return;
        clearActiveWriteTimeout();
        console.error("Firebase write error:", err);
        pendingWrite = false;
        writeErrorState = true;
        localUpdate = false;
        activeWriteToken = null;
        setConnectionLabel("Sync issue", "disconnected");
    });
}

function loadFromFirebase() {
    if (!firebaseReady) return;

    // One-time load
    dbRef.once("value").then(function (snapshot) {
        var data = snapshot.val();
        if (data) applyState(data);
    });

    // Real-time listener
    dbRef.on("value", function (snapshot) {
        var data = snapshot.val();
        if (data) applyState(data);

        // Treat observed value events as forward progress for scorer sync status.
        if (isScorer && pendingWrite && !writeErrorState) {
            lastWriteAckAt = Date.now();
            pendingWrite = false;
            localUpdate = false;
            clearActiveWriteTimeout();
            activeWriteToken = null;
            setConnectionLabel("Synced", "connected");
        }
    });

    // Connection monitoring
    var connRef = firebase.database().ref(".info/connected");
    connRef.on("value", function (snap) {
        if (snap.val() === true) {
            if (isScorer) {
                if (writeErrorState) setConnectionLabel("Sync issue", "disconnected");
                else if (pendingWrite) setConnectionLabel("Syncing…", "connected");
                else setConnectionLabel("Synced", "connected");
            } else {
                setConnectionLabel("Live", "connected");
            }
        } else {
            setConnectionLabel("Offline", "disconnected");
        }
    });

    setInterval(function () {
        if (!isScorer || !firebaseReady) return;
        if (writeErrorState) return;
        if (!pendingWrite && lastWriteAckAt && (Date.now() - lastWriteAckAt > 15000)) {
            setConnectionLabel("No recent sync", "disconnected");
        }
    }, 5000);
}

function applyState(data) {
    if (data.teams) teams = data.teams;
    if (data.schedule) schedule = data.schedule;
    if (data.matchData) matchData = data.matchData;
    if (data.autoRotate !== undefined) autoRotate = data.autoRotate;
    if (data.activeMatchId !== undefined) activeMatchId = data.activeMatchId;

    renderTeamSetup();
    rebuildAllMatchUI();
}

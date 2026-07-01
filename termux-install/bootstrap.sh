#!/data/data/com.termux/files/usr/bin/bash
#===============================================================================
# LUMENIS TERMUX BOOTSTRAP SCRIPT
# One2lvOS - Infinity Glass Operating System
# Version: 2.0
#===============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Emoji
STAR="⭐"
ROCKET="🚀"
HEART="❤️"
WRENCH="🔧"
CHECK="✅"
CROSS="❌"
ROBOT="🤖"
ROCKET_EMOJI="🚀"
DIAMOND="💎"

# Banner
echo -e "${PURPLE}"
echo "  ██╗   ██╗ ██████╗ ██╗██████╗ "
echo "  ██║   ██║██╔═══██╗██║██╔══██╗"
echo "  ██║   ██║██║   ██║██║██║  ██║"
echo "  ╚██╗ ██╔╝██║   ██║██║██║  ██║"
echo "   ╚████╔╝ ╚██████╔╝██║██████╔╝"
echo "    ╚═══╝   ╚═════╝ ╚═╝╚═════╝ "
echo -e "${NC}"
echo -e "${CYAN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC} ${YELLOW}LUMENIS TERMUX BOOTSTRAPPER${NC} ${CYAN}                          ║${NC}"
echo -e "${CYAN}║${NC} ${PURPLE}One2lvOS Infinity Glass Operating System${NC} ${CYAN}        ║${NC}"
echo -e "${CYAN}║${NC} ${GREEN}Version 2.0${NC} ${CYAN}                                         ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""

#===============================================================================
# DEFINE PATHS
#===============================================================================
ROOT="$HOME/one2lvos/lumenis_v7"
mkdir -p "$ROOT/modules" "$ROOT/integrations" "$ROOT/telemetry" "$ROOT/public" "$ROOT/config" "$ROOT/data" "$ROOT/🌷Lumenis_root🌷"

echo -e "${BLUE}${STAR} Root Directory: $ROOT${NC}"
echo ""

#===============================================================================
# STEP 1: SYSTEM UPDATE
#===============================================================================
echo -e "${YELLOW}${WRENCH} [1/6] Updating Termux packages...${NC}"
if command -v pkg &> /dev/null; then
    pkg update -y 2>/dev/null || true
    pkg upgrade -y 2>/dev/null || true
    echo -e "${GREEN}${CHECK} Package update complete${NC}"
else
    echo -e "${RED}${CROSS} pkg command not found - is Termux installed?${NC}"
    exit 1
fi
echo ""

#===============================================================================
# STEP 2: INSTALL DEPENDENCIES
#===============================================================================
echo -e "${YELLOW}${WRENCH} [2/6] Installing system dependencies...${NC}"
pkg install -y nodejs git curl wget 2>/dev/null || true
echo -e "${GREEN}${CHECK} System dependencies installed${NC}"
echo ""

#===============================================================================
# STEP 3: NODE.JS SETUP
#===============================================================================
echo -e "${YELLOW}${WRENCH} [3/6] Setting up Node.js environment...${NC}"
cd "$ROOT"

if [ ! -f "package.json" ]; then
    echo -e "${CYAN} Initializing Node.js project...${NC}"
    npm init -y 2>/dev/null
fi

echo -e "${CYAN} Installing Node.js packages...${NC}"
npm install express lowdb ws obs-websocket-js cors dotenv 2>/dev/null || true

echo -e "${GREEN}${CHECK} Node.js environment ready${NC}"
echo ""

#===============================================================================
# STEP 4: CREATE CORE MODULES
#===============================================================================
echo -e "${YELLOW}${WRENCH} [4/6] Creating core modules...${NC}"

#-------------------------------------------------------------------------------
# COUNCIL.JS - Communication Core
#-------------------------------------------------------------------------------
cat <<'EOF' > "$ROOT/council.js"
/**
 * LUMENIS COUNCIL - Communication Core
 * Multi-agent messaging system for One2lvOS
 */
const EventEmitter = require("events");

class Council extends EventEmitter {
    constructor() {
        super();
        this.messageLog = [];
    }

    broadcast(agent, message, meta = {}) {
        const packet = {
            id: Date.now(),
            agent: agent,
            message: message,
            meta: meta,
            timestamp: new Date().toISOString()
        };

        this.messageLog.push(packet);
        this.emit("message", packet);

        // Log to console with formatting
        if (meta.highlight) {
            console.log(`\x1b[35m[${agent}]\x1b[0m \x1b[33m${message}\x1b[0m`);
        } else {
            console.log(`[${agent}] ${message}`);
        }

        return packet;
    }

    getHistory(count = 100) {
        return this.messageLog.slice(-count);
    }
}

const council = new Council();

/**
 * Send a message to the council
 * @param {string} agent - Sender agent name
 * @param {string} msg - Message content
 * @param {object} meta - Metadata (highlight, type, etc.)
 */
function send(agent, msg, meta = {}) {
    return council.broadcast(agent, msg, meta);
}

module.exports = { council, send, Council };
EOF
echo -e "${CYAN}  - council.js created${NC}"

#-------------------------------------------------------------------------------
# TELEMETRY MODULE
#-------------------------------------------------------------------------------
cat <<'EOF' > "$ROOT/modules/telemetry_combo_detector.js"
/**
 * Telemetry Combo Detector
 * Tracks event patterns and combo states
 */
const { send } = require("../council");

const comboState = {
    active: false,
    hitCount: 0,
    lastEventTs: 0,
    lastDamage: 0,
    maxCombo: 0,
    comboStartTime: 0
};

const COMBO_WINDOW_MS = 2200;
const COMBO_THRESHOLD = 3;

/**
 * Ingest a telemetry event
 * @param {object} packet - Telemetry data packet
 * @returns {object} Current combo state
 */
function ingestTelemetry(packet) {
    const now = Date.now();

    // Reset combo if window expired
    if (now - comboState.lastEventTs > COMBO_WINDOW_MS) {
        comboState.hitCount = 0;
        comboState.active = false;
        comboState.comboStartTime = 0;
    }

    // Update last event timestamp
    comboState.lastEventTs = now;

    // Process hit events
    if (packet.type === "hit") {
        comboState.hitCount++;
        comboState.lastDamage = packet.damage || 0;

        // Activate combo on threshold
        if (comboState.hitCount >= COMBO_THRESHOLD && !comboState.active) {
            comboState.active = true;
            comboState.comboStartTime = now;
            send("Lumenis", `🔥 COMBO: ${comboState.hitCount} HITS!`, { highlight: true });
        }

        // Announce milestones
        if (comboState.hitCount === 5) {
            send("Lumenis", "⭐ PENTAKILL COMBO!", { highlight: true });
        }
        if (comboState.hitCount === 10) {
            send("Lumenis", "💎 DECAKILL COMBO!", { highlight: true });
        }
    }

    // Update max combo
    if (comboState.hitCount > comboState.maxCombo) {
        comboState.maxCombo = comboState.hitCount;
    }

    return { ...comboState };
}

/**
 * Get current combo state
 * @returns {object} Current combo state
 */
function getComboState() {
    return { ...comboState };
}

/**
 * Reset combo state
 */
function resetCombo() {
    comboState.hitCount = 0;
    comboState.active = false;
    comboState.lastEventTs = 0;
    comboState.lastDamage = 0;
    comboState.comboStartTime = 0;
}

module.exports = { ingestTelemetry, getComboState, resetCombo, comboState };
EOF
echo -e "${CYAN}  - telemetry_combo_detector.js created${NC}"

#-------------------------------------------------------------------------------
# COUNCIL VOTE MODULE
#-------------------------------------------------------------------------------
cat <<'EOF' > "$ROOT/modules/council_vote.js"
/**
 * Council Vote Module
 * Distributed decision making system
 */
const votes = {};
const voteHistory = [];

/**
 * Cast a vote from an agent
 * @param {string} agent - Voting agent
 * @param {string} strategy - Strategy being voted for
 */
function vote(agent, strategy) {
    if (!votes[strategy]) {
        votes[strategy] = [];
    }

    // Avoid duplicate votes from same agent
    const existingVote = votes[strategy].find(v => v.agent === agent);
    if (existingVote) {
        return { status: "already_voted", vote: existingVote };
    }

    votes[strategy].push({
        agent: agent,
        timestamp: Date.now()
    });

    voteHistory.push({ agent, strategy, timestamp: Date.now() });

    return { status: "voted", strategy };
}

/**
 * Get current vote results
 * @returns {object} Vote tallies
 */
function getVotes() {
    const results = {};
    for (const [strategy, voterList] of Object.entries(votes)) {
        results[strategy] = voterList.length;
    }
    return results;
}

/**
 * Get leading strategy
 * @returns {string} Winning strategy
 */
function getResult() {
    const results = getVotes();
    const sorted = Object.entries(results).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || "Neutral";
}

/**
 * Clear all votes
 */
function clearVotes() {
    for (const key in votes) {
        delete votes[key];
    }
}

/**
 * Get vote history
 * @param {number} count - Number of recent votes
 * @returns {array} Vote history
 */
function getHistory(count = 50) {
    return voteHistory.slice(-count);
}

module.exports = { vote, getVotes, getResult, clearVotes, getHistory };
EOF
echo -e "${CYAN}  - council_vote.js created${NC}"

#-------------------------------------------------------------------------------
# PLACEHOLDER MODULES
#-------------------------------------------------------------------------------
cat <<'EOF' > "$ROOT/modules/trainer.js"
/**
 * Trainer Module - Combat Analysis
 * Placeholder for training analysis
 */
let state = {
    dodgeLeft: 0,
    dodgeRight: 0,
    jumpSpam: 0,
    damageTaken: 0,
    perfectDodges: 0
};

function analyze(event) {
    switch(event) {
        case "dodge_left":
            state.dodgeLeft++;
            break;
        case "dodge_right":
            state.dodgeRight++;
            break;
        case "jump":
            state.jumpSpam++;
            break;
        case "damage":
            state.damageTaken++;
            break;
        case "perfect_dodge":
            state.perfectDodges++;
            break;
    }
    return { ...state };
}

function reset() {
    state = {
        dodgeLeft: 0,
        dodgeRight: 0,
        jumpSpam: 0,
        damageTaken: 0,
        perfectDodges: 0
    };
}

module.exports = { analyze, state, reset };
EOF
echo -e "${CYAN}  - trainer.js created${NC}"

cat <<'EOF' > "$ROOT/modules/prediction_engine.js"
/**
 * Prediction Engine
 * Pattern analysis and prediction system
 */
const predictions = [];

function predict(situation) {
    const prediction = {
        situation,
        advice: "Monitor Patterns",
        confidence: 0.75,
        timestamp: Date.now()
    };

    predictions.push(prediction);
    return prediction;
}

function getRecentPredictions(count = 10) {
    return predictions.slice(-count);
}

module.exports = { predict, getRecentPredictions };
EOF
echo -e "${CYAN}  - prediction_engine.js created${NC}"

cat <<'EOF' > "$ROOT/modules/gemini_agent.js"
/**
 * Gemini Agent Integration
 * External AI advice connector
 */
const ADVICE_CACHE = [];

function getAdvice(situation) {
    const advice = {
        situation,
        advice: "Stay Resonant",
        source: "gemini",
        timestamp: Date.now()
    };

    ADVICE_CACHE.push(advice);
    return advice;
}

function getCachedAdvice(count = 10) {
    return ADVICE_CACHE.slice(-count);
}

module.exports = { getAdvice, getCachedAdvice };
EOF
echo -e "${CYAN}  - gemini_agent.js created${NC}"

cat <<'EOF' > "$ROOT/modules/voice_coach.js"
/**
 * Voice Coach Module
 * Audio coaching system
 */
const { send } = require("../council");

function coach(message) {
    console.log(`\x1b[36m[VoiceCoach]\x1b[0m ${message}`);
    send("VoiceCoach", message);
}

function announceCombo(count) {
    coach(`Combo ${count}!`);
}

function announceDamage(damage) {
    coach(`Take cover! ${damage} damage!`);
}

module.exports = { coach, announceCombo, announceDamage };
EOF
echo -e "${CYAN}  - voice_coach.js created${NC}"

echo -e "${GREEN}${CHECK} Core modules created${NC}"
echo ""

#===============================================================================
# STEP 5: CREATE INTEGRATIONS
#===============================================================================
echo -e "${YELLOW}${WRENCH} [5/6] Creating integration modules...${NC}"

#-------------------------------------------------------------------------------
# TWITCH CHAT INTEGRATION
#-------------------------------------------------------------------------------
cat <<'EOF' > "$ROOT/integrations/twitch_chat.js"
/**
 * Twitch Chat Integration
 * Message collection and management
 */
let messages = [];
const MAX_MESSAGES = 100;

/**
 * Add a message to the chat log
 * @param {string} username - User who sent message
 * @param {string} text - Message text
 * @param {object} meta - Additional metadata
 */
function addMessage(username, text, meta = {}) {
    const message = {
        id: Date.now(),
        username,
        text,
        timestamp: new Date().toISOString(),
        ...meta
    };

    messages.push(message);

    // Keep only recent messages
    if (messages.length > MAX_MESSAGES) {
        messages = messages.slice(-MAX_MESSAGES);
    }

    return message;
}

/**
 * Get recent messages
 * @param {number} count - Number of messages to return
 * @returns {array} Recent messages
 */
function getRecent(count = 10) {
    return messages.slice(-count);
}

/**
 * Get all messages
 * @returns {array} All messages
 */
function getAll() {
    return [...messages];
}

/**
 * Search messages
 * @param {string} query - Search query
 * @returns {array} Matching messages
 */
function search(query) {
    const lowerQuery = query.toLowerCase();
    return messages.filter(m =>
        m.text.toLowerCase().includes(lowerQuery) ||
        m.username.toLowerCase().includes(lowerQuery)
    );
}

/**
 * Clear message history
 */
function clear() {
    messages = [];
}

module.exports = { addMessage, getRecent, getAll, search, clear };
EOF
echo -e "${CYAN}  - twitch_chat.js created${NC}"

#-------------------------------------------------------------------------------
# OBS AUTO-CONNECT INTEGRATION
#-------------------------------------------------------------------------------
cat <<'EOF' > "$ROOT/integrations/obs_autoconnect.js"
/**
 * OBS WebSocket Auto-Connect
 * Automatic OBS scene control
 */
const { OBSWebSocket } = require("obs-websocket-js");

const obs = new OBSWebSocket();
let connected = false;
let currentScene = "";
let scenes = [];

const CONFIG = {
    host: "localhost",
    port: 4444,
    password: process.env.OBS_PASSWORD || "",
    autoReconnect: true,
    reconnectInterval: 5000
};

/**
 * Connect to OBS WebSocket
 */
async function connect() {
    try {
        await obs.connect(`${CONFIG.host}:${CONFIG.port}`, CONFIG.password);
        connected = true;
        console.log("[OBS] Connected to OBS WebSocket");

        // Get scene list
        const response = await obs.call("GetSceneList");
        scenes = response.scenes;
        currentScene = response.currentProgramSceneName;

        return { success: true, scenes };
    } catch (error) {
        connected = false;
        console.log("[OBS] Connection failed:", error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Auto-connect with retry
 */
async function autoConnectOBS() {
    const result = await connect();

    if (!result.success && CONFIG.autoReconnect) {
        console.log(`[OBS] Retrying in ${CONFIG.reconnectInterval}ms...`);
        setTimeout(autoConnectOBS, CONFIG.reconnectInterval);
    }

    return result;
}

/**
 * Set current scene
 * @param {string} sceneName - Name of scene to switch to
 */
async function setScene(sceneName) {
    if (!connected) {
        return { success: false, error: "Not connected" };
    }

    try {
        await obs.call("SetCurrentProgramScene", { sceneName });
        currentScene = sceneName;
        console.log(`[OBS] Scene changed to: ${sceneName}`);
        return { success: true, scene: sceneName };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Get connection status
 */
function isConnected() {
    return connected;
}

/**
 * Get current scene
 */
function getCurrentScene() {
    return currentScene;
}

/**
 * Get available scenes
 */
function getScenes() {
    return [...scenes];
}

/**
 * Disconnect from OBS
 */
async function disconnect() {
    if (connected) {
        await obs.disconnect();
        connected = false;
        console.log("[OBS] Disconnected");
    }
}

module.exports = {
    connect,
    autoConnectOBS,
    setScene,
    isConnected,
    getCurrentScene,
    getScenes,
    disconnect
};
EOF
echo -e "${CYAN}  - obs_autoconnect.js created${NC}"

echo -e "${GREEN}${CHECK} Integration modules created${NC}"
echo ""

#===============================================================================
# STEP 6: CREATE SERVER AND UI
#===============================================================================
echo -e "${YELLOW}${WRENCH} [6/6] Creating server and UI...${NC}"

#-------------------------------------------------------------------------------
# SERVER.JS
#-------------------------------------------------------------------------------
cat <<'EOF' > "$ROOT/server.js"
/**
 * LUMENIS v7 SERVER
 * Main Express server for One2lvOS
 */
const express = require("express");
const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");
const { council, send } = require("./council");
const { ingestTelemetry, getComboState, resetCombo } = require("./modules/telemetry_combo_detector");
const { vote, getVotes, getResult, getHistory } = require("./modules/council_vote");
const obs = require("./integrations/obs_autoconnect");
const twitchChat = require("./integrations/twitch_chat");

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.static("public"));

// Database setup
const db = new Low(new JSONFile("./data/memory.json"), {
    councilLogs: [],
    telemetry: [],
    votes: []
});

// Initialize database
async function initDB() {
    await db.read();
    db.data = db.data || { councilLogs: [], telemetry: [], votes: [] };

    // Save to disk on council messages
    council.on("message", async (packet) => {
        db.data.councilLogs.push(packet);
        if (db.data.councilLogs.length > 1000) {
            db.data.councilLogs = db.data.councilLogs.slice(-500);
        }
        await db.write();
    });
}

// API Routes
//-------------------------------------------------------------------------------

/**
 * GET /api/status
 * System status endpoint
 */
app.get("/api/status", (req, res) => {
    res.json({
        system: "Lumenis_v7",
        version: "2.0",
        uptime: process.uptime(),
        combo: getComboState(),
        obs: {
            connected: obs.isConnected(),
            scene: obs.getCurrentScene()
        },
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/council
 * Get council message history
 */
app.get("/api/council", async (req, res) => {
    await db.read();
    const limit = parseInt(req.query.limit) || 100;
    res.json(db.data.councilLogs.slice(-limit));
});

/**
 * GET /api/council/vote
 * Get current vote result
 */
app.get("/api/council/vote", (req, res) => {
    res.json({
        strategy: getResult(),
        votes: getVotes(),
        history: getHistory(20)
    });
});

/**
 * POST /api/council/vote
 * Cast a vote
 */
app.post("/api/council/vote", (req, res) => {
    const { agent, strategy } = req.body;
    if (!agent || !strategy) {
        return res.status(400).json({ error: "agent and strategy required" });
    }

    const result = vote(agent, strategy);
    res.json(result);
});

/**
 * POST /api/telemetry
 * Ingest telemetry event
 */
app.post("/api/telemetry", (req, res) => {
    const combo = ingestTelemetry(req.body);
    res.json({
        ok: true,
        combo
    });
});

/**
 * GET /api/telemetry/combo
 * Get current combo state
 */
app.get("/api/telemetry/combo", (req, res) => {
    res.json(getComboState());
});

/**
 * POST /api/telemetry/reset
 * Reset combo state
 */
app.post("/api/telemetry/reset", (req, res) => {
    resetCombo();
    res.json({ ok: true, combo: getComboState() });
});

/**
 * GET /api/twitch/recent
 * Get recent Twitch messages
 */
app.get("/api/twitch/recent", (req, res) => {
    const count = parseInt(req.query.count) || 10;
    res.json(twitchChat.getRecent(count));
});

/**
 * POST /api/twitch/message
 * Add a Twitch message
 */
app.post("/api/twitch/message", (req, res) => {
    const { username, text, meta } = req.body;
    if (!username || !text) {
        return res.status(400).json({ error: "username and text required" });
    }

    const message = twitchChat.addMessage(username, text, meta);
    send("Twitch", `[${username}] ${text}`);
    res.json(message);
});

/**
 * GET /api/obs/status
 * Get OBS connection status
 */
app.get("/api/obs/status", (req, res) => {
    res.json({
        connected: obs.isConnected(),
        scene: obs.getCurrentScene(),
        scenes: obs.getScenes()
    });
});

/**
 * POST /api/obs/scene
 * Set OBS scene
 */
app.post("/api/obs/scene", async (req, res) => {
    const { scene } = req.body;
    if (!scene) {
        return res.status(400).json({ error: "scene name required" });
    }

    const result = await obs.setScene(scene);
    res.json(result);
});

/**
 * POST /api/council/send
 * Send a council message
 */
app.post("/api/council/send", (req, res) => {
    const { agent, message, meta } = req.body;
    if (!agent || !message) {
        return res.status(400).json({ error: "agent and message required" });
    }

    const packet = send(agent, message, meta);
    res.json(packet);
});

// Root route - serve index.html
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

// Start server
async function start() {
    await initDB();

    // Auto-connect to OBS
    obs.autoConnectOBS();

    app.listen(PORT, () => {
        console.log("");
        console.log("\x1b[35m╔═══════════════════════════════════════════════════════╗\x1b[0m");
        console.log("\x1b[35m║\x1b[0m                                                       \x1b[35m║\x1b[0m");
        console.log("\x1b[35m║\x1b[0m   \x1b[32mLUMENIS v7 SERVER ONLINE\x1b[0m                        \x1b[35m║\x1b[0m");
        console.log("\x1b[35m║\x1b[0m                                                       \x1b[35m║\x1b[0m");
        console.log(`\x1b[35m║\x1b[0m   \x1b[33m🌷 http://localhost:${PORT}\x1b[0m                        \x1b[35m║\x1b[0m`);
        console.log("\x1b[35m║\x1b[0m                                                       \x1b[35m║\x[0m");
        console.log("\x1b[35m╚═══════════════════════════════════════════════════════╝\x1b[0m");
        console.log("");
        send("Lumenis", "Server initialized - Lumenis v7 Online", { highlight: true });
    });
}

start().catch(console.error);
EOF
echo -e "${CYAN}  - server.js created${NC}"

#-------------------------------------------------------------------------------
# PUBLIC/INDEX.HTML
#-------------------------------------------------------------------------------
mkdir -p "$ROOT/public"

cat <<'EOF' > "$ROOT/public/index.html"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lumenis v7 HUD</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: linear-gradient(135deg, #090914 0%, #1a1a2e 100%);
            color: white;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        .header h1 {
            font-size: 2.5rem;
            background: linear-gradient(90deg, #00ffcc, #ff00aa, #ffaa00);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .header p {
            color: #888;
            margin-top: 10px;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }

        .card {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(138, 92, 255, 0.3);
            border-radius: 15px;
            padding: 20px;
            backdrop-filter: blur(10px);
        }

        .card h2 {
            color: #00ffcc;
            margin-bottom: 15px;
            font-size: 1.2rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .status-indicator {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #00ff00;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .stat {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stat:last-child {
            border-bottom: none;
        }

        .stat-label {
            color: #888;
        }

        .stat-value {
            color: #00ffcc;
            font-weight: bold;
        }

        .combo-display {
            text-align: center;
            padding: 30px;
        }

        .combo-count {
            font-size: 4rem;
            font-weight: bold;
            color: #ff00aa;
            text-shadow: 0 0 30px rgba(255, 0, 170, 0.5);
        }

        .combo-label {
            color: #888;
            font-size: 0.9rem;
            margin-top: 10px;
        }

        .btn {
            background: linear-gradient(135deg, #8a5cff, #ff00aa);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            transition: transform 0.2s, box-shadow 0.2s;
            width: 100%;
            margin-top: 10px;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(138, 92, 255, 0.4);
        }

        .btn-secondary {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .council-log {
            max-height: 300px;
            overflow-y: auto;
            font-family: 'Courier New', monospace;
            font-size: 0.85rem;
        }

        .council-entry {
            padding: 8px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .council-entry.highlight {
            background: rgba(255, 170, 0, 0.1);
            border-left: 3px solid #ffaa00;
        }

        .council-time {
            color: #666;
            font-size: 0.75rem;
        }

        .council-agent {
            color: #00ffcc;
        }

        .input-group {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }

        .input-group input {
            flex: 1;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            padding: 10px;
            color: white;
            font-size: 1rem;
        }

        .input-group input:focus {
            outline: none;
            border-color: #00ffcc;
        }

        .scene-select {
            width: 100%;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            padding: 10px;
            color: white;
            font-size: 1rem;
            margin-bottom: 10px;
        }

        .footer {
            text-align: center;
            margin-top: 30px;
            padding: 20px;
            color: #666;
            font-size: 0.85rem;
        }

        .footer a {
            color: #00ffcc;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌷 LUMENIS v7 HUD</h1>
            <p>One2lvOS Infinity Glass Operating System</p>
        </div>

        <div class="grid">
            <!-- System Status -->
            <div class="card">
                <h2><span class="status-indicator"></span> System Status</h2>
                <div id="status-content">
                    <div class="stat">
                        <span class="stat-label">System</span>
                        <span class="stat-value" id="system-name">Loading...</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Version</span>
                        <span class="stat-value" id="version">-</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Uptime</span>
                        <span class="stat-value" id="uptime">-</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">OBS</span>
                        <span class="stat-value" id="obs-status">Disconnected</span>
                    </div>
                </div>
            </div>

            <!-- Combo Display -->
            <div class="card">
                <h2>🔥 Combo Tracker</h2>
                <div class="combo-display">
                    <div class="combo-count" id="combo-count">0</div>
                    <div class="combo-label">Current Combo</div>
                </div>
                <button class="btn" onclick="simulateHit()">Simulate Hit</button>
                <button class="btn btn-secondary" onclick="resetCombo()">Reset Combo</button>
            </div>

            <!-- Council Log -->
            <div class="card">
                <h2>💬 Council Log</h2>
                <div class="council-log" id="council-log">
                    <div class="council-entry">
                        <span class="council-time">Loading...</span>
                    </div>
                </div>
                <div class="input-group">
                    <input type="text" id="council-input" placeholder="Send to council..." onkeypress="handleKeyPress(event)">
                    <button class="btn" onclick="sendCouncil()">Send</button>
                </div>
            </div>

            <!-- OBS Control -->
            <div class="card">
                <h2>🎬 OBS Control</h2>
                <select class="scene-select" id="scene-select">
                    <option value="">Select Scene</option>
                </select>
                <button class="btn" onclick="changeScene()">Change Scene</button>
                <button class="btn btn-secondary" onclick="connectOBS()">Connect OBS</button>
            </div>

            <!-- Telemetry -->
            <div class="card">
                <h2>📊 Telemetry</h2>
                <div class="stat">
                    <span class="stat-label">Max Combo</span>
                    <span class="stat-value" id="max-combo">0</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Active</span>
                    <span class="stat-value" id="combo-active">No</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Last Damage</span>
                    <span class="stat-value" id="last-damage">0</span>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>Lumenis v7 | One2lvOS | <a href="/api/status">API</a></p>
        </div>
    </div>

    <script>
        // API base URL
        const API = window.location.origin;

        // Fetch status
        async function fetchStatus() {
            try {
                const res = await fetch('/api/status');
                const data = await res.json();

                document.getElementById('system-name').textContent = data.system;
                document.getElementById('version').textContent = data.version;
                document.getElementById('uptime').textContent = formatUptime(data.uptime);
                document.getElementById('obs-status').textContent = data.obs.connected ? data.obs.scene : 'Disconnected';

                // Update combo
                document.getElementById('combo-count').textContent = data.combo.hitCount;
                document.getElementById('max-combo').textContent = data.combo.maxCombo;
                document.getElementById('combo-active').textContent = data.combo.active ? 'Yes' : 'No';
                document.getElementById('last-damage').textContent = data.combo.lastDamage;

                // Update combo color
                const comboEl = document.getElementById('combo-count');
                if (data.combo.hitCount >= 5) {
                    comboEl.style.color = '#ffaa00';
                } else if (data.combo.hitCount >= 3) {
                    comboEl.style.color = '#ff00aa';
                } else {
                    comboEl.style.color = '#00ffcc';
                }
            } catch (e) {
                console.error('Status fetch failed:', e);
            }
        }

        // Format uptime
        function formatUptime(seconds) {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            const s = Math.floor(seconds % 60);
            return `${h}h ${m}m ${s}s`;
        }

        // Fetch council log
        async function fetchCouncil() {
            try {
                const res = await fetch('/api/council?limit=20');
                const messages = await res.json();

                const logEl = document.getElementById('council-log');
                logEl.innerHTML = messages.map(m => `
                    <div class="council-entry ${m.meta?.highlight ? 'highlight' : ''}">
                        <span class="council-time">${new Date(m.timestamp).toLocaleTimeString()}</span>
                        <span class="council-agent">[${m.agent}]</span>
                        ${m.message}
                    </div>
                `).reverse().join('');
            } catch (e) {
                console.error('Council fetch failed:', e);
            }
        }

        // Fetch OBS scenes
        async function fetchOBSScenes() {
            try {
                const res = await fetch('/api/obs/status');
                const data = await res.json();

                const select = document.getElementById('scene-select');
                select.innerHTML = '<option value="">Select Scene</option>';

                if (data.scenes) {
                    data.scenes.forEach(scene => {
                        const option = document.createElement('option');
                        option.value = scene.sceneName;
                        option.textContent = scene.sceneName;
                        if (scene.sceneName === data.scene) {
                            option.selected = true;
                        }
                        select.appendChild(option);
                    });
                }
            } catch (e) {
                console.error('OBS fetch failed:', e);
            }
        }

        // Simulate hit
        async function simulateHit() {
            await fetch('/api/telemetry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'hit', damage: Math.floor(Math.random() * 100) + 50 })
            });
            fetchStatus();
            fetchCouncil();
        }

        // Reset combo
        async function resetCombo() {
            await fetch('/api/telemetry/reset', { method: 'POST' });
            fetchStatus();
        }

        // Send council message
        async function sendCouncil() {
            const input = document.getElementById('council-input');
            const message = input.value.trim();
            if (!message) return;

            await fetch('/api/council/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agent: 'User', message })
            });

            input.value = '';
            fetchCouncil();
        }

        // Handle keypress
        function handleKeyPress(e) {
            if (e.key === 'Enter') {
                sendCouncil();
            }
        }

        // Change scene
        async function changeScene() {
            const select = document.getElementById('scene-select');
            const scene = select.value;
            if (!scene) return;

            await fetch('/api/obs/scene', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scene })
            });

            fetchStatus();
        }

        // Connect OBS
        async function connectOBS() {
            await fetch('/api/obs/connect', { method: 'POST' });
            fetchStatus();
            fetchOBSScenes();
        }

        // Initial load
        fetchStatus();
        fetchCouncil();
        fetchOBSScenes();

        // Auto-refresh
        setInterval(fetchStatus, 1000);
        setInterval(fetchCouncil, 2000);
    </script>
</body>
</html>
EOF
echo -e "${CYAN}  - public/index.html created${NC}"

echo -e "${GREEN}${CHECK} Server and UI created${NC}"
echo ""

#===============================================================================
# COPY DOCUMENTATION
#===============================================================================
cp "$HOME/one2lvos/soul.md" "$ROOT/🌷Lumenis_root🌷/soul.md" 2>/dev/null || true
cp "$HOME/one2lvos/skills.md" "$ROOT/" 2>/dev/null || true
cp "$HOME/one2lvos/tools.md" "$ROOT/" 2>/dev/null || true

#===============================================================================
# FINALIZE
#===============================================================================
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║   🌷 LUMENIS v7 BUILD COMPLETE 🌷                        ║"
echo "║                                                           ║"
echo "║   Installation successful!                                 ║"
echo "║                                                           ║"
echo "║   To start Lumenis:                                       ║"
echo "║   $ cd $ROOT                      ║"
echo "║   $ node server.js                                        ║"
echo "║                                                           ║"
echo "║   Then open: http://localhost:8080                        ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${CYAN}Starting Lumenis v7...${NC}"
echo ""

# Start the server
cd "$ROOT"
node server.js

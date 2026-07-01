#!/data/data/com.termux/files/usr/bin/bash
# =============================================================================
# One2lvOS Full Auto-Build Script
# Lumenis v7 + Phase 9 Delta Engine + Docker + APK Ready
# =============================================================================
set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

log() { echo -e "${GREEN}[✓]${NC} $1"; }
info() { echo -e "${CYAN}[i]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; }

# Detect Termux vs Linux
if [[ -d "/data/data/com.termux/files/home" ]]; then
    IS_TERMUX=true
    ROOT="$HOME/one2lvos"
    PREFIX="/data/data/com.termux/files/usr"
else
    IS_TERMUX=false
    ROOT="${HOME}/one2lvos"
    PREFIX="/usr"
fi

# Directories
LUMENIS="$ROOT/lumenis_v7"
API="$ROOT/one2lv_api"
PHASE9="$ROOT/one2lv_phase9"
DOCKER="$ROOT/docker"
LOGS="$ROOT/logs"

echo ""
echo -e "${MAGENTA}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║${NC}   🌌 One2lvOS Full System Builder v9.0.0                    ${MAGENTA}║${NC}"
echo -e "${MAGENTA}║${NC}   Lumenis v7 + Phase 9 Delta Engine + Docker + APK           ${MAGENTA}║${NC}"
echo -e "${MAGENTA}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# =============================================================================
# CONFIGURATION
# =============================================================================
read -p "Enter admin password [default: one2lvOS2024]: " ADMIN_PASS
ADMIN_PASS="${ADMIN_PASS:-one2lvOS2024}"
JWT_SECRET="${JWT_SECRET:-one2lv_delta_secret_2024}"
API_PORT="${API_PORT:-3000}"
LUMENIS_PORT="${LUMENIS_PORT:-8080}"
PHASE9_PORT="${PHASE9_PORT:-8081}"

# =============================================================================
# PRE-CLEAN
# =============================================================================
info "Cleaning previous installation..."
rm -rf "$ROOT"
mkdir -p "$LUMENIS/public" "$LUMENIS/data" "$LUMENIS/modules" "$LUMENIS/integrations"
mkdir -p "$API" "$PHASE9" "$DOCKER" "$LOGS"

# =============================================================================
# 1. LUMENIS v7 SETUP
# =============================================================================
log "Building Lumenis v7 modules..."

# Package.json
cat <<'EOF' > "$LUMENIS/package.json"
{
  "name": "lumenis_v7",
  "version": "7.0.0",
  "type": "commonjs",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "lowdb": "^5.0.0",
    "ws": "^8.13.0",
    "obs-websocket-js": "^5.0.0",
    "discord.js": "^14.11.0",
    "tmi.js": "^1.8.5",
    "node-fetch": "^2.6.11"
  }
}
EOF

# Memory storage
cat <<EOF > "$LUMENIS/data/memory.json"
{
  "matches": [],
  "councilLogs": [],
  "clips": [],
  "predictions": [],
  "commands": []
}
EOF

# Council module
cat <<'EOF' > "$LUMENIS/council.js"
const EventEmitter = require("events");
const council = new EventEmitter();

function send(agent, msg, meta = {}) {
  council.emit("msg", { agent, msg, meta, time: Date.now() });
}

function broadcast(event, data) {
  council.emit(event, data);
}

module.exports = { council, send, broadcast };
EOF

# Trainer module with Phase 9 symbols
cat <<'EOF' > "$LUMENIS/modules/trainer.js"
const { send } = require("../council");

// State tracking with 3D vector representation (³)
let state = {
  dodgeLeft: 0,
  dodgeRight: 0,
  jumpSpam: 0,
  combo: 0,
  block: 0,
  // ³ 3D vector state
  vector: { x: 0, y: 0, z: 0, magnitude: 0 }
};

function analyze(event) {
  const timestamp = Date.now();

  switch (event) {
    case "dodgeLeft":
      state.dodgeLeft++;
      state.vector.x -= 0.3; // ³ horizontal axis
      send("Strategist", "Opponent likely dodge left", { event, count: state.dodgeLeft });
      break;
    case "dodgeRight":
      state.dodgeRight++;
      state.vector.x += 0.3;
      send("Strategist", "Opponent likely dodge right", { event, count: state.dodgeRight });
      break;
    case "jumpSpam":
      state.jumpSpam++;
      state.vector.z += 0.4; // ³ vertical axis
      send("Strategist", "Opponent favors aerial entry", { event, count: state.jumpSpam });
      break;
    case "combo":
      state.combo++;
      send("Lumenis", "COMBO DETECTED!", { highlight: true, count: state.combo });
      break;
    case "block":
      state.block++;
      state.vector.y += 0.2; // ³ depth axis
      send("Strategist", "Blocking pattern observed", { event, count: state.block });
      break;
  }

  // Update magnitude (∆ delta calculation)
  state.vector.magnitude = Math.sqrt(
    state.vector.x ** 2 +
    state.vector.y ** 2 +
    state.vector.z ** 2
  );

  return state;
}

function reset() {
  state = { dodgeLeft: 0, dodgeRight: 0, jumpSpam: 0, combo: 0, block: 0, vector: { x: 0, y: 0, z: 0, magnitude: 0 } };
}

function getState() {
  return { ...state };
}

module.exports = { analyze, reset, getState };
EOF

# Prediction Engine (∆/∆⁹)
cat <<'EOF' > "$LUMENIS/modules/prediction_engine.js"

// ³ Delta Engine with 9 layers (∆⁹)
const DELTA_LAYERS = 9;
let deltaStack = [];

// Initialize 9-layer gradient stack (∆⁹)
function initDeltaStack() {
  const layers = ['perception', 'reasoning', 'action', 'feedback', 'memory', 'prediction', 'planning', 'execution', 'refinement'];
  deltaStack = layers.map(name => ({ name, weight: 1.0, value: 0, velocity: 0 }));
}

// Amplify (++)
function amplify(value, factor = 1.2) {
  return Math.min(1.0, value * factor);
}

// Attenuate (--)
function attenuate(value, factor = 0.8) {
  return value * factor;
}

// Propagate through delta layers (∆)
function propagate(target, input) {
  let current = input;
  const deltas = [];

  for (let i = 0; i < deltaStack.length && i < DELTA_LAYERS; i++) {
    const layer = deltaStack[i];
    const error = target - current;
    const gradient = error * layer.weight;

    layer.velocity = 0.9 * layer.velocity + gradient * 0.01;
    layer.value = current + layer.velocity;
    current = layer.value;

    deltas.push({ layer: layer.name, delta: gradient, index: i });
  }

  return { output: current, deltas, error: target - current, layers: deltaStack.length };
}

function predict(state) {
  // Apply delta propagation (∆)
  const target = 0.8;
  const result = propagate(target, state.vector.magnitude);

  if (state.combo > 3) return { action: "punish", confidence: amplify(0.9), delta: result };
  if (state.jumpSpam > 2) return { action: "anti-air", confidence: amplify(0.8), delta: result };
  if (state.dodgeLeft > 2) return { action: "cover-left", confidence: amplify(0.85), delta: result };
  if (state.dodgeRight > 2) return { action: "cover-right", confidence: amplify(0.85), delta: result };
  if (state.block > 2) return { action: "grab", confidence: attenuate(0.7), delta: result };

  return { action: "observe", confidence: 0.5, delta: result };
}

initDeltaStack();
module.exports = { predict, amplify, attenuate, propagate, getStack: () => deltaStack, initDeltaStack };
EOF

# Voice coach
cat <<'EOF' > "$LUMENIS/modules/voice_coach.js"
function coach(msg, urgency = "normal") {
  const prefix = urgency === "high" ? "🚨" : urgency === "low" ? "💤" : "🎤";
  console.log(`${prefix} Coach: ${msg}`);
  return { msg, urgency, timestamp: Date.now() };
}

function announceCombo(count) {
  return coach(`COMBO x${count}!`, count > 5 ? "high" : "normal");
}

module.exports = { coach, announceCombo };
EOF

# Gemini/AI Agent
cat <<'EOF' > "$LUMENIS/modules/gemini_agent.js"
function geminiAdvice(state) {
  const predictions = [];

  if (state.combo > 3) predictions.push("Opponent under pressure - capitalize");
  if (state.jumpSpam > 2) predictions.push("Punish aerial entries with anti-air");
  if (state.dodgeLeft > 2) predictions.push("Cover left escape route");
  if (state.dodgeRight > 2) predictions.push("Cover right escape route");
  if (state.block > 2) predictions.push("Break through with grabs");

  return {
    advice: predictions.length > 0 ? predictions.join(" | ") : "Continue observing opponent",
    predictions,
    vector: state.vector // ³ Include vector data
  };
}

module.exports = { geminiAdvice };
EOF

# Integrations
mkdir -p "$LUMENIS/integrations"

cat <<'EOF' > "$LUMENIS/integrations/twitch_chat.js"
let chat = [];
const MAX_CHAT = 50;

function push(msg) {
  chat.push({ msg, time: Date.now() });
  if (chat.length > MAX_CHAT) chat.shift();
}

function recent(n = 10) {
  return chat.slice(-n);
}

function clear() {
  chat = [];
}

module.exports = { push, recent, clear };
EOF

cat <<'EOF' > "$LUMENIS/integrations/obs_control.js"
const { OBSWebSocket } = require("obs-websocket-js");
const obs = new OBSWebSocket();
let connected = false;

async function connect(url = "ws://127.0.0.1:4455", password = "") {
  try {
    await obs.connect(url, password);
    connected = true;
    console.log("OBS WebSocket connected");
    return true;
  } catch (e) {
    console.log("OBS not connected (run OBS with WebSocket plugin)");
    return false;
  }
}

async function clip() {
  if (!connected) return { success: false, error: "Not connected" };
  try {
    await obs.call("SaveReplayBuffer");
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function switchScene(scene) {
  if (!connected) return { success: false };
  try {
    await obs.call("SetCurrentProgramScene", { sceneName: scene });
    return { success: true, scene };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

module.exports = { connect, clip, switchScene };
EOF

cat <<'EOF' > "$LUMENIS/integrations/steam_api.js"
const steam = {
  games: [],
  online: false,

  async checkGame(gameId) {
    // Placeholder for Steam API integration
    return { playing: false, gameId };
  },

  getOverlay() {
    return {
      show: () => console.log("Steam Overlay shown"),
      hide: () => console.log("Steam Overlay hidden")
    };
  }
};

module.exports = steam;
EOF

# Lumenis server
cat <<'EOF' > "$LUMENIS/server.js"
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");
const { council, send } = require("./council");
const { analyze, reset, getState } = require("./modules/trainer");
const { predict, amplify, attenuate, getStack } = require("./modules/prediction_engine");
const { geminiAdvice } = require("./modules/gemini_agent");
const { coach, announceCombo } = require("./modules/voice_coach");
const twitch = require("./integrations/twitch_chat");
const obs = require("./integrations/obs_control");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const adapter = new JSONFile("./data/memory.json");
const db = new Low(adapter, { matches: [], councilLogs: [], clips: [], predictions: [], commands: [] });

app.use(express.json());
app.use(express.static("public"));

// WebSocket broadcast
wss.on("connection", (ws) => {
  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data);
      if (msg.type === "event") {
        const state = analyze(msg.event);
        const prediction = predict(state);
        broadcast({ type: "update", state, prediction });

        if (msg.event === "combo") {
          announceCombo(state.combo);
        }
      }
    } catch (e) {
      console.error("WS message error:", e.message);
    }
  });

  // Send initial state
  ws.send(JSON.stringify({ type: "connected", state: getState() }));
});

function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Council events
council.on("msg", async (m) => {
  await db.read();
  db.data.councilLogs.push(m);
  if (m.meta.highlight) {
    db.data.clips.push({ time: Date.now(), reason: "combo highlight" });
  }
  await db.write();
  broadcast({ type: "council", message: m });
});

async function init() {
  await db.read();
  db.data ||= { matches: [], councilLogs: [], clips: [], predictions: [], commands: [] };
  await db.write();
}

// API Routes
app.get("/api/status", (req, res) => {
  const state = getState();
  res.json({
    system: "Lumenis_v7",
    version: "7.0.0",
    trainer: state,
    prediction: predict(state),
    gemini: geminiAdvice(state),
    delta: { layers: getStack().length, stack: getStack() }, // ∆⁹
    vector: state.vector, // ³
    uptime: process.uptime()
  });
});

app.post("/api/event", (req, res) => {
  const { event } = req.body;
  if (!event) return res.status(400).json({ error: "Event required" });

  const state = analyze(event);
  const prediction = predict(state);
  coach(prediction.action);

  res.json({ ok: true, state, prediction });
});

app.post("/api/reset", (req, res) => {
  reset();
  res.json({ ok: true, message: "State reset" });
});

app.get("/api/council", (req, res) => {
  res.json(db.data.councilLogs.slice(-50));
});

app.get("/api/memory", (req, res) => {
  res.json(db.data);
});

app.post("/api/chat", (req, res) => {
  const { msg } = req.body;
  if (!msg) return res.status(400).json({ error: "Message required" });
  twitch.push(msg);
  res.json({ ok: true, recent: twitch.recent() });
});

// Phase 9 Delta API
app.get("/api/delta", (req, res) => {
  res.json({ stack: getStack(), layers: DELTA_LAYERS });
});

app.post("/api/delta/amplify", (req, res) => {
  const { value } = req.body;
  res.json({ original: value, amplified: amplify(value || 0.5), symbol: "++" });
});

app.post("/api/delta/attenuate", (req, res) => {
  const { value } = req.body;
  res.json({ original: value, attenuated: attenuate(value || 0.5), symbol: "--" });
});

app.post("/api/obs/clip", async (req, res) => {
  const result = await obs.clip();
  res.json(result);
});

const PORT = process.env.LUMENIS_PORT || 8080;
init().then(() => {
  server.listen(PORT, () => {
    console.log(`\n🌷 Lumenis v7 Online`);
    console.log(`   HTTP: http://localhost:${PORT}`);
    console.log(`   WS: ws://localhost:${PORT}`);
    console.log(`   Symbols: ³ ³D | ∆/∆⁹ Delta\n`);
  });
});
EOF

# =============================================================================
# 2. SECURE API SETUP
# =============================================================================
log "Building secure One2lv API..."

cat <<EOF > "$API/package.json"
{
  "name": "one2lvOs-api",
  "version": "9.0.0",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "express-rate-limit": "^6.7.0",
    "jsonwebtoken": "^9.0.0",
    "bcrypt": "^5.1.0",
    "winston": "^3.10.0",
    "dotenv": "^16.3.1"
  }
}
EOF

cat <<EOF > "$API/server.js"
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import winston from "winston";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.API_PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "${JWT_SECRET}";
const TEMP_USER = "admin";
const TEMP_PASS = "${ADMIN_PASS}";

let LIVE_HASH = "";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.File({ filename: "./logs/auth.log" }),
    new winston.transports.File({ filename: "./logs/error.log", level: "error" }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

// Initialize
(async () => {
  LIVE_HASH = await bcrypt.hash(TEMP_PASS, 10);
  logger.info({ event: "init", user: TEMP_USER, timestamp: new Date().toISOString() });
  console.log(\`\n🔐 One2lvOS Secure API\`);
  console.log(\`   User: \${TEMP_USER}\`);
  console.log(\`   Pass: \${TEMP_PASS}\`);
  console.log(\`   Port: \${PORT}\n\`);
})();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "256kb" }));
app.use(rateLimit({ windowMs: 60000, max: 100 }));

// Auth middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token Missing" });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid Token" });
    req.user = user;
    next();
  });
};

// Routes
app.get("/api/status", (req, res) => {
  res.json({
    node: "One2lvOS_Phase9",
    security: "active",
    status: "operational",
    version: "9.0.0",
    delta: true, // ∆⁹ enabled
    symbols: ["³", "++", "--", "∆", "∆⁹"],
    timestamp: new Date().toISOString()
  });
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) return res.status(400).json({ error: "Missing credentials" });
  if (username !== TEMP_USER) return res.status(400).json({ error: "User not found" });

  const valid = await bcrypt.compare(password, LIVE_HASH);
  if (!valid) {
    logger.warn({ event: "login_failed", user: username });
    return res.status(403).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ id: 1, role: "admin" }, JWT_SECRET, { expiresIn: "24h" });
  logger.info({ event: "login_success", user: TEMP_USER });
  res.json({ token, expiresIn: "24h" });
});

app.post("/api/deploy", authenticateToken, (req, res) => {
  const logEntry = \`[\${new Date().toISOString()}] DEPLOY by \${req.user.role}\n\`;
  fs.appendFileSync("./logs/deploy.log", logEntry);
  logger.info({ event: "deploy", by: req.user.role });
  res.json({ success: true, message: "Deployment logged" });
});

app.get("/api/health", (req, res) => {
  res.json({ healthy: true, uptime: process.uptime() });
});

app.listen(PORT, () => console.log(\`🌐 API running on port \${PORT}\`));
EOF

# =============================================================================
# 3. PHASE 9 DELTA ENGINE
# =============================================================================
log "Building Phase 9 Delta Engine..."

cat <<'EOF' > "$PHASE9/package.json"
{
  "name": "one2lv_phase9",
  "version": "9.0.0",
  "type": "module",
  "scripts": { "start": "node server.js" },
  "dependencies": {
    "express": "^4.18.2",
    "ws": "^8.14.0"
  }
}
EOF

cat <<'EOF' > "$PHASE9/server.js"
import express from "express";
import { WebSocketServer } from "ws";
import { createVector3D, scaleVector, magnitude, toArray } from "./modules/system_dynamics.js";
import { DeltaEngine, DELTA_LAYERS } from "./modules/delta_engine.js";

const app = express();
const wss = new WebSocketServer({ port: 8081 });

app.use(express.json());

let currentVector = createVector3D(0, Math.PI / 4, 1.0);
const deltaEngine = new DeltaEngine();

// Initialize 9 layers (∆⁹)
const layers = ['perception', 'reasoning', 'action', 'feedback', 'memory', 'prediction', 'planning', 'execution', 'refinement'];
layers.forEach(name => deltaEngine.addLayer(name, 1.0));

// 3D Vector API (³)
app.post("/api/vector3d", (req, res) => {
  const { theta, phi, magnitude } = req.body;
  currentVector = createVector3D(theta, phi, magnitude || 1.0);
  res.json({ ok: true, vector: currentVector, symbol: "³" });
});

app.get("/api/vector3d", (req, res) => {
  res.json({ vector: currentVector, array: toArray(currentVector), magnitude: magnitude(currentVector), symbol: "³" });
});

// Delta API (∆/∆⁹)
app.post("/api/delta/propagate", (req, res) => {
  const { target } = req.body;
  const result = deltaEngine.propagate(target, currentVector.magnitude);
  res.json({ ok: true, ...result, symbol: "∆", maxLayers: DELTA_LAYERS });
});

app.post("/api/delta/amplify", (req, res) => {
  const amplified = deltaEngine.amplify(currentVector.magnitude);
  res.json({ original: currentVector.magnitude, amplified, symbol: "++" });
});

app.post("/api/delta/attenuate", (req, res) => {
  const attenuated = deltaEngine.attenuate(currentVector.magnitude);
  res.json({ original: currentVector.magnitude, attenuated, symbol: "--" });
});

app.get("/api/delta", (req, res) => {
  res.json({ state: deltaEngine.getState(), symbol: "∆⁹", maxLayers: DELTA_LAYERS });
});

// WebSocket
wss.on("connection", (ws) => {
  ws.send(JSON.stringify({
    type: "phase9_status",
    vector: currentVector,
    delta: deltaEngine.getState(),
    symbols: { vector3d: "³", amplify: "++", attenuate: "--", delta: "∆", delta9: "∆⁹" }
  }));
});

app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
<html><head><title>One2lvOS Phase 9</title></head>
<body style="background:#0a0a0f;color:#fff;font-family:monospace;">
<h1>🌌 One2lvOS Phase 9</h1>
<p>∆⁹ 9-Layer Delta Engine | ³ 3D Vectors</p>
<p>WebSocket: ws://localhost:8081</p>
<pre id="data"></pre>
<script>
const ws = new WebSocket("ws://localhost:8081");
ws.onmessage = e => document.getElementById("data").textContent = JSON.stringify(JSON.parse(e.data), null, 2);
</script>
</body></html>`);
});

app.listen(8080, () => {
  console.log("\n🌌 Phase 9 Delta Engine Online");
  console.log("   HTTP: http://localhost:8080");
  console.log("   WS: ws://localhost:8081");
  console.log("   Symbols: ³ ++ -- ∆ ∆⁹\n");
});
EOF

# Phase 9 modules
mkdir -p "$PHASE9/modules"

cat <<'EOF' > "$PHASE9/modules/system_dynamics.js"
// ³ 3D Vector Engine
export function createVector3D(theta, phi, force = 1.0) {
  const x = force * Math.cos(theta) * Math.sin(phi);
  const y = force * Math.sin(theta) * Math.sin(phi);
  const z = force * Math.cos(phi); // ³ vertical
  return { x, y, z, magnitude: force, theta, phi, timestamp: Date.now() };
}

export function scaleVector(v, scalar) {
  return createVector3D(v.theta, v.phi, v.magnitude * scalar);
}

export function magnitude(v) {
  return Math.sqrt(v.x**2 + v.y**2 + v.z**2);
}

export function toArray(v) {
  return [v.x, v.y, v.z];
}
EOF

cat <<'EOF' > "$PHASE9/modules/delta_engine.js"
// ∆/∆⁹ 9-Layer Delta Engine
export const DELTA_LAYERS = 9;

export class DeltaEngine {
  constructor() {
    this.layers = [];
    this.learningRate = 0.01;
    this.momentum = 0.9;
  }

  addLayer(name, weight = 1.0) {
    if (this.layers.length >= DELTA_LAYERS) this.layers.shift();
    this.layers.push({ name, weight, value: 0, velocity: 0 });
    return this.layers.length - 1;
  }

  amplify(value, factor = 1.2) {
    return Math.min(1.0, value * factor);
  }

  attenuate(value, factor = 0.8) {
    return value * factor;
  }

  propagate(target, input) {
    let current = input;
    const deltas = [];
    for (const layer of this.layers) {
      const error = target - current;
      const gradient = error * layer.weight;
      layer.velocity = this.momentum * layer.velocity + gradient * this.learningRate;
      layer.value = current + layer.velocity;
      current = layer.value;
      deltas.push({ layer: layer.name, delta: gradient });
    }
    return { output: current, deltas, error: target - current, layers: this.layers.length };
  }

  getState() {
    return { layers: this.layers.map((l, i) => ({ i, ...l })), count: this.layers.length };
  }
}
EOF

# =============================================================================
# 4. DOCKER SETUP
# =============================================================================
log "Creating Docker configuration..."

cat <<'EOF' > "$DOCKER/Dockerfile"
FROM node:18-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000 8080 8081

CMD ["node", "server.js"]
EOF

cat <<'EOF' > "$DOCKER/Dockerfile.phase9"
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 8080 8081

CMD ["node", "server.js"]
EOF

cat <<'EOF' > "$DOCKER/docker-compose.yml"
version: "3.8"

services:
  lumenis:
    build:
      context: ../lumenis_v7
      dockerfile: ../docker/Dockerfile
    ports:
      - "8080:8080"
    volumes:
      - ../lumenis_v7/data:/app/data
      - ../lumenis_v7/logs:/app/logs
    environment:
      - LUMENIS_PORT=8080
      - NODE_ENV=production
    restart: unless-stopped
    networks:
      - one2lv-net

  api:
    build:
      context: ../one2lv_api
      dockerfile: ../docker/Dockerfile
    ports:
      - "3000:3000"
    volumes:
      - ../one2lv_api/logs:/app/logs
    environment:
      - API_PORT=3000
      - JWT_SECRET=${JWT_SECRET:-one2lv_delta_secret_2024}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD:-one2lvOS2024}
    restart: unless-stopped
    networks:
      - one2lv-net

  phase9:
    build:
      context: ../one2lv_phase9
      dockerfile: ../docker/Dockerfile.phase9
    ports:
      - "8081:8081"
      - "8080:8080"
    restart: unless-stopped
    networks:
      - one2lv-net

networks:
  one2lv-net:
    driver: bridge
EOF

cat <<'EOF' > "$DOCKER/.env.example"
JWT_SECRET=one2lv_delta_secret_2024
ADMIN_PASSWORD=one2lvOS2024
API_PORT=3000
LUMENIS_PORT=8080
PHASE9_PORT=8081
EOF

cat <<'EOF' > "$DOCKER/README.md"
# One2lvOS Docker Setup

## Quick Start

```bash
cd docker
cp .env.example .env
docker-compose up -d
```

## Services

- **Lumenis v7**: http://localhost:8080
- **Secure API**: http://localhost:3000
- **Phase 9**: http://localhost:8080 (WS: 8081)

## Commands

```bash
docker-compose up -d      # Start all services
docker-compose logs -f     # View logs
docker-compose restart     # Restart
docker-compose down        # Stop
```
EOF

# =============================================================================
# 5. APK BUILDER (Termux)
# =============================================================================
log "Preparing Termux APK builder..."

cat <<'EOF' > "$ROOT/build-apk.sh"
#!/data/data/com.termux/files/usr/bin/bash
# Termux APK Builder Script

echo "Building Termux APK..."

cd ~

# Create boot script
cat <<'SCRIPT' > .termux/boot/one2lvos.sh
#!/data/data/com.termux/files/usr/bin/bash
echo "Starting One2lvOS..."
cd ~/one2lvos
./start-all.sh &
SCRIPT

chmod +x .termux/boot/one2lvos.sh

# Create autostart script
cat <<'SCRIPT' > ~/one2lvos/start-all.sh
#!/data/data/com.termux/files/usr/bin/bash
ROOT="$HOME/one2lvos"
echo "Starting One2lvOS services..."

# Start all services
nohup node "$ROOT/lumenis_v7/server.js" > "$ROOT/logs/lumenis.log" 2>&1 &
nohup node "$ROOT/one2lv_api/server.js" > "$ROOT/logs/api.log" 2>&1 &
nohup node "$ROOT/one2lv_phase9/server.js" > "$ROOT/logs/phase9.log" 2>&1 &

echo "All services started!"
echo "Lumenis: http://localhost:8080"
echo "API: http://localhost:3000"
echo "Phase9: http://localhost:8080"
SCRIPT

chmod +x ~/one2lvos/start-all.sh

echo "APK builder ready. Use Termux Boot app to auto-start."
EOF

# =============================================================================
# 6. AUTO-LAUNCH SYSTEM
# =============================================================================
log "Creating auto-launch system..."

cat <<'EOF' > "$ROOT/start-all.sh"
#!/data/data/com.termux/files/usr/bin/bash
# One2lvOS Full System Launcher (No Safe Mode)

ROOT="$HOME/one2lvos"
mkdir -p "$ROOT/logs"

echo ""
echo "🌌 One2lvOS Phase 9 - Full Mode Boot"
echo "   Lumenis v7 + Secure API + Delta Engine"
echo ""

# Start all services in FULL mode
echo "[1/3] Starting Lumenis v7..."
nohup node "$ROOT/lumenis_v7/server.js" > "$ROOT/logs/lumenis.log" 2>&1 &
LUMENIS_PID=$!
sleep 1

echo "[2/3] Starting Secure API..."
nohup node "$ROOT/one2lv_api/server.js" > "$ROOT/logs/api.log" 2>&1 &
API_PID=$!
sleep 1

echo "[3/3] Starting Phase 9 Delta Engine..."
nohup node "$ROOT/one2lv_phase9/server.js" > "$ROOT/logs/phase9.log" 2>&1 &
PHASE9_PID=$!

sleep 2

# Save PIDs
echo "$LUMENIS_PID" > "$ROOT/logs/lumenis.pid"
echo "$API_PID" > "$ROOT/logs/api.pid"
echo "$PHASE9_PID" > "$ROOT/logs/phase9.pid"

echo ""
echo "✅ One2lvOS Full Mode Online!"
echo ""
echo "   🌷 Lumenis v7:   http://localhost:8080"
echo "   🔐 Secure API:    http://localhost:3000"
echo "   🌌 Phase 9 Delta: http://localhost:8080"
echo "   🔌 WebSocket:     ws://localhost:8081"
echo ""
echo "   PIDs: L=$LUMENIS_PID A=$API_PID P=$PHASE9_PID"
echo ""
echo "   Logs: $ROOT/logs/"
echo ""

# Start Docker if available
if command -v docker &> /dev/null; then
    echo "[DOCKER] Starting Docker containers..."
    cd "$ROOT/docker"
    docker-compose up -d 2>/dev/null || true
fi

echo "Boot complete. System running in FULL mode."
EOF

chmod +x "$ROOT/start-all.sh"

cat <<'EOF' > "$ROOT/stop-all.sh"
#!/data/data/com.termux/files/usr/bin/bash
ROOT="$HOME/one2lvos"
echo "Stopping One2lvOS..."
pkill -f "node.*lumenis" 2>/dev/null
pkill -f "node.*one2lv_api" 2>/dev/null
pkill -f "node.*phase9" 2>/dev/null
cd "$ROOT/docker" 2>/dev/null && docker-compose down 2>/dev/null || true
echo "All services stopped."
EOF

chmod +x "$ROOT/stop-all.sh"

# =============================================================================
# 7. INSTALL DEPENDENCIES
# =============================================================================
log "Installing npm dependencies..."

cd "$LUMENIS" && npm install 2>&1 | tail -5
cd "$API" && npm install 2>&1 | tail -5
cd "$PHASE9" && npm install 2>&1 | tail -5

# =============================================================================
# 8. LAUNCH
# =============================================================================
echo ""
info "Installation complete!"

read -p "Launch One2lvOS now? [Y/n]: " LAUNCH
LAUNCH="${LAUNCH:-Y}"

if [[ "${LAUNCH^^}" == "Y" ]]; then
    echo ""
    log "Launching in FULL mode..."
    cd "$ROOT"
    bash start-all.sh
else
    echo ""
    info "Run 'bash $ROOT/start-all.sh' to launch manually."
fi

echo ""
log "One2lvOS setup complete!"
echo ""

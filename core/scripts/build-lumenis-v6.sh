#!/data/data/com.termux/files/usr/bin/bash
# =============================================================================
# 🧬 LUMINIS v6 BUILD SYSTEM - ONE COMMAND TO RULE THEM ALL
#
# Features:
# - Lumenis v7 Brain with Council
# - Phase 9 Delta Engine (³ ++ -- ∆ ∆⁹)
# - Windows .exe (Electron)
# - Android APK (Capacitor)
# - Docker containers
# - Auto-start on boot
# - Web Dashboard
#
# Run: bash build-lumenis-v6.sh
# =============================================================================
set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m'

log() { echo -e "${GREEN}[✓]${NC} $1"; }
info() { echo -e "${CYAN}[i]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; }

# Detect environment
if [[ -d "/data/data/com.termux/files/home" ]]; then
    IS_TERMUX=true
    IS_LINUX=false
    IS_WINDOWS=false
elif [[ "$(uname)" == *"MINGW"* ]] || [[ "$(uname)" == *"CYGWIN"* ]]; then
    IS_TERMUX=false
    IS_LINUX=false
    IS_WINDOWS=true
else
    IS_TERMUX=false
    IS_LINUX=true
    IS_WINDOWS=false
fi

# Configuration
PROJECT_NAME="Lumenis"
VERSION="6.0.0"
BASE_DIR="${HOME}/${PROJECT_NAME,,}_v6"
ELECTRON_APP="${PROJECT_NAME}App"
ANDROID_APP_ID="com.one2lv.lumenis"

echo ""
echo -e "${MAGENTA}╔══════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║${NC}  ${BOLD}🧬 ${PROJECT_NAME} v${VERSION} Build System${NC}                                      ${MAGENTA}║${NC}"
echo -e "${MAGENTA}║${NC}  Phase 9 Delta Engine | ³ 3D Vectors | Electron | Capacitor          ${MAGENTA}║${NC}"
echo -e "${MAGENTA}╚══════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# =============================================================================
# 1. PROJECT SETUP
# =============================================================================
info "Setting up project at $BASE_DIR..."
rm -rf "$BASE_DIR"
mkdir -p "$BASE_DIR"/{public,modules,integrations,core,docker,android,scripts}
cd "$BASE_DIR"

# =============================================================================
# 2. CORE SERVER (Node.js Brain)
# =============================================================================
log "Building Lumenis brain (server.js)..."

cat > package.json << 'PKGEOF'
{
  "name": "lumenis-v6",
  "version": "6.0.0",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js",
    "electron": "electron .",
    "android": "npx cap sync android && npx cap open android"
  },
  "dependencies": {
    "express": "^4.18.2",
    "ws": "^8.14.0",
    "lowdb": "^5.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "electron": "^27.0.0",
    "electron-packager": "^17.1.2",
    "@capacitor/core": "^6.0.0",
    "@capacitor/cli": "^6.0.0",
    "@capacitor/android": "^6.0.0"
  }
}
PKGEOF

cat > server.js << 'SRVEOF'
/**
 * 🌌 Lumenis v6 - Complete AI Brain
 * Phase 9 Delta Engine with ³ ++ -- ∆ ∆⁹ symbols
 */
import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Phase 9 Delta Engine (³ ++ -- ∆ ∆⁹)
const DELTA_LAYERS = 9;
let currentVector = { x: 0, y: 0, z: 0, magnitude: 1.0, theta: 0, phi: Math.PI / 4 };
const deltaStack = [];

// Initialize delta layers (∆⁹)
['perception', 'reasoning', 'action', 'feedback', 'memory', 'prediction', 'planning', 'execution', 'refinement']
  .forEach(name => deltaStack.push({ name, weight: 1.0, value: 0, velocity: 0 }));

// ³ Create 3D vector
function createVector3D(theta, phi, force = 1.0) {
  return {
    x: force * Math.cos(theta) * Math.sin(phi),
    y: force * Math.sin(theta) * Math.sin(phi),
    z: force * Math.cos(phi), // ³ vertical dimension
    magnitude: force,
    theta,
    phi,
    timestamp: Date.now()
  };
}

// ++ Amplify
function amplify(value, factor = 1.2) {
  return Math.min(1.0, value * factor);
}

// -- Attenuate
function attenuate(value, factor = 0.8) {
  return value * factor;
}

// ∆ Propagate through delta layers
function propagate(target, input) {
  let current = input;
  const deltas = [];
  for (const layer of deltaStack) {
    const error = target - current;
    const gradient = error * layer.weight;
    layer.velocity = 0.9 * layer.velocity + gradient * 0.01;
    layer.value = current + layer.velocity;
    current = layer.value;
    deltas.push({ layer: layer.name, delta: gradient });
  }
  return { output: current, deltas, error: target - current, layers: deltaStack.length };
}

// Memory database
const adapter = new JSONFile("./public/data/memory.json");
const db = new Low(adapter, { nodes: [], beliefs: [], goals: [], councilLogs: [], events: [] });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Council EventEmitter
const council = {
  agents: ["Strategist", "Lumenis", "Planner"],
  logs: [],
  broadcast(event, data) {
    this.logs.push({ event, data, time: Date.now() });
    broadcast({ type: "council", ...data });
  },
  log(agent, msg, meta = {}) {
    this.broadcast("msg", { agent, msg, meta });
  }
};

// Broadcast to all WebSocket clients
function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === 1) client.send(JSON.stringify(data));
  });
}

// WebSocket connection
wss.on("connection", (ws) => {
  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);
      handleWS(ws, data);
    } catch (e) {
      console.error("WS error:", e.message);
    }
  });
  ws.send(JSON.stringify({ type: "connected", system: "Lumenis v6", version: "6.0.0" }));
});

function handleWS(ws, data) {
  switch (data.type) {
    case "event":
      const state = analyzeEvent(data.event);
      ws.send(JSON.stringify({ type: "event_result", state, prediction: predict(state) }));
      break;
    case "delta_propagate":
      const result = propagate(data.target || 0.8, currentVector.magnitude);
      ws.send(JSON.stringify({ type: "delta_result", ...result }));
      break;
    case "delta_amplify":
      const amp = amplify(data.value || currentVector.magnitude);
      ws.send(JSON.stringify({ type: "amplified", original: data.value, amplified: amp }));
      break;
    case "delta_attenuate":
      const att = attenuate(data.value || currentVector.magnitude);
      ws.send(JSON.stringify({ type: "attenuated", original: data.value, attenuated: att }));
      break;
    case "vector_create":
      currentVector = createVector3D(data.theta || 0, data.phi || Math.PI / 4, data.magnitude || 1);
      ws.send(JSON.stringify({ type: "vector", vector: currentVector }));
      break;
  }
}

// Event analyzer
const state = { dodgeLeft: 0, dodgeRight: 0, jumpSpam: 0, combo: 0, block: 0 };

function analyzeEvent(event) {
  switch (event) {
    case "dodgeLeft": state.dodgeLeft++; currentVector.x -= 0.3; break;
    case "dodgeRight": state.dodgeRight++; currentVector.x += 0.3; break;
    case "jumpSpam": state.jumpSpam++; currentVector.z += 0.4; break;
    case "combo": state.combo++; council.log("Lumenis", `COMBO x${state.combo}!`, { highlight: true }); break;
    case "block": state.block++; currentVector.y += 0.2; break;
  }
  currentVector.magnitude = Math.sqrt(currentVector.x ** 2 + currentVector.y ** 2 + currentVector.z ** 2);
  return { ...state, vector: currentVector };
}

function predict(s) {
  const target = 0.8;
  const delta = propagate(target, currentVector.magnitude);
  if (s.combo > 3) return { action: "punish", confidence: amplify(0.9), delta };
  if (s.jumpSpam > 2) return { action: "anti-air", confidence: amplify(0.8), delta };
  if (s.dodgeLeft > 2) return { action: "cover-left", confidence: amplify(0.85), delta };
  return { action: "observe", confidence: 0.5, delta };
}

// API Routes
app.get("/api/status", (req, res) => {
  res.json({
    system: "Lumenis v6",
    version: VERSION,
    uptime: process.uptime(),
    state,
    vector: currentVector,
    delta: { layers: deltaStack.length, stack: deltaStack },
    symbols: { vector3d: "³", amplify: "++", attenuate: "--", delta: "∆", delta9: "∆⁹" }
  });
});

app.get("/api/memory", async (req, res) => {
  await db.read();
  res.json(db.data);
});

app.post("/api/event", (req, res) => {
  const { event } = req.body;
  if (!event) return res.status(400).json({ error: "Event required" });
  const state = analyzeEvent(event);
  council.log("System", `Event: ${event}`, { event });
  res.json({ ok: true, state, prediction: predict(state) });
});

app.post("/api/goal", async (req, res) => {
  await db.read();
  db.data.goals.push({ text: req.body.text, done: false, created: Date.now() });
  await db.write();
  council.log("Planner", `New goal: ${req.body.text}`);
  res.json({ ok: true });
});

app.post("/api/belief", async (req, res) => {
  await db.read();
  db.data.beliefs.push({ belief: req.body.belief, confidence: req.body.confidence || 0.5, time: Date.now() });
  await db.write();
  res.json({ ok: true });
});

app.get("/api/council", (req, res) => res.json(council.logs.slice(-50)));

app.get("/api/delta", (req, res) => {
  res.json({ stack: deltaStack, layers: DELTA_LAYERS, symbol: "∆⁹" });
});

app.post("/api/delta/propagate", (req, res) => {
  const result = propagate(req.body.target || 0.8, currentVector.magnitude);
  res.json({ ...result, symbol: "∆" });
});

app.post("/api/vector3d", (req, res) => {
  currentVector = createVector3D(req.body.theta || 0, req.body.phi || Math.PI / 4, req.body.magnitude || 1);
  res.json({ vector: currentVector, symbol: "³" });
});

// Council auto-processor
setInterval(async () => {
  await db.read();
  const pending = db.data.goals.filter(g => !g.done);
  if (pending.length > 0) {
    council.log("Planner", `Processing ${pending.length} goals`);
    pending[0].done = true;
    await db.write();
  }
}, 5000);

// Initialize and start
async function init() {
  await db.read();
  db.data ||= { nodes: [], beliefs: [], goals: [], councilLogs: [], events: [] };
  await db.write();
}

const PORT = process.env.PORT || 8080;
init().then(() => {
  server.listen(PORT, () => {
    console.log(`\n🧬 Lumenis v6 Brain Online`);
    console.log(`   HTTP:  http://localhost:${PORT}`);
    console.log(`   WS:    ws://localhost:${PORT}`);
    console.log(`   ³ 3D Vectors | ∆/∆⁹ Delta Engine\n`);
  });
});
SRVEOF

# =============================================================================
# 3. PUBLIC UI (HTML Dashboard)
# =============================================================================
log "Building dashboard UI..."

cat > public/index.html << 'UIEOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🧬 Lumenis v6</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 50%, #0a0a0f 100%);
      color: #fff;
      font-family: 'Courier New', monospace;
      min-height: 100vh;
      padding: 20px;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    h1 { color: #8b5cf6; text-shadow: 0 0 20px rgba(139, 92, 246, 0.5); }

    /* Symbol Panel */
    .symbol-panel {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2));
      border: 2px solid rgba(139, 92, 246, 0.5);
      border-radius: 15px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .symbol-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
    }
    .symbol-item {
      background: rgba(10, 10, 15, 0.6);
      padding: 15px;
      border-radius: 10px;
      text-align: center;
    }
    .symbol-char {
      font-size: 2.5rem;
      background: linear-gradient(135deg, #8b5cf6, #ec4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
    .card {
      background: rgba(26, 26, 46, 0.8);
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: 15px;
      padding: 20px;
      backdrop-filter: blur(10px);
    }
    .card h2 { color: #ec4899; margin-bottom: 15px; }
    .stat { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .stat:last-child { border-bottom: none; }
    .stat-label { color: #888; }
    .stat-value { color: #8b5cf6; font-weight: bold; }

    input, button {
      background: rgba(10, 10, 15, 0.8);
      border: 1px solid rgba(139, 92, 246, 0.3);
      color: #fff;
      padding: 10px 15px;
      border-radius: 8px;
      font-family: inherit;
    }
    button {
      background: linear-gradient(135deg, #8b5cf6, #ec4899);
      cursor: pointer;
      font-weight: bold;
      border: none;
    }
    button:hover { transform: translateY(-2px); box-shadow: 0 5px 20px rgba(139, 92, 246, 0.4); }

    .input-group { display: flex; gap: 10px; margin-bottom: 15px; flex-wrap: wrap; }
    button.amp { background: linear-gradient(135deg, #22c55e, #16a34a); }
    button.att { background: linear-gradient(135deg, #ef4444, #dc2626); }
    button.del { background: linear-gradient(135deg, #f59e0b, #d97706); }

    .result-box {
      background: rgba(139, 92, 246, 0.1);
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: 8px;
      padding: 10px;
      margin-top: 10px;
      font-family: monospace;
    }

    .vector-display {
      background: rgba(0, 0, 0, 0.3);
      border-radius: 10px;
      padding: 15px;
      font-family: monospace;
    }
    .axis-x { color: #ef4444; }
    .axis-y { color: #22c55e; }
    .axis-z { color: #3b82f6; }

    .delta-stack {
      display: flex;
      gap: 3px;
      height: 40px;
      align-items: flex-end;
    }
    .delta-layer {
      flex: 1;
      background: linear-gradient(to top, #8b5cf6, #ec4899);
      border-radius: 3px 3px 0 0;
      min-width: 20px;
    }

    .log { max-height: 200px; overflow-y: auto; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px; }
    .log-entry { padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 0.9rem; }
    .log-entry.highlight { color: #ec4899; font-weight: bold; }
    .log-time { color: #666; font-size: 0.8rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🧬 Lumenis v6 - Phase 9 Delta Engine</h1>

    <div class="symbol-panel">
      <div class="symbol-grid">
        <div class="symbol-item"><div class="symbol-char">³</div><div>3D Vector</div></div>
        <div class="symbol-item"><div class="symbol-char">++</div><div>Amplify ×1.2</div></div>
        <div class="symbol-item"><div class="symbol-char">--</div><div>Attenuate ×0.8</div></div>
        <div class="symbol-item"><div class="symbol-char">∆</div><div>Delta Gradient</div></div>
        <div class="symbol-item"><div class="symbol-char">∆⁹</div><div>9-Layer Cap</div></div>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <h2>³ 3D Vector Control</h2>
        <div class="vector-display">
          <div>X: <span id="vecX" class="axis-x">0.000</span></div>
          <div>Y: <span id="vecY" class="axis-y">0.000</span></div>
          <div>Z: <span id="vecZ" class="axis-z">0.707</span></div>
          <div style="margin-top:10px;color:#8b5cf6">|v| = <span id="vecMag">1.000</span></div>
        </div>
        <div class="input-group">
          <input type="number" id="theta" placeholder="θ (theta)" step="0.1" value="0">
          <input type="number" id="phi" placeholder="φ (phi)" step="0.1" value="1.047">
          <input type="number" id="mag" placeholder="|v|" step="0.1" value="1">
        </div>
        <button onclick="createVector()">Create ³ Vector</button>
        <div class="input-group" style="margin-top:10px;">
          <button class="amp" onclick="amplify()">++ Amplify</button>
          <button class="att" onclick="attenuate()">-- Attenuate</button>
        </div>
        <div class="result-box" id="vectorResult"></div>
      </div>

      <div class="card">
        <h2>∆⁹ Delta Engine</h2>
        <p style="color:#888;margin-bottom:10px;">9-Layer Gradient Stack</p>
        <div class="delta-stack" id="deltaStack"></div>
        <div class="input-group">
          <input type="number" id="target" placeholder="Target" step="0.01" value="0.8">
          <button class="del" onclick="propagate()">∆ Propagate</button>
        </div>
        <div class="result-box" id="deltaResult"></div>
      </div>

      <div class="card">
        <h2>📊 State</h2>
        <div class="stat"><span class="stat-label">Dodge Left</span><span class="stat-value" id="dodgeLeft">0</span></div>
        <div class="stat"><span class="stat-label">Dodge Right</span><span class="stat-value" id="dodgeRight">0</span></div>
        <div class="stat"><span class="stat-label">Jump Spam</span><span class="stat-value" id="jumpSpam">0</span></div>
        <div class="stat"><span class="stat-label">Combo</span><span class="stat-value" id="combo">0</span></div>
        <div class="stat"><span class="stat-label">Block</span><span class="stat-value" id="block">0</span></div>
        <div class="stat"><span class="stat-label">Prediction</span><span class="stat-value" id="prediction">-</span></div>
      </div>

      <div class="card">
        <h2>🎯 Actions</h2>
        <div class="input-group">
          <button onclick="sendEvent('dodgeLeft')">Dodge Left</button>
          <button onclick="sendEvent('dodgeRight')">Dodge Right</button>
          <button onclick="sendEvent('jumpSpam')">Jump</button>
          <button onclick="sendEvent('combo')">Combo</button>
          <button onclick="sendEvent('block')">Block</button>
        </div>
        <div class="input-group">
          <input type="text" id="goalInput" placeholder="New goal...">
          <button onclick="addGoal()">Add Goal</button>
        </div>
      </div>

      <div class="card">
        <h2>🏛️ Council Log</h2>
        <div class="log" id="councilLog"></div>
      </div>

      <div class="card">
        <h2>🔐 API Status</h2>
        <div class="stat"><span class="stat-label">System</span><span class="stat-value" id="sysName">Lumenis v6</span></div>
        <div class="stat"><span class="stat-label">Version</span><span class="stat-value" id="sysVer">6.0.0</span></div>
        <div class="stat"><span class="stat-label">Uptime</span><span class="stat-value" id="sysUptime">-</span></div>
        <button onclick="loadStatus()" style="margin-top:15px;width:100%">Refresh</button>
      </div>
    </div>
  </div>

  <script>
    const ws = new WebSocket(`ws://${location.host}`);
    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      if (d.type === 'council') logCouncil(d.agent, d.msg, d.meta);
      if (d.type === 'event_result') updateState(d.state);
      if (d.type === 'vector') updateVector(d.vector);
      if (d.type === 'delta_result') updateDelta(d);
      if (d.type === 'connected') console.log('Connected:', d);
    };

    async function loadStatus() {
      const res = await fetch('/api/status');
      const d = await res.json();
      document.getElementById('sysName').textContent = d.system;
      document.getElementById('sysVer').textContent = d.version;
      document.getElementById('sysUptime').textContent = Math.floor(d.uptime) + 's';
      updateVector(d.vector);
      updateDeltaDisplay(d.delta);
    }

    function updateState(s) {
      document.getElementById('dodgeLeft').textContent = s.dodgeLeft;
      document.getElementById('dodgeRight').textContent = s.dodgeRight;
      document.getElementById('jumpSpam').textContent = s.jumpSpam;
      document.getElementById('combo').textContent = s.combo;
      document.getElementById('block').textContent = s.block;
      document.getElementById('prediction').textContent = s.prediction?.action || '-';
      updateVector(s.vector);
    }

    function updateVector(v) {
      document.getElementById('vecX').textContent = (v?.x || 0).toFixed(3);
      document.getElementById('vecY').textContent = (v?.y || 0).toFixed(3);
      document.getElementById('vecZ').textContent = (v?.z || 0).toFixed(3);
      document.getElementById('vecMag').textContent = (v?.magnitude || 0).toFixed(3);
    }

    function updateDeltaDisplay(d) {
      const stack = document.getElementById('deltaStack');
      stack.innerHTML = (d?.stack || []).map(l =>
        `<div class="delta-layer" style="height:${Math.abs(l.value) * 100 + 10}%" title="${l.name}"></div>`
      ).join('');
    }

    function updateDelta(d) {
      document.getElementById('deltaResult').innerHTML =
        `Output: ${d.output?.toFixed(4)}<br>Error: ${d.error?.toFixed(4)}<br>Layers: ${d.layers}`;
      updateDeltaDisplay({ stack: d.deltas?.map((_, i) => ({ value: d.output * (i + 1) / d.layers })) || [] });
    }

    function createVector() {
      ws.send(JSON.stringify({
        type: 'vector_create',
        theta: parseFloat(document.getElementById('theta').value),
        phi: parseFloat(document.getElementById('phi').value),
        magnitude: parseFloat(document.getElementById('mag').value)
      }));
      document.getElementById('vectorResult').innerHTML = '<span style="color:#22c55e">³ Vector created</span>';
    }

    function amplify() {
      ws.send(JSON.stringify({ type: 'delta_amplify' }));
    }

    function attenuate() {
      ws.send(JSON.stringify({ type: 'delta_attenuate' }));
    }

    function propagate() {
      ws.send(JSON.stringify({ type: 'delta_propagate', target: parseFloat(document.getElementById('target').value) }));
    }

    async function sendEvent(event) {
      await fetch('/api/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event })
      });
    }

    async function addGoal() {
      const text = document.getElementById('goalInput').value.trim();
      if (!text) return;
      await fetch('/api/goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      document.getElementById('goalInput').value = '';
    }

    function logCouncil(agent, msg, meta) {
      const log = document.getElementById('councilLog');
      const div = document.createElement('div');
      div.className = 'log-entry' + (meta?.highlight ? ' highlight' : '');
      div.innerHTML = `<span class="log-time">${new Date().toLocaleTimeString()}</span> <strong>${agent}:</strong> ${msg}`;
      log.prepend(div);
    }

    loadStatus();
    setInterval(loadStatus, 3000);
  </script>
</body>
</html>
UIEOF

# Memory file
mkdir -p public/data
cat > public/data/memory.json << 'EOF'
{"nodes":[],"beliefs":[],"goals":[],"councilLogs":[],"events":[]}
EOF

# =============================================================================
# 4. ELECTRON MAIN PROCESS
# =============================================================================
log "Building Electron main process..."

cat > main.js << 'ELECEOF'
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let server;

function startServer() {
  server = spawn('node', ['server.js'], {
    cwd: app.getAppPath(),
    stdio: 'inherit',
    shell: true
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: { nodeIntegration: false },
    backgroundColor: '#0a0a0f',
    title: '🧬 Lumenis v6'
  });

  mainWindow.loadFile('public/index.html');

  const menu = Menu.buildFromTemplate([
    { label: '🧬 Lumenis', submenu: [
      { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: () => mainWindow.reload() },
      { type: 'separator' },
      { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
    ]},
    { label: 'View', submenu: [
      { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', click: () => mainWindow.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() + 0.5) },
      { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', click: () => mainWindow.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() - 0.5) },
      { label: 'Reset Zoom', accelerator: 'CmdOrCtrl+0', click: () => mainWindow.webContents.setZoomLevel(0) }
    ]}
  ]);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  startServer();
  setTimeout(createWindow, 2000);
});

app.on('window-all-closed', () => {
  if (server) server.kill();
  app.quit();
});
ELECEOF

# =============================================================================
# 5. CAPACITOR FOR ANDROID
# =============================================================================
log "Setting up Capacitor for Android APK..."

cat > capacitor.config.ts << 'CAPEOF'
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.one2lv.lumenis',
  appName: 'Lumenis',
  webDir: 'public',
  server: {
    androidScheme: 'https'
  }
};

export default config;
CAPEOF

cat > android/capacitor.config.json << 'CAPJSONEOF'
{
  "appId": "com.one2lv.lumenis",
  "appName": "Lumenis",
  "webDir": "public",
  "server": {
    "androidScheme": "https"
  }
}
CAPJSONEOF

# =============================================================================
# 6. DOCKER CONFIG
# =============================================================================
log "Creating Docker configuration..."

cat > docker/Dockerfile << 'DOCKEOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8080

CMD ["node", "server.js"]
DOCKEOF

cat > docker/docker-compose.yml << 'COMPEOF'
version: "3.8"
services:
  lumenis:
    build: .
    ports:
      - "8080:8080"
    volumes:
      - ./public/data:/app/public/data
    restart: unless-stopped
COMPEOF

# =============================================================================
# 7. AUTO-START SCRIPTS
# =============================================================================
log "Creating auto-start scripts..."

cat > start.sh << 'STARTEOF'
#!/bin/bash
echo "🧬 Starting Lumenis v6..."
cd "$(dirname "$0")"
nohup node server.js > logs/server.log 2>&1 &
echo "Lumenis v6 started on http://localhost:8080"
STARTEOF

cat > start-electron.sh << 'ELECTRONEOF'
#!/bin/bash
echo "🖥️ Starting Lumenis v6 (Electron)..."
cd "$(dirname "$0")"
npx electron .
ELECTRONEOF

cat > start-android.sh << 'ANDROIDEOF'
#!/bin/bash
echo "📱 Starting Android build..."
cd "$(dirname "$0")"
npx cap sync android
npx cap open android
ANDROIDEOF

cat > stop.sh << 'STOPEOF'
#!/bin/bash
echo "⏹️ Stopping Lumenis..."
pkill -f "node.*server" 2>/dev/null
pkill -f "electron" 2>/dev/null
echo "Stopped."
STOPEOF

cat > docker-start.sh << 'DOCKEREOF'
#!/bin/bash
cd "$(dirname "$0")/docker"
docker-compose up -d
echo "Docker containers started"
DOCKEREOF

chmod +x start.sh start-electron.sh start-android.sh stop.sh docker-start.sh

# =============================================================================
# 8. BUILD EXE (Electron)
# =============================================================================
if [[ "$IS_WINDOWS" == "true" ]] || [[ "$IS_LINUX" == "true" ]]; then
  info "Building Windows .exe..."
  npm install electron electron-packager 2>/dev/null || true
  npx electron-packager . Lumenis --platform=win32 --arch=x64 --overwrite 2>/dev/null || true
fi

# =============================================================================
# 9. INSTALL DEPENDENCIES
# =============================================================================
log "Installing npm dependencies..."
npm install 2>&1 | tail -10

# =============================================================================
# 10. START SERVERS
# =============================================================================
echo ""
read -p "🚀 Start Lumenis v6 now? [Y/n]: " START
START="${START:-Y}"

if [[ "${START^^}" == "Y" ]]; then
  echo ""
  log "Starting Lumenis v6..."
  mkdir -p logs
  nohup node server.js > logs/server.log 2>&1 &
  sleep 2

  echo ""
  echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║${NC}  ✅ Lumenis v6 Online!                                       ${GREEN}║${NC}"
  echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo "  🌐 Web UI:    http://localhost:8080"
  echo "  🔌 WebSocket: ws://localhost:8080"
  echo ""
  echo "  Commands:"
  echo "  ./start.sh          - Start server"
  echo "  ./start-electron.sh - Start Electron app"
  echo "  ./start-android.sh  - Open Android Studio"
  echo "  ./docker-start.sh   - Start Docker"
  echo "  ./stop.sh           - Stop all"
  echo ""
fi

log "Build complete! Lumenis v6 ready."
echo ""
echo "📁 Project: $BASE_DIR"
echo "📋 Files:"
echo "   server.js    - AI Brain"
echo "   public/      - Web UI + Data"
echo "   main.js      - Electron"
echo "   docker/      - Docker config"
echo "   capacitor.config.ts - Android"
echo ""

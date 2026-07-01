/**
 * One2lvOS Phase 9 Dashboard UI Server
 * Includes: 3D Vector (³), Amplify (++), Attenuate (--), Delta (∆), Delta9 (∆⁹)
 * WebSocket on port 8081
 */

import express from 'express';
import { WebSocketServer } from 'ws';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG = {
  PORT: process.env.UI_PORT || 8080,
  WS_PORT: 8081,  // Phase 9 WebSocket port
  MEMORY_FILE: process.env.MEMORY_FILE || '/opt/one2lv/memory/memory.json',
  TOKEN_FILE: process.env.TOKEN_FILE || '/opt/one2lv/core/token.key',
  VECTOR_FILE: process.env.VECTOR_FILE || '/opt/one2lv/vector/vectors.json'
};

// Phase 9 imports
import { createVector3D, addVectors, scaleVector, magnitude, toArray } from '../modules/system_dynamics.js';
import { DeltaEngine, DELTA_LAYERS } from '../modules/delta_engine.js';

const app = express();
app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Global Phase 9 state
let currentVector = createVector3D(0, Math.PI / 4, 1.0);
const deltaEngine = new DeltaEngine();

// Initialize delta layers
deltaEngine.addLayer('perception', 1.0);
deltaEngine.addLayer('reasoning', 1.0);
deltaEngine.addLayer('action', 1.0);
deltaEngine.addLayer('feedback', 1.0);
deltaEngine.addLayer('memory', 1.0);
deltaEngine.addLayer('prediction', 1.0);
deltaEngine.addLayer('planning', 1.0);
deltaEngine.addLayer('execution', 1.0);
deltaEngine.addLayer('refinement', 1.0);  // ∆⁹: 9th layer

/**
 * Load memory
 */
function loadMemory() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG.MEMORY_FILE, 'utf8'));
  } catch {
    return { nodes: [], beliefs: [], goals: [] };
  }
}

/**
 * Get token
 */
function getToken() {
  try {
    const token = fs.readFileSync(CONFIG.TOKEN_FILE, 'utf8').trim();
    return token.substring(0, 8) + '...';
  } catch {
    return 'not-set';
  }
}

/**
 * API: Status
 */
app.get('/api/status', (req, res) => {
  const mem = loadMemory();
  res.json({
    status: 'running',
    phase: '9',
    version: '9.0.0',
    uptime: process.uptime(),
    memory: {
      nodes: mem.nodes?.length || 0,
      beliefs: mem.beliefs?.length || 0,
      goals: mem.goals?.length || 0
    },
    token: getToken(),
    vector: {
      current: currentVector,
      symbol: '³'
    },
    delta: {
      layers: DELTA_LAYERS,
      symbol: '∆⁹'
    }
  });
});

/**
 * API: Memory
 */
app.get('/api/memory', (req, res) => {
  res.json(loadMemory());
});

/**
 * API: Inject
 */
app.post('/api/inject', (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text required' });
  }

  const mem = loadMemory();
  mem.nodes = mem.nodes || [];
  mem.nodes.push({
    id: `manual_${Date.now()}`,
    input: text,
    type: 'manual',
    time: Date.now(),
    weight: 1.5
  });

  fs.writeFileSync(CONFIG.MEMORY_FILE, JSON.stringify(mem, null, 2));

  res.json({ ok: true, nodes: mem.nodes.length });
});

/**
 * API: Stats
 */
app.get('/api/stats', (req, res) => {
  const mem = loadMemory();
  res.json({
    totalNodes: mem.nodes?.length || 0,
    beliefs: mem.beliefs?.length || 0,
    goals: mem.goals?.length || 0,
    patterns: mem.patterns?.length || 0,
    links: mem.links?.length || 0,
    vector3d: {
      x: currentVector.x,
      y: currentVector.y,
      z: currentVector.z,
      magnitude: currentVector.magnitude
    },
    deltaStack: {
      layers: deltaEngine.layers.length,
      maxLayers: DELTA_LAYERS,
      state: deltaEngine.getState()
    }
  });
});

/**
 * API: Reset
 */
app.post('/api/reset', (req, res) => {
  const mem = { nodes: [], beliefs: [], goals: [], patterns: [], links: [] };
  fs.writeFileSync(CONFIG.MEMORY_FILE, JSON.stringify(mem, null, 2));
  res.json({ ok: true });
});

// =============================================================================
// Phase 9: 3D Vector API (³)
// =============================================================================

/**
 * API: Create 3D Vector
 * ³ = vertical dimension (z-axis)
 */
app.post('/api/vector3d', (req, res) => {
  const { theta, phi, magnitude } = req.body;

  if (theta === undefined || phi === undefined) {
    return res.status(400).json({ error: 'theta and phi required' });
  }

  currentVector = createVector3D(theta, phi, magnitude || 1.0);

  res.json({
    ok: true,
    vector: currentVector,
    symbol: '³',
    description: '3D vector with x, y, z (z = vertical)'
  });
});

/**
 * API: Get current vector
 */
app.get('/api/vector3d', (req, res) => {
  res.json({
    vector: currentVector,
    array: toArray(currentVector),
    magnitude: magnitude(currentVector),
    symbol: '³'
  });
});

/**
 * API: Scale vector
 */
app.post('/api/vector3d/scale', (req, res) => {
  const { factor } = req.body;

  if (factor === undefined) {
    return res.status(400).json({ error: 'factor required' });
  }

  currentVector = scaleVector(currentVector, factor);

  res.json({
    ok: true,
    vector: currentVector,
    factor
  });
});

// =============================================================================
// Phase 9: Delta Engine API (∆/∆⁹)
// =============================================================================

/**
 * API: Propagate through delta layers (∆)
 */
app.post('/api/delta/propagate', (req, res) => {
  const { target } = req.body;

  if (target === undefined) {
    return res.status(400).json({ error: 'target required' });
  }

  const result = deltaEngine.propagate(target, currentVector.magnitude);

  res.json({
    ok: true,
    ...result,
    symbol: '∆',
    maxLayers: DELTA_LAYERS
  });
});

/**
 * API: Amplify (++)
 */
app.post('/api/delta/amplify', (req, res) => {
  const { factor } = req.body;

  const amplified = deltaEngine.amplify(currentVector.magnitude, factor || 1.2);

  res.json({
    ok: true,
    original: currentVector.magnitude,
    amplified,
    factor: factor || 1.2,
    symbol: '++'
  });
});

/**
 * API: Attenuate (--)
 */
app.post('/api/delta/attenuate', (req, res) => {
  const { factor } = req.body;

  const attenuated = deltaEngine.attenuate(currentVector.magnitude, factor || 0.8);

  res.json({
    ok: true,
    original: currentVector.magnitude,
    attenuated,
    factor: factor || 0.8,
    symbol: '--'
  });
});

/**
 * API: Get delta engine state (∆⁹)
 */
app.get('/api/delta', (req, res) => {
  res.json({
    state: deltaEngine.getState(),
    symbol: '∆⁹',
    maxLayers: DELTA_LAYERS,
    layers: deltaEngine.layers.map((l, i) => ({
      index: i,
      name: l.name,
      value: l.value,
      velocity: l.velocity
    }))
  });
});

/**
 * API: Reset delta engine
 */
app.post('/api/delta/reset', (req, res) => {
  deltaEngine.reset();
  res.json({ ok: true, message: 'Delta engine reset' });
});

/**
 * API: Add delta layer
 */
app.post('/api/delta/layer', (req, res) => {
  const { name, weight } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'name required' });
  }

  const index = deltaEngine.addLayer(name, weight || 1.0);

  res.json({
    ok: true,
    layerIndex: index,
    totalLayers: deltaEngine.layers.length,
    maxLayers: DELTA_LAYERS,
    symbol: '∆⁹'
  });
});

// =============================================================================
// HTML Dashboard (Enhanced Phase 9)
// =============================================================================
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🌌 One2lvOS Phase 9</title>
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
    h1 {
      color: #8b5cf6;
      margin-bottom: 10px;
      text-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
    }
    .phase-badge {
      display: inline-block;
      background: linear-gradient(135deg, #ec4899, #8b5cf6);
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 0.9rem;
      margin-bottom: 20px;
    }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; }
    .card {
      background: rgba(26, 26, 46, 0.8);
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: 15px;
      padding: 20px;
      backdrop-filter: blur(10px);
    }
    .card h2 {
      color: #ec4899;
      margin-bottom: 15px;
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .symbol {
      display: inline-block;
      background: linear-gradient(135deg, #8b5cf6, #ec4899);
      color: #fff;
      padding: 2px 8px;
      border-radius: 5px;
      font-weight: bold;
    }
    .stat { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .stat:last-child { border-bottom: none; }
    .stat-label { color: #888; }
    .stat-value { color: #8b5cf6; font-weight: bold; }
    .input-group { display: flex; gap: 10px; margin-bottom: 15px; flex-wrap: wrap; }
    input, select {
      background: rgba(10, 10, 15, 0.8);
      border: 1px solid rgba(139, 92, 246, 0.3);
      color: #fff;
      padding: 10px 15px;
      border-radius: 8px;
      font-family: inherit;
    }
    input:focus, select:focus {
      outline: none;
      border-color: #8b5cf6;
      box-shadow: 0 0 10px rgba(139, 92, 246, 0.3);
    }
    button {
      background: linear-gradient(135deg, #8b5cf6, #ec4899);
      color: #fff;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-family: inherit;
      font-weight: bold;
      transition: all 0.3s;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 20px rgba(139, 92, 246, 0.4);
    }
    button.amplify { background: linear-gradient(135deg, #22c55e, #16a34a); }
    button.attenuate { background: linear-gradient(135deg, #ef4444, #dc2626); }
    button.delta { background: linear-gradient(135deg, #f59e0b, #d97706); }
    .nodes { max-height: 300px; overflow-y: auto; }
    .node {
      background: rgba(10, 10, 15, 0.6);
      padding: 10px;
      margin-bottom: 8px;
      border-radius: 8px;
      font-size: 0.9rem;
      border-left: 3px solid #8b5cf6;
    }
    .node .time { color: #666; font-size: 0.8rem; }
    .node .text { color: #8b5cf6; margin-top: 5px; }
    .belief { background: rgba(236, 72, 153, 0.1); padding: 8px; margin: 5px 0; border-radius: 8px; border-left: 3px solid #ec4899; }
    .goal { background: rgba(139, 92, 246, 0.1); padding: 8px; margin: 5px 0; border-radius: 8px; border-left: 3px solid #8b5cf6; }
    .status { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
    .dot { width: 12px; height: 12px; border-radius: 50%; background: #22c55e; animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

    /* Phase 9 Symbol Styles */
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
      margin-top: 15px;
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
      background-clip: text;
    }
    .symbol-name { color: #888; font-size: 0.8rem; margin-top: 5px; }

    /* Vector Display */
    .vector-display {
      background: rgba(0, 0, 0, 0.3);
      border-radius: 10px;
      padding: 15px;
      font-family: monospace;
    }
    .vector-axis { display: flex; justify-content: space-between; margin: 5px 0; }
    .axis-x { color: #ef4444; }
    .axis-y { color: #22c55e; }
    .axis-z { color: #3b82f6; }

    /* Delta Stack Visualization */
    .delta-stack {
      display: flex;
      gap: 3px;
      margin: 15px 0;
      height: 40px;
      align-items: flex-end;
    }
    .delta-layer {
      flex: 1;
      background: linear-gradient(to top, #8b5cf6, #ec4899);
      border-radius: 3px 3px 0 0;
      min-width: 20px;
      transition: all 0.3s;
    }
    .delta-layer:hover { transform: scaleY(1.1); }

    .result-box {
      background: rgba(139, 92, 246, 0.1);
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: 8px;
      padding: 10px;
      margin-top: 10px;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🌌 One2lvOS Phase 9</h1>
    <div class="phase-badge">∆⁹ Multi-Agent Delta Engine</div>

    <div class="symbol-panel">
      <h2>Phase 9 Symbols</h2>
      <div class="symbol-grid">
        <div class="symbol-item">
          <div class="symbol-char">³</div>
          <div class="symbol-name">3D Vector (z-axis)</div>
        </div>
        <div class="symbol-item">
          <div class="symbol-char">++</div>
          <div class="symbol-name">Amplify (×1.2)</div>
        </div>
        <div class="symbol-item">
          <div class="symbol-char">--</div>
          <div class="symbol-name">Attenuate (×0.8)</div>
        </div>
        <div class="symbol-item">
          <div class="symbol-char">∆</div>
          <div class="symbol-name">Delta Gradient</div>
        </div>
        <div class="symbol-item">
          <div class="symbol-char">∆⁹</div>
          <div class="symbol-name">9-Layer Cap</div>
        </div>
      </div>
    </div>

    <div class="status">
      <div class="dot"></div>
      <span>Phase 9 Active - WebSocket: :8081</span>
    </div>

    <div class="grid">
      <div class="card">
        <h2><span class="symbol">³</span> 3D Vector Control</h2>
        <div class="vector-display" id="vectorDisplay">
          <div class="vector-axis"><span class="axis-x">X:</span><span id="vecX">0.707</span></div>
          <div class="vector-axis"><span class="axis-y">Y:</span><span id="vecY">0.707</span></div>
          <div class="vector-axis"><span class="axis-z">Z:</span><span id="vecZ">0.707</span></div>
          <div style="margin-top:10px;text-align:center;color:#8b5cf6;">|v| = <span id="vecMag">1.0</span></div>
        </div>
        <div class="input-group" style="margin-top:15px;">
          <input type="number" id="thetaInput" placeholder="θ (theta)" step="0.1" value="0.785">
          <input type="number" id="phiInput" placeholder="φ (phi)" step="0.1" value="1.047">
          <input type="number" id="magInput" placeholder="|v|" step="0.1" value="1.0">
        </div>
        <button onclick="createVector()">Create ³ Vector</button>
        <div class="input-group" style="margin-top:10px;">
          <button class="amplify" onclick="amplify()">++ Amplify</button>
          <button class="attenuate" onclick="attenuate()">-- Attenuate</button>
        </div>
        <div class="result-box" id="vectorResult"></div>
      </div>

      <div class="card">
        <h2><span class="symbol">∆⁹</span> Delta Engine</h2>
        <p style="color:#888;margin-bottom:10px;">9-Layer Gradient Stack</p>
        <div class="delta-stack" id="deltaStack"></div>
        <div class="input-group">
          <input type="number" id="targetInput" placeholder="Target value" step="0.01" value="0.8">
          <button class="delta" onclick="propagate()">∆ Propagate</button>
        </div>
        <button onclick="resetDelta()" style="background:#444;width:100%;margin-top:10px;">Reset ∆ Engine</button>
        <div class="result-box" id="deltaResult"></div>
      </div>

      <div class="card">
        <h2>📊 Statistics</h2>
        <div class="stat"><span class="stat-label">Nodes</span><span class="stat-value" id="nodes">0</span></div>
        <div class="stat"><span class="stat-label">Beliefs</span><span class="stat-value" id="beliefs">0</span></div>
        <div class="stat"><span class="stat-label">Goals</span><span class="stat-value" id="goals">0</span></div>
        <div class="stat"><span class="stat-label">Delta Layers</span><span class="stat-value" id="deltaLayers">9</span></div>
        <div class="stat"><span class="stat-label">Token</span><span class="stat-value" id="token">...</span></div>
      </div>

      <div class="card">
        <h2>💉 Inject Memory</h2>
        <div class="input-group">
          <input type="text" id="injectInput" placeholder="Enter memory...">
          <button onclick="inject()">Inject</button>
        </div>
        <button onclick="reset()" style="background:#ef4444;width:100%">Reset Memory</button>
      </div>

      <div class="card">
        <h2>🎯 Goals</h2>
        <div id="goalsList"></div>
      </div>

      <div class="card">
        <h2>🧠 Beliefs</h2>
        <div id="beliefsList"></div>
      </div>
    </div>

    <div class="card" style="margin-top:20px;">
      <h2>📝 Recent Nodes</h2>
      <div class="nodes" id="nodesList"></div>
    </div>
  </div>

  <script>
    // WebSocket connection for real-time updates
    const ws = new WebSocket('ws://localhost:8081');

    ws.onopen = () => console.log('[WS] Connected to Phase 9');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('[WS]', data);
    };

    async function load() {
      const res = await fetch('/api/memory');
      const mem = await res.json();

      document.getElementById('nodes').textContent = mem.nodes?.length || 0;
      document.getElementById('beliefs').textContent = mem.beliefs?.length || 0;
      document.getElementById('goals').textContent = mem.goals?.length || 0;

      // Goals
      const goalsList = document.getElementById('goalsList');
      goalsList.innerHTML = (mem.goals || []).slice(-5).map(g =>
        '<div class="goal">' + g.goal + ' (' + g.priority + ')</div>'
      ).join('') || '<p style="color:#666">No goals yet</p>';

      // Beliefs
      const beliefsList = document.getElementById('beliefsList');
      beliefsList.innerHTML = (mem.beliefs || []).slice(-5).map(b =>
        '<div class="belief">' + b.belief + ' (' + b.confidence + ')</div>'
      ).join('') || '<p style="color:#666">No beliefs yet</p>';

      // Nodes
      const nodesList = document.getElementById('nodesList');
      nodesList.innerHTML = (mem.nodes || []).slice(-10).reverse().map(n =>
        '<div class="node"><div class="time">' + new Date(n.time).toLocaleString() + '</div><div class="text">' + (n.input || n.chosen || JSON.stringify(n)) + '</div></div>'
      ).join('');

      // Load vector
      const vecRes = await fetch('/api/vector3d');
      const vecData = await vecRes.json();
      updateVectorDisplay(vecData);

      // Load delta
      const deltaRes = await fetch('/api/delta');
      const deltaData = await deltaRes.json();
      updateDeltaDisplay(deltaData);
    }

    function updateVectorDisplay(data) {
      document.getElementById('vecX').textContent = (data.vector?.x || 0).toFixed(3);
      document.getElementById('vecY').textContent = (data.vector?.y || 0).toFixed(3);
      document.getElementById('vecZ').textContent = (data.vector?.z || 0).toFixed(3);
      document.getElementById('vecMag').textContent = (data.magnitude || 0).toFixed(3);
    }

    function updateDeltaDisplay(data) {
      document.getElementById('deltaLayers').textContent = data.state?.layers || 0;

      // Update delta stack visualization
      const stack = document.getElementById('deltaStack');
      const layers = data.layers || [];
      stack.innerHTML = layers.map((l, i) =>
        '<div class="delta-layer" style="height:' + (Math.abs(l.value) * 100 + 10) + '%" title="' + l.name + ': ' + l.value.toFixed(3) + '"></div>'
      ).join('');
    }

    async function createVector() {
      const theta = parseFloat(document.getElementById('thetaInput').value);
      const phi = parseFloat(document.getElementById('phiInput').value);
      const mag = parseFloat(document.getElementById('magInput').value);

      const res = await fetch('/api/vector3d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theta, phi, magnitude: mag })
      });
      const data = await res.json();

      updateVectorDisplay({ vector: data.vector, magnitude: data.vector.magnitude });
      document.getElementById('vectorResult').innerHTML =
        '<span style="color:#22c55e">³ Vector created:</span> |v| = ' + data.vector.magnitude.toFixed(3);
    }

    async function amplify() {
      const res = await fetch('/api/delta/amplify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();

      document.getElementById('vectorResult').innerHTML =
        '<span style="color:#22c55e">++ Amplified:</span> ' + data.original.toFixed(3) + ' → ' + data.amplified.toFixed(3);

      // Update vector display
      const vecRes = await fetch('/api/vector3d');
      const vecData = await vecRes.json();
      updateVectorDisplay(vecData);
    }

    async function attenuate() {
      const res = await fetch('/api/delta/attenuate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();

      document.getElementById('vectorResult').innerHTML =
        '<span style="color:#ef4444">-- Attenuated:</span> ' + data.original.toFixed(3) + ' → ' + data.attenuated.toFixed(3);

      // Update vector display
      const vecRes = await fetch('/api/vector3d');
      const vecData = await vecRes.json();
      updateVectorDisplay(vecData);
    }

    async function propagate() {
      const target = parseFloat(document.getElementById('targetInput').value);

      const res = await fetch('/api/delta/propagate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target })
      });
      const data = await res.json();

      document.getElementById('deltaResult').innerHTML =
        '<span style="color:#f59e0b">∆ Propagated:</span> output = ' + data.output.toFixed(4) +
        '<br>Error: ' + data.error.toFixed(4) +
        '<br>Layers: ' + data.layers;

      // Refresh delta display
      const deltaRes = await fetch('/api/delta');
      const deltaData = await deltaRes.json();
      updateDeltaDisplay(deltaData);
    }

    async function resetDelta() {
      await fetch('/api/delta/reset', { method: 'POST' });
      document.getElementById('deltaResult').innerHTML = '<span style="color:#888">∆ Engine reset</span>';

      const deltaRes = await fetch('/api/delta');
      const deltaData = await deltaRes.json();
      updateDeltaDisplay(deltaData);
    }

    async function inject() {
      const input = document.getElementById('injectInput');
      const text = input.value.trim();
      if (!text) return;

      await fetch('/api/inject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      input.value = '';
      load();
    }

    async function reset() {
      if (confirm('Reset all memory?')) {
        await fetch('/api/reset', { method: 'POST' });
        load();
      }
    }

    // Initialize
    load();
    setInterval(load, 3000);
  </script>
</body>
</html>
  `);
});

// Start HTTP server
const server = app.listen(CONFIG.PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🌌 One2lvOS Phase 9 Dashboard v9.0.0                   ║
║   ∆⁹ 9-Layer Delta Engine | ³ 3D Vectors                  ║
║                                                           ║
║   🌐 HTTP: http://localhost:${CONFIG.PORT}                            ║
║   🌐 WebSocket: ws://localhost:${CONFIG.WS_PORT}                         ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// WebSocket Server on port 8081
const wss = new WebSocketServer({ port: CONFIG.WS_PORT });

wss.on('connection', (ws) => {
  console.log('[WS:8081] Client connected');

  // Send initial Phase 9 state
  ws.send(JSON.stringify({
    type: 'phase9_status',
    phase: 9,
    vector: currentVector,
    deltaState: deltaEngine.getState(),
    symbols: {
      vector3d: '³',
      amplify: '++',
      attenuate: '--',
      delta: '∆',
      delta9: '∆⁹'
    }
  }));

  // Handle messages
  ws.on('message', (message) => {
    try {
      const msg = JSON.parse(message);

      switch (msg.action) {
        case 'vector3d_create':
          currentVector = createVector3D(msg.theta, msg.phi, msg.magnitude);
          ws.send(JSON.stringify({ type: 'vector_created', vector: currentVector }));
          break;

        case 'amplify':
          const amplified = deltaEngine.amplify(currentVector.magnitude, msg.factor);
          currentVector = scaleVector(currentVector, amplified / currentVector.magnitude);
          ws.send(JSON.stringify({ type: 'amplified', value: amplified, vector: currentVector }));
          break;

        case 'attenuate':
          const attenuated = deltaEngine.attenuate(currentVector.magnitude, msg.factor);
          currentVector = scaleVector(currentVector, attenuated / currentVector.magnitude);
          ws.send(JSON.stringify({ type: 'attenuated', value: attenuated, vector: currentVector }));
          break;

        case 'propagate':
          const result = deltaEngine.propagate(msg.target, currentVector.magnitude);
          ws.send(JSON.stringify({ type: 'propagated', ...result }));
          break;

        case 'get_state':
          ws.send(JSON.stringify({
            type: 'state',
            vector: currentVector,
            delta: deltaEngine.getState()
          }));
          break;

        default:
          ws.send(JSON.stringify({ type: 'error', message: 'Unknown action' }));
      }
    } catch (e) {
      ws.send(JSON.stringify({ type: 'error', message: e.message }));
    }
  });

  // Keep alive
  ws.on('pong', () => {
    ws.isAlive = true;
  });
});

// Broadcast to all clients
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();

    ws.send(JSON.stringify({
      type: 'heartbeat',
      vector: currentVector,
      delta: deltaEngine.getState(),
      uptime: process.uptime()
    }));

    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

export { app, server, wss };
export default { app, server, wss };

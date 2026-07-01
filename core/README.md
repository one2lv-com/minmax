# One2lvOS Phase 9 - Full Autonomous Delta Engine

<p align="center">
  <img src="https://img.shields.io/badge/Phase-9-8B5CF6?style=for-the-badge" alt="Phase 9">
  <img src="https://img.shields.io/badge/Delta-Engine-∆⁹-EC4899?style=for-the-badge" alt="Delta Engine">
  <img src="https://img.shields.io/badge/Vectors-3D-³-22C55E?style=for-the-badge" alt="3D Vectors">
</p>

---

## Phase 9 Symbols

| Symbol | Name | Description | File |
|--------|------|-------------|------|
| **³** | 3D Vector | Vertical dimension (z-axis) in spherical coordinates | `modules/system_dynamics.js` |
| **++** | Amplify | Multiply value by 1.2 (capped at 1.0) | `modules/delta_engine.js` |
| **--** | Attenuate | Multiply value by 0.8 | `modules/delta_engine.js` |
| **∆** | Delta Gradient | 9-layer gradient propagation | `modules/delta_engine.js` |
| **∆⁹** | Delta9 | Layer count cap at 9 layers | `modules/delta_engine.js` |

---

## Overview

**One2lvOS Phase 9** is a full autonomous multi-agent system with:

- 🏛️ **Multi-Agent Council** - 3 agents negotiating consensus
- 🔐 **Sandbox Executor** - Per-agent capability-based permissions
- 🌐 **Secure RPC Mesh** - Token-authenticated inter-node communication
- 🛰️ **Peer Discovery** - UDP broadcast-based node discovery
- 📊 **Vector Database** - Embedding storage and similarity search
- 🧠 **Autonomous Evolution** - Self-modifying memory and beliefs
- **³ 3D Vector Engine** - Spherical coordinates with θ/φ system
- **∆⁹ Delta Engine** - 9-layer gradient descent optimization

---

## Quick Start

```bash
# Extract
unzip one2lv-phase9.zip
cd one2lv-phase9

# Install
sudo ./builder/quick-run.sh install-deps
./builder/quick-run.sh install

# Start
./builder/quick-run.sh start
# or
cd ~/one2lv-os-phase9 && bash launch.sh
```

---

## Architecture

```
one2lv-phase9/opt/one2lv/
├── core/
│   ├── token.js            # Security token management
│   └── capabilities.json    # Per-agent permissions
├── ai/
│   ├── council/
│   │   ├── council.js      # Main council orchestrator
│   │   ├── planner.js       # Plan generator
│   │   └── engine.js        # Negotiation & scoring
│   └── llm/
│       └── llm.js           # LLM integration
├── mesh/
│   ├── rpc.js               # Secure RPC
│   └── discovery.js         # Peer discovery
├── sandbox/
│   └── sandbox.js           # Capability sandbox
├── vector/
│   └── vector.js            # Vector database
├── modules/
│   ├── system_dynamics.js   # ³ 3D Vector Engine
│   └── delta_engine.js      # ∆⁹ 9-Layer Delta Engine
├── memory/                  # Persistent memory
├── ui/
│   └── server.js            # Dashboard (HTTP :8080 + WS :8081)
├── package.json
└── launch.sh
```

---

## Phase 9 Features

### 3D Vector Engine (³)

Create and manipulate 3D vectors using spherical coordinates:

```javascript
import { createVector3D, scaleVector, magnitude } from './modules/system_dynamics.js';

// Create vector with theta, phi, magnitude
const v = createVector3D(theta, phi, magnitude);
// Returns: { x, y, z, magnitude, theta, phi, timestamp }

// Components:
// x = r × cos(θ) × sin(φ)  // horizontal-east
// y = r × sin(θ) × sin(φ)  // horizontal-north
// z = r × cos(φ)           // vertical (³ dimension)
```

### Delta Engine (∆/∆⁹)

9-layer gradient descent engine:

```javascript
import { DeltaEngine, DELTA_LAYERS } from './modules/delta_engine.js';

const engine = new DeltaEngine();

// Add layers (max 9 due to ∆⁹ cap)
engine.addLayer('perception', 1.0);
engine.addLayer('reasoning', 1.0);
// ... up to 9 layers

// Propagate through all layers (∆)
const result = engine.propagate(target, input);

// Amplify (++) - multiply by 1.2, cap at 1.0
const amplified = engine.amplify(value);

// Attenuate (--) - multiply by 0.8
const attenuated = engine.attenuate(value);
```

---

## API Endpoints

### Standard Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/status` | GET | System status |
| `/api/memory` | GET | Full memory |
| `/api/inject` | POST | Inject memory node |
| `/api/stats` | GET | Statistics |
| `/api/reset` | POST | Clear memory |

### Phase 9 Vector Endpoints (³)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/vector3d` | GET | Get current 3D vector |
| `/api/vector3d` | POST | Create new 3D vector |
| `/api/vector3d/scale` | POST | Scale vector |

### Phase 9 Delta Endpoints (∆/∆⁹)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/delta` | GET | Get delta engine state |
| `/api/delta/propagate` | POST | Propagate through layers |
| `/api/delta/amplify` | POST | Apply ++ amplify |
| `/api/delta/attenuate` | POST | Apply -- attenuate |
| `/api/delta/reset` | POST | Reset delta engine |
| `/api/delta/layer` | POST | Add delta layer |

---

## WebSocket Protocol

Connect to `ws://localhost:8081` for real-time Phase 9 updates.

### Client → Server Messages
```javascript
{ "action": "vector3d_create", "theta": 0.785, "phi": 1.047, "magnitude": 1.0 }
{ "action": "amplify", "factor": 1.2 }
{ "action": "attenuate", "factor": 0.8 }
{ "action": "propagate", "target": 0.8 }
{ "action": "get_state" }
```

### Server → Client Messages
```javascript
{ "type": "phase9_status", "vector": {...}, "delta": {...} }
{ "type": "vector_created", "vector": {...} }
{ "type": "amplified", "value": 1.2, "vector": {...} }
{ "type": "propagated", "output": 0.8, "error": 0.0, "layers": 9 }
```

---

## Dashboard

Access at: `http://localhost:8080`

Features:
- Real-time statistics
- Memory injection
- Belief and goal visualization
- 3D Vector visualization (³)
- Delta stack visualization (∆⁹)
- Node history

---

## Configuration

### Environment Variables

```bash
MEMORY_FILE=/opt/one2lv/memory/memory.json
TOKEN_FILE=/opt/one2lv/core/token.key
LLAMA_PATH=/opt/one2lv/llama.cpp/main
MODEL_PATH=/opt/one2lv/llama.cpp/model.gguf
UI_PORT=8080
WS_PORT=8081
```

### Capabilities

Edit `/opt/one2lv/core/capabilities.json`:

```json
{
  "executor": {
    "commands": ["ls", "pwd", "echo", "date"],
    "max_per_minute": 60
  }
}
```

---

## System Requirements

- **RAM:** 1GB minimum
- **Disk:** 5GB minimum
- **Node.js:** 18+
- **Optional:** Docker, llama.cpp

---

## ISO Build

To create a bootable BackBox Gaming ISO with Phase 9:

```bash
cd iso-build
sudo ./build-iso.sh
```

This will:
1. Download BackBox 22.04.1 ISO
2. Extract and modify it
3. Add One2lvOS Phase 9
4. Create boot menu entries
5. Rebuild the ISO

Output: `output/one2lv-phase9-backbox-gaming.iso`

---

<p align="center">
  🌌 Phase 9 - Full Autonomy with Delta Engine 🧠<br>
  ∆⁹ 9-Layer Gradient | ³ 3D Vectors | ++ Amplify | -- Attenuate
</p>

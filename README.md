# One2lvOS Phase 9 - Full Autonomous Delta Engine

![One2lvOS Phase 9](https://img.shields.io/badge/Phase-9-success)
![Delta Engine](https://img.shields.io/badge/Delta-∆⁹-blue)
![3D Vectors](https://img.shields.io/badge/Vectors-³-purple)

**One2lvOS Phase 9** is a full autonomous multi-agent system with ³ 3D Vector Engine and ∆⁹ 9-Layer Delta Engine.

## Phase 9 Symbols

| Symbol | Name | Description | File |
|--------|------|-------------|------|
| ³ | 3D Vector | Vertical dimension (z-axis) in spherical coordinates | `opt/one2lv/modules/system_dynamics.js` |
| ++ | Amplify | Multiply value by 1.2 (capped at 1.0) | `opt/one2lv/modules/delta_engine.js` |
| -- | Attenuate | Multiply value by 0.8 | `opt/one2lv/modules/delta_engine.js` |
| ∆ | Delta Gradient | 9-layer gradient propagation | `opt/one2lv/modules/delta_engine.js` |
| ∆⁹ | Delta9 | Layer count cap at 9 layers | `opt/one2lv/modules/delta_engine.js` |

## Overview

One2lvOS Phase 9 is a full autonomous multi-agent system with:

- Multi-Agent Council with 3 agents negotiating consensus
- Sandbox Executor with per-agent capability-based permissions
- Secure RPC Mesh with token-authenticated inter-node communication
- Peer Discovery with UDP broadcast-based node discovery
- Vector Database for embedding storage and similarity search
- Autonomous Evolution with self-modifying memory and beliefs
- ³ 3D Vector Engine with spherical coordinates (θ/φ system)
- ∆⁹ Delta Engine with 9-layer gradient descent optimization

## Project Structure

```
one2lvos/
├── opt/one2lv/                    # Phase 9 Core System
│   ├── modules/
│   │   ├── system_dynamics.js    # ³ 3D Vector Engine
│   │   └── delta_engine.js       # ∆⁹ 9-Layer Delta Engine
│   ├── ai/council/
│   │   ├── council.js            # Multi-agent council
│   │   ├── planner.js            # Plan generator
│   │   └── engine.js             # Negotiation & scoring
│   ├── mesh/
│   │   ├── rpc.js                # Secure RPC
│   │   └── discovery.js          # Peer discovery
│   ├── sandbox/
│   │   └── sandbox.js            # Capability sandbox
│   ├── vector/
│   │   └── vector.js             # Vector database
│   ├── ui/
│   │   └── server.js             # Dashboard (HTTP :8080 + WS :8081)
│   ├── core/
│   │   ├── token.js              # Security token manager
│   │   └── capabilities.json     # Per-agent permissions
│   ├── launch.sh                 # Launch script
│   └── package.json
├── interplanetary-disk/           # Docker Deployment Stack
│   ├── api/
│   │   ├── server.js             # Secure API (JWT auth)
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── frontend/
│   │   └── index.html            # Control Plane UI
│   ├── sandbox/
│   │   └── Dockerfile            # Alpine sandbox container
│   ├── nginx/
│   │   └── default.conf          # Reverse proxy config
│   ├── docker-compose.yml        # Multi-container orchestration
│   └── setup.sh                  # Auto-deployment script
├── builder/
│   └── quick-run.sh              # Quick install script
├── iso-build/
│   └── build-iso.sh              # BackBox Gaming ISO builder
├── modules/                       # Legacy modules
├── pulse/                         # Agent hub
└── README.md
```

## Quick Start

### Phase 9 Delta Engine (Node.js)

```bash
# Install
sudo ./builder/quick-run.sh install-deps
./builder/quick-run.sh install

# Start Phase 9
./builder/quick-run.sh start
# or
cd ~/one2lv-os-phase9 && bash launch.sh
```

### Interplanetary Disk (Docker)

```bash
cd interplanetary-disk
docker-compose up --build -d

# Default credentials: admin / admin
# NGINX: http://localhost
# API: http://localhost:8080
```

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

## API Endpoints

### Phase 9 Delta Engine API (Port 8080)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/status` | GET | System status |
| `/api/memory` | GET | Full memory |
| `/api/inject` | POST | Inject memory node |
| `/api/stats` | GET | Statistics |
| `/api/reset` | POST | Clear memory |
| `/api/vector3d` | GET/POST | 3D Vector operations |
| `/api/delta` | GET | Delta engine state |
| `/api/delta/propagate` | POST | Propagate through layers |
| `/api/delta/amplify` | POST | Apply ++ amplify |
| `/api/delta/attenuate` | POST | Apply -- attenuate |

### Interplanetary Disk API (Port 8080)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/status` | GET | Node status (public) |
| `/api/login` | POST | JWT authentication |
| `/api/deploy` | POST | Protected deployment trigger |

## WebSocket Protocol

Connect to `ws://localhost:8081` for real-time Phase 9 updates.

### Client → Server Messages

```json
{ "action": "vector3d_create", "theta": 0.785, "phi": 1.047, "magnitude": 1.0 }
{ "action": "amplify", "factor": 1.2 }
{ "action": "attenuate", "factor": 0.8 }
{ "action": "propagate", "target": 0.8 }
{ "action": "get_state" }
```

### Server → Client Messages

```json
{ "type": "phase9_status", "vector": {...}, "delta": {...} }
{ "type": "vector_created", "vector": {...} }
{ "type": "amplified", "value": 1.2, "vector": {...} }
{ "type": "propagated", "output": 0.8, "error": 0.0, "layers": 9 }
```

## Dashboard

- **Phase 9 Dashboard**: `http://localhost:8080`
  - Real-time statistics
  - Memory injection
  - Belief and goal visualization
  - 3D Vector visualization (³)
  - Delta stack visualization (∆⁹)
  - Node history

- **Interplanetary Disk Control Plane**: `http://localhost`
  - JWT Authentication (admin/admin)
  - Deployment triggers
  - System status monitoring

## Configuration

### Environment Variables

```bash
# Phase 9
MEMORY_FILE=/opt/one2lv/memory/memory.json
TOKEN_FILE=/opt/one2lv/core/token.key
UI_PORT=8080
WS_PORT=8081

# Interplanetary Disk
JWT_SECRET=lumenis_0x73_secure_stack_dev
```

### Capabilities

Edit `opt/one2lv/core/capabilities.json`:

```json
{
  "executor": {
    "commands": ["ls", "pwd", "echo", "date"],
    "max_per_minute": 60
  }
}
```

## System Requirements

- RAM: 1GB minimum
- Disk: 5GB minimum
- Node.js: 18+
- Docker (for Interplanetary Disk)
- Optional: Docker, llama.cpp

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

## Components

### Multi-Agent Council

The council coordinates multiple agents to reach consensus:

- **planner.js**: Generates plans based on system state
- **engine.js**: Negotiates between agent proposals
- **council.js**: Orchestrates the multi-agent cycle

### Secure RPC Mesh

Token-authenticated inter-node communication:

- **rpc.js**: Secure request/response with HMAC signatures
- **discovery.js**: UDP broadcast peer discovery

### Sandbox Executor

Capability-based command execution:

- Per-agent command whitelists
- Rate limiting (commands per minute)
- Command sanitization

## License

MIT License - One2lvOS Project

---

**Phase 9 - Full Autonomy with Delta Engine**

∆⁹ 9-Layer Gradient | ³ 3D Vectors | ++ Amplify | -- Attenuate | Interplanetary Disk
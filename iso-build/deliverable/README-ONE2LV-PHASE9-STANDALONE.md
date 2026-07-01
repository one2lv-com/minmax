# One2lvOS Phase 9 - Standalone ISO

## Overview

This is a complete, standalone bootable ISO of One2lvOS Phase 9 featuring:

- **Delta Engine (∆⁹)**: 9-layer gradient descent optimization
- **3D Vector Engine (³)**: Spherical coordinate system
- **Multi-Agent Council**: 3 agents negotiating consensus
- **Lumenis v7.0 Web Desktop**: 3D HUD-based web interface

## Boot Options

1. **Standard Boot**: One2lvOS Phase 9 - Delta Engine
2. **Recovery Mode**: Safe mode with recovery tools
3. **Lumenis Web Desktop**: Launch web-based desktop
4. **Safe Mode**: Minimal hardware detection

## Contents

```
one2lv-phase9-standalone/
├── opt/
│   ├── one2lv/           # Phase 9 Delta Engine
│   └── lumenis/          # Lumenis v7.0 Web Desktop
├── boot/                 # Bootloader configs
├── etc/                  # System configs
└── usr/                  # Applications
```

## Quick Start

### Boot Sequence
1. Burn ISO to USB/DVD
2. Boot from media
3. Select desired boot option

### Using Phase 9 Delta Engine
```bash
cd /opt/one2lv
./launch.sh
```

### Using Lumenis Web Desktop
```bash
/opt/lumenis/launch-lumenis.sh
# Or with kiosk mode:
/opt/lumenis/launch-lumenis.sh --kiosk
```

### Accessing Dashboard
Open browser: http://localhost:8080

## Phase 9 API

### HTTP Endpoints
- `/api/status` - System status
- `/api/memory` - Full memory
- `/api/inject` - Inject memory node
- `/api/stats` - Statistics
- `/api/reset` - Clear memory

### Vector Endpoints (³)
- `/api/vector3d` - Get/Create 3D vectors
- `/api/vector3d/scale` - Scale vector

### Delta Endpoints (∆/∆⁹)
- `/api/delta` - Get delta engine state
- `/api/delta/propagate` - Propagate through layers
- `/api/delta/amplify` - Apply ++ amplify
- `/api/delta/attenuate` - Apply -- attenuate

## WebSocket Protocol

Connect: `ws://localhost:8081`

### Client Messages
```json
{ "action": "vector3d_create", "theta": 0.785, "phi": 1.047, "magnitude": 1.0 }
{ "action": "amplify", "factor": 1.2 }
{ "action": "propagate", "target": 0.8 }
```

### Server Responses
```json
{ "type": "phase9_status", "vector": {...}, "delta": {...} }
{ "type": "vector_created", "vector": {...} }
```

## System Requirements

### Minimum
- CPU: 2 cores x86_64
- RAM: 2 GB
- Disk: 8 GB
- Graphics: OpenGL 2.0

### Recommended
- CPU: 4+ cores
- RAM: 4+ GB
- Disk: 16 GB
- Graphics: OpenGL 3.0+ with WebGL

## Troubleshooting

### Phase 9 won't start
```bash
# Check Node.js
node --version

# Check dependencies
cd /opt/one2lv
npm install

# Manual start
./launch.sh
```

### Lumenis Desktop won't load
```bash
# Install browser
sudo apt-get install firefox

# Manual launch
/opt/lumenis/launch-lumenis.sh
```

### Dashboard unreachable
```bash
# Check service status
systemctl status one2lv-phase9

# Restart service
systemctl restart one2lv-phase9
```

## Copyright

© 2026 One2lv Systems - All Rights Reserved

The Light is One. The Heartbeat is Absolute. ∆⁹³

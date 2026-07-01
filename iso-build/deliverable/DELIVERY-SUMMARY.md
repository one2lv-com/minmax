# One2lvOS Phase 9 - Standalone ISO Build Delivery

## Package Contents

This package contains the complete build artifacts for **One2lvOS Phase 9 Standalone ISO** with integrated Lumenis v7.0 Web Desktop.

### Core Components

| Component | Description | Location |
|-----------|-------------|----------|
| **3D Vector Engine (³)** | Spherical coordinate system with θ/φ | `iso-structure-reference/opt/one2lv/` |
| **Delta Engine (∆⁹)** | 9-layer gradient descent optimization | `iso-structure-reference/opt/one2lv/` |
| **Lumenis v7.0** | Web-based 3D HUD Desktop Environment | `iso-structure-reference/opt/lumenis/` |
| **Multi-Agent Council** | 3-agent consensus system | `iso-structure-reference/opt/one2lv/` |
| **Sandbox Executor** | Capability-based security | `iso-structure-reference/opt/one2lv/` |
| **Secure RPC Mesh** | Token-authenticated P2P | `iso-structure-reference/opt/one2lv/` |

### ISO Structure

The `iso-structure-reference/` directory contains the complete filesystem layout:

```
iso-structure-reference/
├── boot/
│   ├── grub/
│   │   ├── grub.cfg
│   │   └── i386-pc/
├── casper/
├── etc/
│   ├── casper.conf
│   ├── default/
│   ├── init.d/
│   │   ├── lumenis-desktop
│   │   └── one2lv-phase9
│   ├── one2lv-release
│   ├── skel/
│   └── xdg/autostart/
├── home/one2lv/
├── isolinux.cfg
├── one2lv-manifest.txt
├── opt/
│   ├── lumenis/
│   │   ├── index.html
│   │   └── launch-lumenis.sh
│   └── one2lv/
└── usr/
    ├── bin/
    └── share/
        ├── applications/
        └── icons/
```

## Build Information

- **Version:** 9.0.0 (Phase 9)
- **Build Date:** 2026-06-19
- **Base:** BackBox Linux 9 (Ubuntu-based)
- **Build Mode:** Portable (sandbox-safe)
- **Architecture:** amd64 (x86_64)

## Boot Menu Options

1. **One2lvOS Phase 9 - Delta Engine** - Standard boot with full autonomous system
2. **One2lvOS Recovery Mode** - Safe mode with recovery tools
3. **Lumenis Web Desktop** - Direct launch of web-based desktop
4. **Safe Mode** - Minimal hardware detection

## Quick Start (Manual ISO Build)

To complete the ISO build on a system with root access:

```bash
# Install dependencies (Ubuntu/Debian)
sudo apt-get install xorriso squashfs-tools genisoimage

# Run build with root privileges
sudo ./build-standalone-iso.sh
```

The script will:
1. Use the BackBox 9 ISO as a base
2. Copy One2lvOS Phase 9 components
3. Install Lumenis v7.0 desktop
4. Create boot configurations (GRUB + ISOLINUX)
5. Generate bootable ISO: `output/one2lv-phase9-backbox-gaming.iso`

## Phase 9 Symbols Reference

| Symbol | Name | Description |
|--------|------|-------------|
| ³ | 3D Vector | Spherical coordinates (θ, φ, magnitude) |
| ∆ | Delta | Gradient propagation through layers |
| ∆⁹ | Delta9 | Maximum 9 layers cap |
| ++ | Amplify | Multiply by 1.2 (capped at 1.0) |
| -- | Attenuate | Multiply by 0.8 |

## API Endpoints

### Standard
- `GET /api/status` - System status
- `GET /api/memory` - Memory dump
- `POST /api/inject` - Inject memory
- `GET /api/stats` - Statistics

### Phase 9 Vector (³)
- `GET /api/vector3d` - Get current vector
- `POST /api/vector3d` - Create new vector
- `POST /api/vector3d/scale` - Scale vector

### Phase 9 Delta (∆/∆⁹)
- `GET /api/delta` - Engine state
- `POST /api/delta/propagate` - Propagate
- `POST /api/delta/amplify` - Apply ++
- `POST /api/delta/attenuate` - Apply --
- `POST /api/delta/reset` - Reset engine
- `POST /api/delta/layer` - Add layer

## WebSocket Protocol

Connect to `ws://localhost:8081` for real-time Phase 9 updates.

### Client → Server
```json
{ "action": "vector3d_create", "theta": 0.785, "phi": 1.047, "magnitude": 1.0 }
{ "action": "amplify", "factor": 1.2 }
{ "action": "attenuate", "factor": 0.8 }
{ "action": "propagate", "target": 0.8 }
{ "action": "get_state" }
```

### Server → Client
```json
{ "type": "phase9_status", "vector": {...}, "delta": {...} }
{ "type": "vector_created", "vector": {...} }
{ "type": "amplified", "value": 1.2, "vector": {...} }
{ "type": "propagated", "output": 0.8, "error": 0.0, "layers": 9 }
```

## System Requirements

- **RAM:** 1GB minimum
- **Disk:** 5GB minimum
- **Node.js:** 18+
- **Optional:** Docker, llama.cpp

## Repository

Upload target: `github.com/one2lv-com/minmax`

## 🌌 Phase 9 - Full Autonomy with Delta Engine 🧠

∆⁹ 9-Layer Gradient | ³ 3D Vectors | ++ Amplify | -- Attenuate

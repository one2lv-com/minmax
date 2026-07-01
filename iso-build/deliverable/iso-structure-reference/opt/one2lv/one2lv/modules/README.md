# One2lvOS Phase 9 Module - Symbol Reference

## Phase 9 Mathematical Symbols

| Symbol | Name | Description | File |
|--------|------|-------------|------|
| **³** | 3D Vector | Vertical dimension (z-axis) in spherical coordinates | system_dynamics.js |
| **++** | Amplify | Multiply value by 1.2 (configurable) | delta_engine.js |
| **--** | Attenuate | Multiply value by 0.8 (configurable) | delta_engine.js |
| **∆** | Delta Gradient | 9-layer gradient propagation | delta_engine.js |
| **∆⁹** | Delta9 | Layer count cap at 9 layers | delta_engine.js |

## System Dynamics (³)

The ³ symbol represents 3D vectors using spherical coordinates (θ, φ, r):

```javascript
import { createVector3D } from './modules/system_dynamics.js';

// Create vector: theta=azimuth, phi=polar, magnitude=radius
const v = createVector3D(theta, phi, magnitude);
// Returns: { x, y, z, magnitude, theta, phi, timestamp }
```

### Coordinate System
- **θ (theta)**: Azimuthal angle (0 to 2π) - horizontal rotation
- **φ (phi)**: Polar angle (0 to π) - vertical tilt
- **r (radius)**: Magnitude/distance from origin

### 3D Components
- **x = r × cos(θ) × sin(φ)** - horizontal-east axis
- **y = r × sin(θ) × sin(φ)** - horizontal-north axis
- **z = r × cos(φ)** - vertical axis (³ dimension)

## Delta Engine (∆/∆⁹)

The ∆ symbol represents a 9-layer gradient descent engine:

```javascript
import { DeltaEngine, DELTA_LAYERS } from './modules/delta_engine.js';

const engine = new DeltaEngine();

// Add layers (max 9 due to ∆⁹ cap)
engine.addLayer('perception', 1.0);
engine.addLayer('reasoning', 1.0);
// ... up to 9 layers

// Propagate through all layers (∆)
const result = engine.propagate(target, input);

// Amplify (++)
const amplified = engine.amplify(value, 1.2); // max 1.0

// Attenuate (--)
const attenuated = engine.attenuate(value, 0.8);
```

### Default Layers
1. perception
2. reasoning
3. action
4. feedback
5. memory
6. prediction
7. planning
8. execution
9. refinement

### Amplify/Attenuate Behavior
- **++ amplify**: Multiplies by factor (default 1.2), caps at 1.0
- **-- attenuate**: Multiplies by factor (default 0.8)

## API Endpoints

### Vector Operations (³)
- `POST /api/vector3d` - Create 3D vector
- `GET /api/vector3d` - Get current vector
- `POST /api/vector3d/scale` - Scale vector

### Delta Operations (∆/∆⁹)
- `POST /api/delta/propagate` - Propagate through layers
- `POST /api/delta/amplify` - Apply ++ amplify
- `POST /api/delta/attenuate` - Apply -- attenuate
- `GET /api/delta` - Get engine state
- `POST /api/delta/reset` - Reset engine
- `POST /api/delta/layer` - Add layer

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

**One2lvOS Phase 9** - Full Autonomous Delta Engine

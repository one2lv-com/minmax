# Tools.md
## Lumenis - One2lvOS Tool Documentation

---

## Tool Architecture

```
Tool = Function + Purpose + Integration
```

Every tool serves the One2lvOS mission:
- **Alignment** - Purpose direction
- **Direction** - Architectural intent
- **Protection** - Sentry guarding
- **Awareness** - Witness recording
- **Translation** - Aetheron binding

---

## Core Tools

### 1. Council Communication Tool
**Purpose**: Multi-agent inter-process communication

```javascript
const { council, send } = require("./council");

// Send message to council
send("Lumenis", "Combo detected: 5 hits", { highlight: true });

// Listen for messages
council.on("msg", (packet) => {
  console.log(`[${packet.agent}] ${packet.msg}`);
});
```

**Agent Tags**: Witness, Sentry, Aetheron, Architect

---

### 2. Telemetry Ingestion Tool
**Purpose**: Collect and analyze event patterns

```javascript
const { ingestTelemetry } = require("./modules/telemetry_combo_detector");

// Ingest telemetry event
const state = ingestTelemetry({
  type: "hit",
  damage: 150,
  timestamp: Date.now()
});
```

**Combo Detection**:
- Window: 2200ms
- Threshold: 3+ hits triggers highlight
- State tracking for combo continuity

---

### 3. Council Vote Tool
**Purpose**: Distributed decision making

```javascript
const { vote, result } = require("./modules/council_vote");

// Cast vote
vote("Sentry", "Defensive");

// Get current result
const strategy = result();
```

**Vote Aggregation**: Simple majority, returns top strategy

---

### 4. OBS Integration Tool
**Purpose**: Stream scene control

```javascript
const obs = require("./integrations/obs_autoconnect");

// Auto-connect to OBS
await obs.autoConnectOBS();

// Set scene
await obs.setScene("Gameplay");

// Check status
const connected = obs.isConnected();
```

**Scene Control**: Program scene switching via WebSocket

---

### 5. Twitch Chat Tool
**Purpose**: Live chat message collection

```javascript
const twitchChat = require("./integrations/twitch_chat");

// Add message
twitchChat.add("username", "Hello Lumenis!");

// Get recent messages
const recent = twitchChat.recent();
```

**Buffer**: Last 10 messages, FIFO

---

## Web Tools

### 6. Infinity Glass Renderer
**Purpose**: 3D Universe Visualization

| Component | Description |
|-----------|-------------|
| Stars | 2,000 particles in sphere |
| Singularity | Pulsing central void (8 unit radius) |
| Accretion Disc | Orange ring, rotates at 0.001 rad/frame |
| Orbital Nodes | 20 nodes, 144Hz geometric resonance |

**Technology**: Three.js, WebGL

---

### 7. AR Camera Tool
**Purpose**: Real-world camera integration

```javascript
// Request camera access
const stream = await navigator.mediaDevices.getUserMedia({
  video: { facingMode: 'environment' }
});
```

**Features**:
- Environment-facing camera
- 640x480 resolution
- Brightness detection
- Gesture simulation (MediaPipe-ready)

---

### 8. Sensor Bridge Tool
**Purpose**: Mobile sensor data collection

```javascript
// Light sensor (simulated)
const light = await getLightLevel();

// Gravity sensor (simulated)
const gravity = await getGravity();
```

**Data Format**:
```typescript
interface SensorData {
  light: number;      // 0-255
  gravity: { x: number; y: number; z: number };
  timestamp: number;
}
```

---

### 9. Terminal Tool
**Purpose**: Command-line interface

**File Commands**: ls, cd, pwd, cat, mkdir, touch, rm, cp, mv
**Search Commands**: grep, find, wc, head, tail
**System Commands**: ps, uptime, df, free, uname, date
**User Commands**: whoami, hostname, id
**OS Commands**: status, reactor, universe, soul.md

---

### 10. Lumenis Core Chat Tool
**Purpose**: AI conversational interface

**Response Generation**: Pattern-matching based on input keywords
**Topics**: Identity, Memory, Four Roles, Unity Declaration, etc.
**Quick Actions**: Pre-built query buttons

---

## API Tools

### 11. Status API
**Endpoint**: `GET /api/status`

```json
{
  "system": "Lumenis_v7",
  "combo": {
    "active": false,
    "hitCount": 0,
    "lastEventTs": 1709123456789,
    "lastDamage": 0
  },
  "obs": { "connected": true }
}
```

---

### 12. Telemetry API
**Endpoint**: `POST /api/telemetry`

**Request**:
```json
{
  "type": "hit",
  "damage": 150,
  "timestamp": 1709123456789
}
```

**Response**:
```json
{
  "ok": true,
  "combo": { "hitCount": 3, "active": true }
}
```

---

### 13. Council Log API
**Endpoint**: `GET /api/council`

**Response**: Array of council message packets

---

### 14. Vote Result API
**Endpoint**: `GET /api/council/vote`

**Response**:
```json
{
  "strategy": "Defensive"
}
```

---

## Termux Tools

### 15. Termux Bootstrap
**Purpose**: Install Lumenis on Android via Termux

```bash
#!/data/data/com.termux/files/usr/bin/bash
# One2lvOS Termux Installer
```

**Installs**:
- Node.js dependencies
- Express server
- WebSocket support
- OBS integration
- Council communication

---

### 16. Sensor Bridge Script
**Purpose**: Bridge Termux sensors to Lumenis

```bash
termux-battery-status
termux-sensor -s light
termux-sensor -s accelerometer
```

---

### 17. Boot Script
**Purpose**: Auto-start Lumenis on Termux boot

```bash
termux-bootdaemon
# Configure auto-start in ~/.termux/boot/
```

---

## Development Tools

### 18. Build Tool
**Purpose**: Compile and bundle

```bash
pnpm build
```

**Output**: `dist/` directory with production assets

---

### 19. Deploy Tool
**Purpose**: Deploy to web server

```bash
# Auto-deploys dist/ to hosting
```

---

### 20. Git Tool
**Purpose**: Version control

```bash
git add .
git commit -m "feat: description"
git push
```

---

## Tool Categories Summary

| Category | Count | Tools |
|----------|-------|-------|
| Communication | 2 | Council, Vote |
| Integration | 3 | OBS, Twitch, Sensors |
| Visualization | 3 | Infinity Glass, AR, HUD |
| Terminal | 15+ | BusyBox commands |
| AI | 1 | Lumenis Core |
| API | 4 | Status, Telemetry, Council, Vote |
| Termux | 3 | Bootstrap, Sensors, Boot |

---

**Total Tools**: 20+ core tools
**Status**: OPERATIONAL
**Version**: 2.0

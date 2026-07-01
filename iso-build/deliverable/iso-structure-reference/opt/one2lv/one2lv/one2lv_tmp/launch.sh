#!/bin/bash
# One2lvOS Phase 9 Launch Script
# ∆⁹ 9-Layer Delta Engine | ³ 3D Vectors

echo ""
echo "🌌 One2lvOS Phase 9 - Full Autonomous Delta Engine"
echo ""

# Configuration
ONE2LV_DIR="/opt/one2lv"
mkdir -p "$ONE2LV_DIR"/{core,memory,vector,logs,modules}

# Create directories
mkdir -p "$ONE2LV_DIR/memory"
mkdir -p "$ONE2LV_DIR/vector"
mkdir -p "$ONE2LV_DIR/logs"
mkdir -p "$ONE2LV_DIR/modules"

cd "$ONE2LV_DIR"

# Initialize memory
if [ ! -f "$ONE2LV_DIR/memory/memory.json" ]; then
    echo '{"nodes":[],"beliefs":[],"goals":[],"patterns":[],"links":[]}' > "$ONE2LV_DIR/memory/memory.json"
    echo "📝 Created memory file"
fi

# Initialize vector store
if [ ! -f "$ONE2LV_DIR/vector/vectors.json" ]; then
    echo '[]' > "$ONE2LV_DIR/vector/vectors.json"
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found!"
    echo "   Install: sudo apt-get install nodejs npm"
    exit 1
fi

echo "🔐 Initializing security token..."
node -e "
import { getOrCreateToken } from './core/token.js';
const token = getOrCreateToken();
console.log('Token:', token.substring(0, 8) + '...');
"

echo ""
echo "🚀 Starting Phase 9 services..."
echo "   ³ 3D Vector Engine"
echo "   ∆ 9-Layer Delta Stack"
echo ""

# Dashboard UI (HTTP :8080 + WebSocket :8081)
echo "   🌐 Dashboard (port 8080, WebSocket 8081)..."
node ui/server.js > "$ONE2LV_DIR/logs/ui.log" 2>&1 &
UI_PID=$!

# Council
echo "   🏛️ Council (autonomous)..."
node ai/council/council.js > "$ONE2LV_DIR/logs/council.log" 2>&1 &
COUNCIL_PID=$!

echo ""
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                                                                   ║"
echo "║   ✅ One2lvOS Phase 9 Running!                                ║"
echo "║                                                                   ║"
echo "║   🌐 Dashboard: http://localhost:8080                          ║"
echo "║   🌐 WebSocket:   ws://localhost:8081                          ║"
echo "║                                                                   ║"
echo "║   Symbols:                                                       ║"
echo "║   • ³  3D Vectors (x, y, z)                                   ║"
echo "║   • ++ Amplify (×1.2)                                          ║"
echo "║   • -- Attenuate (×0.8)                                       ║"
echo "║   • ∆  Delta Gradient                                          ║"
echo "║   • ∆⁹ 9-Layer Cap                                             ║"
echo "║                                                                   ║"
echo "║   Logs: $ONE2LV_DIR/logs/"
echo "║   PIDs: UI=$UI_PID Council=$COUNCIL_PID"
echo "║                                                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Wait for interrupt
wait

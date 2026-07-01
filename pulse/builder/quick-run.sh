#!/usr/bin/env bash
# =============================================================================
# One2lvOS Phase 9 Quick Run Script
# ∆⁹ 9-Layer Delta Engine | ³ 3D Vectors
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║${NC}   🌌 One2lvOS Phase 9 Quick Install                    ${GREEN}║${NC}"
echo -e "${GREEN}║${NC}   ∆⁹ 9-Layer Delta Engine | ³ 3D Vectors            ${GREEN}║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Detect OS and install deps
install_deps() {
    log "Installing dependencies..."

    if command -v apt-get &> /dev/null; then
        apt-get update 2>/dev/null || sudo apt-get update
        apt-get install -y nodejs npm git 2>/dev/null || sudo apt-get install -y nodejs npm git
    elif command -v pacman &> /dev/null; then
        pacman -S --noconfirm nodejs npm git 2>/dev/null || sudo pacman -S --noconfirm nodejs npm git
    fi

    log "Node.js: $(node --version)"
}

# Install locally
do_install() {
    INSTALL_DIR="${HOME}/one2lv-os-phase9"

    log "Installing to $INSTALL_DIR..."

    if [[ -d "$INSTALL_DIR" ]]; then
        warn "Already installed. Updating..."
        rm -rf "$INSTALL_DIR"
    fi

    mkdir -p "$INSTALL_DIR"

    # Copy files
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    cp -r "$(dirname "$SCRIPT_DIR")/opt" "$INSTALL_DIR/"

    cd "$INSTALL_DIR"

    # Install npm deps
    log "Installing Node.js packages..."
    npm install 2>/dev/null || npm install --legacy-peer-deps 2>/dev/null || true

    # Create directories
    mkdir -p "$INSTALL_DIR/memory" "$INSTALL_DIR/vector" "$INSTALL_DIR/logs" "$INSTALL_DIR/modules"

    # Initialize memory
    if [[ ! -f "$INSTALL_DIR/memory/memory.json" ]]; then
        echo '{"nodes":[],"beliefs":[],"goals":[]}' > "$INSTALL_DIR/memory/memory.json"
    fi

    # Make launch script executable
    chmod +x "$INSTALL_DIR/launch.sh"

    log "Installation complete!"
    log "Run: cd $INSTALL_DIR && bash launch.sh"
}

# Start
do_start() {
    INSTALL_DIR="${HOME}/one2lv-os-phase9"

    if [[ ! -d "$INSTALL_DIR" ]]; then
        log "Not installed. Installing first..."
        do_install
    fi

    cd "$INSTALL_DIR"

    # Export paths
    export MEMORY_FILE="$INSTALL_DIR/memory/memory.json"
    export TOKEN_FILE="$INSTALL_DIR/core/token.key"

    # Create dirs
    mkdir -p "$INSTALL_DIR/memory" "$INSTALL_DIR/vector" "$INSTALL_DIR/logs" "$INSTALL_DIR/modules"

    # Initialize token
    node -e "
    import { getOrCreateToken } from './core/token.js';
    console.log('Token:', getOrCreateToken().substring(0, 16) + '...');
    " 2>/dev/null || true

    log "Starting One2lvOS Phase 9..."
    log "   ³ 3D Vector Engine"
    log "   ∆ 9-Layer Delta Stack"
    log "   WebSocket: :8081"

    # Start UI
    node ui/server.js &
    UI_PID=$!

    sleep 1

    # Start council
    node ai/council/council.js &
    COUNCIL_PID=$!

    echo ""
    log "One2lvOS Phase 9 running!"
    log "Dashboard: http://localhost:8080"
    log "WebSocket: ws://localhost:8081"
    log "PIDs: UI=$UI_PID Council=$COUNCIL_PID"
    echo ""

    wait
}

# Main
case "${1:-install}" in
    install-deps)
        install_deps
        ;;
    install)
        do_install
        ;;
    start)
        do_start
        ;;
    *)
        do_install
        do_start
        ;;
esac

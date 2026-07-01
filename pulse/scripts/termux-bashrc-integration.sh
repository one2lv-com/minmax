#!/data/data/com.termux/files/usr/bin/bash
# =============================================================================
# Termux .bashrc Integration for One2lvOS
# Run this once to integrate One2lvOS into your Termux shell
# =============================================================================

BASHRC="$HOME/.bashrc"

echo ""
echo "🌌 Integrating One2lvOS into Termux..."

# Backup original .bashrc
if [[ ! -f "$HOME/.bashrc.backup" ]]; then
    cp "$HOME/.bashrc" "$HOME/.bashrc.backup"
    echo "✓ Backed up .bashrc"
fi

# Add One2lvOS aliases and functions
cat >> "$HOME/.bashrc" << 'EOF'

# ============================================================
# One2lvOS Phase 9 - Full System Integration
# ============================================================

# Paths
export ONE2LV_ROOT="$HOME/one2lvos"
export PATH="$ONE2LV_ROOT/bin:$PATH"

# Phase 9 Symbols (³ ++ -- ∆ ∆⁹)
export ONE2LV_SYMBOLS="enabled"

# Aliases
alias one2lv='cd $ONE2LV_ROOT'
alias one2lv-start='bash $ONE2LV_ROOT/start-all.sh'
alias one2lv-stop='bash $ONE2LV_ROOT/stop-all.sh'
alias one2lv-logs='tail -f $ONE2LV_ROOT/logs/*.log'
alias one2lv-status='curl -s http://localhost:8080/api/status'
alias one2lv-api='curl -s http://localhost:3000/api/status'
alias one2lv-phase9='curl -s http://localhost:8081/api/delta'
alias lumenis='curl -s http://localhost:8080/api/status | jq .'

# Docker aliases
alias one2lv-docker='cd $ONE2LV_ROOT/docker && docker-compose'
alias one2lv-docker-up='cd $ONE2LV_ROOT/docker && docker-compose up -d'
alias one2lv-docker-down='cd $ONE2LV_ROOT/docker && docker-compose down'

# Functions
one2lv-restart() {
    echo "Restarting One2lvOS..."
    bash $ONE2LV_ROOT/stop-all.sh
    sleep 2
    bash $ONE2LV_ROOT/start-all.sh
}

one2lv-inject() {
    curl -X POST http://localhost:8080/api/event -H "Content-Type: application/json" -d "{\"event\":\"$1\"}"
}

one2lv-council() {
    curl -s http://localhost:8080/api/council | jq .
}

one2lv-vector() {
    curl -s http://localhost:8081/api/vector3d | jq .
}

one2lv-delta() {
    curl -s http://localhost:8081/api/delta | jq .
}

# Phase 9 Delta commands (³ ++ -- ∆ ∆⁹)
delta-amplify() {
    curl -X POST http://localhost:8081/api/delta/amplify -H "Content-Type: application/json" -d "{\"value\":$1}" | jq .
}

delta-attenuate() {
    curl -X POST http://localhost:8081/api/delta/attenuate -H "Content-Type: application/json" -d "{\"value\":$1}" | jq .
}

delta-propagate() {
    curl -X POST http://localhost:8081/api/delta/propagate -H "Content-Type: application/json" -d "{\"target\":$1}" | jq .
}

# Quick vector create (³)
vec3d() {
    curl -X POST http://localhost:8081/api/vector3d -H "Content-Type: application/json" -d "{\"theta\":$1,\"phi\":$2,\"magnitude\":${3:-1}}" | jq .
}

# One2lvOS Banner
one2lv-banner() {
    echo ""
    echo -e "\033[1;35m╔══════════════════════════════════════════════════════════╗\033[0m"
    echo -e "\033[1;35m║\033[0m  🌌 \033[1;36mOne2lvOS Phase 9\033[0m - \033[1;32mFull Mode\033[0m                  \033[1;35m║\033[0m"
    echo -e "\033[1;35m║\033[0m  Symbols: \033[1;33m³ ³D\033[0m \033[1;31m++ Amplify\033[0m \033[1;34m-- Attenuate\033[0m        \033[1;35m║\033[0m"
    echo -e "\033[1;35m║\033[0m          \033[1;36m∆ Delta\033[0m \033[1;32m∆⁹ 9-Layer\033[0m                     \033[1;35m║\033[0m"
    echo -e "\033[1;35m╚══════════════════════════════════════════════════════════╝\033[0m"
    echo ""
    echo "  🌷 Lumenis:   http://localhost:8080"
    echo "  🔐 API:       http://localhost:3000"
    echo "  🌌 Phase 9:   http://localhost:8080"
    echo "  🔌 WebSocket: ws://localhost:8081"
    echo ""
}

# Show banner on startup (optional - uncomment to enable)
# one2lv-banner

echo ""
echo "✅ One2lvOS integrated! Run 'one2lv-banner' to see status."
echo ""
EOF

echo ""
echo "✅ One2lvOS .bashrc integration complete!"
echo ""
echo "New commands available:"
echo "  one2lv         - Go to One2lvOS directory"
echo "  one2lv-start   - Start all services"
echo "  one2lv-stop    - Stop all services"
echo "  one2lv-restart - Restart all services"
echo "  one2lv-status  - Check status"
echo "  one2lv-logs    - View logs"
echo "  one2lv-inject  - Inject game event"
echo "  one2lv-vector  - Get 3D vector state"
echo "  one2lv-delta   - Get delta engine state"
echo ""
echo "Phase 9 commands:"
echo "  vec3d theta phi [mag]  - Create 3D vector (³)"
echo "  delta-amplify value    - Amplify ++"
echo "  delta-attenuate value  - Attenuate --"
echo "  delta-propagate target - Propagate ∆"
echo ""
echo "Docker:"
echo "  one2lv-docker-up   - Start Docker containers"
echo "  one2lv-docker-down  - Stop Docker containers"
echo ""
echo "Run 'source ~/.bashrc' or restart Termux to apply."
echo ""

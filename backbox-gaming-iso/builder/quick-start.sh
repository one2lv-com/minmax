#!/bin/bash
# BackBox Gaming OS - Lumenis v7.0 Quick Start
# =============================================

set -e

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LUMENIS_ROOT="$SCRIPT_DIR/.."

echo -e "${CYAN}=============================================="
echo -e "  BackBox Gaming OS - Lumenis v7.0 Quick Start"
echo -e "==============================================${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${YELLOW}Running as non-root... some features may be limited${NC}"
fi

# Parse arguments
case "${1:-}" in
    install-deps)
        echo -e "${GREEN}Installing dependencies...${NC}"
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y nodejs npm git curl
        elif command -v pacman &> /dev/null; then
            sudo pacman -S nodejs npm git
        elif command -v dnf &> /dev/null; then
            sudo dnf install -y nodejs npm git
        fi
        echo -e "${GREEN}Dependencies installed!${NC}"
        ;;

    install)
        echo -e "${GREEN}Installing Lumenis...${NC}"
        cd "$LUMENIS_ROOT"
        if [ -d "lumenis_v7" ]; then
            echo "Lumenis already installed"
        else
            mkdir -p lumenis_v7
            cp -r "$SCRIPT_DIR/lumenis" "$LUMENIS_ROOT/lumenis_v7/"
            cd lumenis_v7 && npm install
        fi
        echo -e "${GREEN}Lumenis installed!${NC}"
        ;;

    start)
        echo -e "${GREEN}Starting Lumenis...${NC}"
        cd "$LUMENIS_ROOT/lumenis_v7"
        if [ ! -d "node_modules" ]; then
            npm install
        fi
        node server.js &
        echo -e "${GREEN}Lumenis started!${NC}"
        ;;

    stop)
        echo -e "${YELLOW}Stopping Lumenis...${NC}"
        pkill -f "node server.js" || true
        echo -e "${GREEN}Lumenis stopped!${NC}"
        ;;

    build-iso)
        echo -e "${GREEN}Building ISO...${NC}"
        bash "$SCRIPT_DIR/build-iso.sh"
        ;;

    help|*)
        echo -e "${CYAN}Usage: $0 [command]${NC}"
        echo ""
        echo -e "${GREEN}Commands:${NC}"
        echo "  install-deps  - Install system dependencies"
        echo "  install       - Install Lumenis"
        echo "  start         - Start Lumenis server"
        echo "  stop          - Stop Lumenis server"
        echo "  build-iso     - Build ISO image"
        echo "  help          - Show this help"
        ;;
esac

echo ""
echo -e "${CYAN}BackBox Gaming OS ready!${NC}"
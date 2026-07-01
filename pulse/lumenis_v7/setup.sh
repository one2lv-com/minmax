#!/data/data/com.termux/files/usr/bin/bash
# 🌷 Lumenis Ultimate v7.0 - Termux Setup Script

set -e

echo "╔═══════════════════════════════════════════════════════╗"
echo "║     🌷 LUMINIS ULTIMATE v7.0 🌷                    ║"
echo "║     One2lv OS - AI Gaming Assistant                ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Termux
if [ ! -d "/data/data/com.termux" ]; then
    echo -e "${RED}⚠️ This script is designed for Termux on Android${NC}"
    echo "Running on other systems should also work..."
fi

# Install dependencies
echo -e "${GREEN}📦 Installing dependencies...${NC}"
npm install

# Create directories
echo -e "${GREEN}📁 Creating directories...${NC}"
mkdir -p logs data public modules integrations telemetry config

# Copy env file if not exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️ .env not found, creating from example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️ Please edit .env and add your API keys!${NC}"
fi

# Make scripts executable
chmod +x setup.sh

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "To start Lumenis:"
echo "  npm start"
echo ""
echo "To configure:"
echo "  nano .env"
echo ""

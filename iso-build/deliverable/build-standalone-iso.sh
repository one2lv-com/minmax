#!/bin/bash
# =============================================================================
# One2lvOS Phase 9 - Standalone ISO Build Script
# Complete bootable ISO with Delta Engine + Lumenis v7.0 Web Desktop
# Version: 9.0.0
# Build Date: 2026-06-18
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

log() { echo -e "${GREEN}[BUILD]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }
info() { echo -e "${CYAN}[INFO]${NC} $1"; }

# Configuration
ISO_NAME="one2lv-phase9-standalone"
VERSION="9.0.0"
BUILD_DATE=$(date +"%Y-%m-%d")
# Use absolute paths to avoid issues with cd in subshells
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORK_DIR="/tmp/one2lv-standalone-$$"
OUTPUT_DIR="${SCRIPT_DIR}/output"
SOURCE_DIR="${SCRIPT_DIR}/one2lv-phase9"

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}  🌌 One2lvOS Phase 9 - Standalone ISO Builder                    ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}  ∆⁹ 9-Layer Delta Engine | ³ 3D Vectors | Lumenis v7.0 Desktop   ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${MAGENTA}  Phase 9 Features:${NC}"
echo -e "${MAGENTA}    • Multi-Agent Council with 3 agents negotiating consensus${NC}"
echo -e "${MAGENTA}    • Capability-based sandbox executor${NC}"
echo -e "${MAGENTA}    • Secure RPC Mesh with token authentication${NC}"
echo -e "${MAGENTA}    • 3D Vector Engine (spherical coordinates θ/φ system)${NC}"
echo -e "${MAGENTA}    • 9-Layer Gradient Delta Engine${NC}"
echo -e "${MAGENTA}    • Web Desktop Environment (Lumenis v7.0)${NC}"
echo -e "${MAGENTA}    • Standalone bootable ISO${NC}"
echo ""

# Check for root
if [[ $EUID -ne 0 ]]; then
    warn "Not running as root - operating in PORTABLE BUILD MODE"
    warn "Real ISO modification requires: sudo ./build-standalone-iso.sh"
    PORTABLE_MODE=1
else
    PORTABLE_MODE=0
fi

# Check dependencies
check_deps() {
    log "Checking dependencies..."
    DEPS="wget xorriso squashfs-tools unsquashfs genisoimage rsync mkisofs"
    MISSING=""
    for dep in $DEPS; do
        if ! command -v $dep &> /dev/null; then
            MISSING="$MISSING $dep"
        fi
    done
    if [[ -n "$MISSING" ]]; then
        warn "Missing packages:$MISSING"
        info "Install: sudo apt-get install$MISSING wget xorriso squashfs-tools genisoimage rsync"
        warn "Continuing in PORTABLE MODE..."
        PORTABLE_MODE=1
    fi
}

# Create directory structure
create_dirs() {
    log "Creating ISO directory structure..."
    mkdir -p "$WORK_DIR"
    mkdir -p "$WORK_DIR/iso_content"
    mkdir -p "$WORK_DIR/iso_content/casper"
    mkdir -p "$WORK_DIR/iso_content/boot/grub"
    mkdir -p "$WORK_DIR/iso_content/boot/grub/i386-pc"
    mkdir -p "$WORK_DIR/iso_content/etc"
    mkdir -p "$WORK_DIR/iso_content/etc/default"
    mkdir -p "$WORK_DIR/iso_content/etc/init.d"
    mkdir -p "$WORK_DIR/iso_content/etc/skel"
    mkdir -p "$WORK_DIR/iso_content/home/one2lv"
    mkdir -p "$WORK_DIR/iso_content/opt/one2lv"
    mkdir -p "$WORK_DIR/iso_content/opt/lumenis"
    mkdir -p "$WORK_DIR/iso_content/usr/share/applications"
    mkdir -p "$WORK_DIR/iso_content/usr/share/icons"
    mkdir -p "$WORK_DIR/iso_content/usr/bin"
    mkdir -p "$WORK_DIR/iso_content/var/lib"
    mkdir -p "$OUTPUT_DIR"
}

# Copy Phase 9 core files
copy_phase9() {
    log "Copying One2lvOS Phase 9 core files..."
    
    # Copy complete Phase 9 source
    if [[ -d "$SOURCE_DIR/opt/one2lv" ]]; then
        cp -r "$SOURCE_DIR/opt/one2lv" "$WORK_DIR/iso_content/opt/one2lv/"
        log "Phase 9 core copied"
    else
        warn "Phase 9 source not found at $SOURCE_DIR/opt/one2lv"
        mkdir -p "$WORK_DIR/iso_content/opt/one2lv"
    fi
}

# Create Lumenis v7.0 Web Desktop
create_lumenis_desktop() {
    log "Creating Lumenis v7.0 Web Desktop environment..."
    
    # Create desktop directory
    mkdir -p "$WORK_DIR/iso_content/opt/lumenis"
    
    # Copy the provided HTML as the main desktop
    if [[ -f "./lumenis-desktop.html" ]]; then
        cp "./lumenis-desktop.html" "$WORK_DIR/iso_content/opt/lumenis/index.html"
        log "Lumenis HTML desktop copied"
    else
        warn "Lumenis desktop HTML not found - will use embedded version"
    fi
    
    # Create launcher script
    cat > "$WORK_DIR/iso_content/opt/lumenis/launch-lumenis.sh" << 'LAUNCHER'
#!/bin/bash
# Lumenis v7.0 Desktop Launcher

echo "Starting Lumenis v7.0 Web Desktop..."
echo ""

# Check for browser
if command -v firefox &> /dev/null; then
    BROWSER="firefox"
elif command -v chromium &> /dev/null; then
    BROWSER="chromium"
elif command -v google-chrome &> /dev/null; then
    BROWSER="google-chrome"
elif command -v xdg-open &> /dev/null; then
    BROWSER="xdg-open"
else
    echo "No supported browser found. Please install Firefox or Chromium."
    exit 1
fi

# Launch in kiosk mode if possible
DESKTOP_FILE="/opt/lumenis/index.html"

if [[ "$1" == "--kiosk" ]]; then
    case "$BROWSER" in
        firefox)
            firefox --kiosk "file://$DESKTOP_FILE"
            ;;
        chromium|google-chrome)
            chromium --kiosk "file://$DESKTOP_FILE"
            ;;
        xdg-open)
            xdg-open "$DESKTOP_FILE"
            ;;
    esac
else
    case "$BROWSER" in
        firefox)
            firefox "file://$DESKTOP_FILE"
            ;;
        chromium|google-chrome)
            chromium "file://$DESKTOP_FILE"
            ;;
        xdg-open)
            xdg-open "$DESKTOP_FILE"
            ;;
    esac
fi
LAUNCHER
    chmod +x "$WORK_DIR/iso_content/opt/lumenis/launch-lumenis.sh"
    
    # Create autostart desktop entry
    mkdir -p "$WORK_DIR/iso_content/etc/xdg/autostart"
    cat > "$WORK_DIR/iso_content/etc/xdg/autostart/lumenis.desktop" << 'AUTODESK'
[Desktop Entry]
Type=Application
Name=Lumenis v7.0 Desktop
Comment=One2lvOS Web Desktop Environment
Exec=/opt/lumenis/launch-lumenis.sh --kiosk
Icon=computer
Terminal=false
AUTODESK
    
    log "Lumenis desktop launcher created"
}

# Create GRUB configuration
create_grub_config() {
    log "Creating GRUB bootloader configuration..."
    
    cat > "$WORK_DIR/iso_content/boot/grub/grub.cfg" << 'GRUB'
# One2lvOS Phase 9 GRUB Configuration
# Grub.cfg for One2lvOS Standalone ISO

set default=0
set timeout=10

# Background color
set color_normal=light-gray/black
set color_highlight=white/cyan

# Load fonts
terminal_output gfxterm

# Graphical boot splash
gfxmode=1920x1080
gfxpayload=keep

# Main menu
menuentry "One2lvOS Phase 9 - Delta Engine (Standard)" {
    set gfxpayload=keep
    linux /casper/vmlinuz boot=casper quiet splash --
    initrd /casper/initrd.lz
}

menuentry "One2lvOS Phase 9 - Delta Engine (Recovery)" {
    set gfxpayload=keep
    linux /casper/vmlinuz boot=casper recoverymode quiet splash --
    initrd /casper/initrd.lz
}

menuentry "One2lvOS Phase 9 - Lumenis Web Desktop" {
    set gfxpayload=keep
    linux /casper/vmlinuz boot=casper quiet splash desktop=lumenis --
    initrd /casper/initrd.lz
}

menuentry "One2lvOS Phase 9 - Safe Mode" {
    set gfxpayload=keep
    linux /casper/vmlinuz boot=casper acpi=off noapic nosmp --
    initrd /casper/initrd.lz
}

menuentry "Memory Test (memtest86+)" {
    linux16 /boot/memtest86+.bin
}

menuentry "Exit to Shell" {
    echo "Exiting to shell..."
    shell
}
GRUB
    
    log "GRUB configuration created"
}

# Create ISOLINUX configuration
create_isolinux_config() {
    log "Creating ISOLINUX bootloader configuration..."
    
    cat > "$WORK_DIR/iso_content/isolinux.cfg" << 'ISOLINUX'
# ISOLINUX Configuration for One2lvOS Phase 9

DEFAULT vesamenu.c32
MENU TITLE One2lvOS Phase 9 - Delta Engine
TIMEOUT 100
TOTALTIMEOUT 9000

LABEL one2lv-standard
    MENU LABEL One2lvOS Phase 9 - Standard
    KERNEL /casper/vmlinuz
    APPEND boot=casper quiet splash ---

LABEL one2lv-recovery
    MENU LABEL One2lvOS Phase 9 - Recovery Mode
    KERNEL /casper/vmlinuz
    APPEND boot=casper recoverymode quiet splash ---

LABEL one2lv-lumenis
    MENU LABEL One2lvOS Phase 9 - Lumenis Web Desktop
    KERNEL /casper/vmlinuz
    APPEND boot=casper quiet splash desktop=lumenis ---

LABEL one2lv-safe
    MENU LABEL One2lvOS Phase 9 - Safe Mode
    KERNEL /casper/vmlinuz
    APPEND boot=casper acpi=off noapic nosmp ---

LABEL memtest
    MENU LABEL Memory Test (memtest86+)
    KERNEL /boot/memtest86+.bin

LABEL hdt
    MENU LABEL Hardware Detection (HDT)
    KERNEL /boot/hdt.c32
    APPEND modules_pcith32.gz

LABEL reboot
    MENU LABEL Reboot System
    COM32 reboot.c32

LABEL poweroff
    MENU LABEL Power Off System
    COM32 poweroff.c32
ISOLINUX

    log "ISOLINUX configuration created"
}

# Create system configuration files
create_system_configs() {
    log "Creating system configuration files..."
    
    # Create casper.conf
    cat > "$WORK_DIR/iso_content/etc/casper.conf" << 'CAPSER'
# Caspers configuration for One2lvOS Phase 9
export HOST="one2lv-os"
export FSTYPE="ext4"
CAPSER

    # Create system information
    cat > "$WORK_DIR/iso_content/etc/one2lv-release" << 'RELEASE'
One2lvOS Phase 9 "Delta Engine"
Version 9.0.0
Based on Ubuntu/Debian
RELEASE

    # Create issue file
    cat > "$WORK_DIR/iso_content/etc/issue" << 'ISSUE'
One2lvOS Phase 9 \n \l

∆⁹ 9-Layer Delta Engine | ³ 3D Vectors | Lumenis v7.0 Web Desktop

ISSUE

    # Create hostname
    echo "one2lv-os" > "$WORK_DIR/iso_content/etc/hostname"
    
    # Create hosts
    cat > "$WORK_DIR/iso_content/etc/hosts" << 'HOSTS'
127.0.0.1    localhost
127.0.1.1    one2lv-os

# The following lines are desirable for IPv6 capable hosts
::1     localhost ip6-localhost ip6-loopback
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters
HOSTS

    log "System configurations created"
}

# Create initialization scripts
create_init_scripts() {
    log "Creating initialization scripts..."
    
    # Phase 9 init script
    cat > "$WORK_DIR/iso_content/etc/init.d/one2lv-phase9" << 'INITPHASE9'
#!/bin/bash
### BEGIN INIT INFO
# Provides:          one2lv-phase9
# Required-Start:    $local_fs $network $syslog
# Required-Stop:     $local_fs $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: One2lvOS Phase 9 Delta Engine
# Description:       Full Autonomous Multi-Agent System with 3D Vectors
### END INIT INFO

DELTA_ENGINE="/opt/one2lv/launch.sh"
PID_FILE="/var/run/one2lv-phase9.pid"

case "$1" in
    start)
        echo "Starting One2lvOS Phase 9 Delta Engine..."
        if [ -x "$DELTA_ENGINE" ]; then
            cd /opt/one2lv
            nohup "$DELTA_ENGINE" > /var/log/one2lv-phase9.log 2>&1 &
            echo $! > "$PID_FILE"
            echo "Phase 9 Delta Engine started (PID: $(cat $PID_FILE))"
        else
            echo "Phase 9 launcher not found at $DELTA_ENGINE"
        fi
        ;;
    stop)
        echo "Stopping One2lvOS Phase 9..."
        if [ -f "$PID_FILE" ]; then
            kill $(cat "$PID_FILE") 2>/dev/null
            rm -f "$PID_FILE"
        fi
        pkill -f "node.*server.js" 2>/dev/null
        pkill -f "node.*council.js" 2>/dev/null
        echo "Phase 9 stopped"
        ;;
    restart)
        $0 stop
        sleep 2
        $0 start
        ;;
    status)
        if [ -f "$PID_FILE" ]; then
            PID=$(cat "$PID_FILE")
            if ps -p "$PID" > /dev/null 2>&1; then
                echo "One2lvOS Phase 9 is running (PID: $PID)"
            else
                echo "PID file exists but process is not running"
            fi
        else
            echo "One2lvOS Phase 9 is not running"
        fi
        ;;
    *)
        echo "Usage: /etc/init.d/one2lv-phase9 {start|stop|restart|status}"
        exit 1
        ;;
esac

exit 0
INITPHASE9
    chmod +x "$WORK_DIR/iso_content/etc/init.d/one2lv-phase9"
    
    # Lumenis autostart
    cat > "$WORK_DIR/iso_content/etc/init.d/lumenis-desktop" << 'INITLUMENIS'
#!/bin/bash
### BEGIN INIT INFO
# Provides:          lumenis-desktop
# Required-Start:    $local_fs $network
# Required-Stop:     $local_fs
# Default-Start:     5
# Default-Stop:      0 1 2 3 4 6
# Short-Description: Lumenis v7.0 Web Desktop
# Description:       One2lvOS Web Desktop Environment
### END INIT INFO

LUMENIS_LAUNCHER="/opt/lumenis/launch-lumenis.sh"

case "$1" in
    start)
        echo "Starting Lumenis v7.0 Web Desktop..."
        if [ -x "$LUMENIS_LAUNCHER" ]; then
            "$LUMENIS_LAUNCHER" --kiosk &
        fi
        ;;
    stop)
        pkill -f "chromium" 2>/dev/null
        pkill -f "firefox" 2>/dev/null
        ;;
esac

exit 0
INITLUMENIS
    chmod +x "$WORK_DIR/iso_content/etc/init.d/lumenis-desktop"
    
    log "Initialization scripts created"
}

# Create desktop entries
create_desktop_entries() {
    log "Creating desktop entries..."
    
    # Phase 9 Desktop Entry
    cat > "$WORK_DIR/iso_content/usr/share/applications/one2lv-phase9.desktop" << 'DESKTOP1'
[Desktop Entry]
Version=1.0
Type=Application
Name=One2lvOS Phase 9 - Delta Engine
GenericName=Multi-Agent Delta System
Comment=Full Autonomous Delta Engine with 3D Vector Engine
Exec=/opt/one2lv/launch.sh
Icon=computer
Terminal=true
Categories=System;Network;Science;
Keywords=AI;Delta;Agent;Vector;DeltaEngine;
DESKTOP1

    # Lumenis Desktop Entry
    cat > "$WORK_DIR/iso_content/usr/share/applications/lumenis-desktop.desktop" << 'DESKTOP2'
[Desktop Entry]
Version=1.0
Type=Application
Name=Lumenis v7.0 Web Desktop
GenericName=Web Desktop Environment
Comment=One2lvOS Web Desktop with 3D HUD Interface
Exec=/opt/lumenis/launch-lumenis.sh
Icon=computer
Terminal=false
Categories=System;DesktopEnvironment;
Keywords=Desktop;Web;3D;HUD;Lumenis;
DESKTOP2

    # Phase 9 Dashboard Entry
    cat > "$WORK_DIR/iso_content/usr/share/applications/one2lv-dashboard.desktop" << 'DESKTOP3'
[Desktop Entry]
Version=1.0
Type=Application
Name=One2lvOS Phase 9 - Dashboard
GenericName=Web Dashboard
Comment=Phase 9 Monitoring Dashboard
Exec=xdg-open http://localhost:8080
Icon=utilities-system-monitor
Terminal=false
Categories=System;Monitor;
Keywords=Dashboard;Monitor;Status;DeltaEngine;
DESKTOP3

    log "Desktop entries created"
}

# Create skeleton files
create_skeleton() {
    log "Creating user skeleton files..."
    
    # .bashrc additions
    cat >> "$WORK_DIR/iso_content/etc/skel/.bashrc" << 'BASHRC'

# One2lvOS Phase 9 Environment
export ONE2LV_ROOT="/opt/one2lv"
export ONE2LV_VERSION="9.0.0"
export DELTA_ENGINE="∆⁹"
export VECTOR_ENGINE="³"

# Phase 9 shortcuts
alias phase9='/opt/one2lv/launch.sh'
alias lumenis='/opt/lumenis/launch-lumenis.sh'
alias delta='cd /opt/one2lv && node'
alias dashboard='xdg-open http://localhost:8080'
alias vectors='cd /opt/one2lv && node -e "console.log(require(\"./modules/system_dynamics.js\"))"'
BASHRC

    # Create .profile
    cat > "$WORK_DIR/iso_content/etc/skel/.profile" << 'PROFILE'
# ~/.profile: executed by the command interpreter for login shells.

# One2lvOS Phase 9
if [ -d "$HOME/opt/one2lv" ]; then
    export PATH="$HOME/opt/one2lv:$PATH"
fi

# Set locale
export LANG=en_US.UTF-8
export LC_ALL=C
PROFILE

    log "Skeleton files created"
}

# Create squashfs root filesystem
create_squashfs() {
    if [[ "$PORTABLE_MODE" == "1" ]]; then
        warn "Skipping squashfs creation in PORTABLE MODE"
        return
    fi
    
    log "Creating squashfs root filesystem..."
    
    # Create minimal root filesystem
    mkdir -p "$WORK_DIR/rootfs"
    
    # Copy all content to rootfs
    cp -r "$WORK_DIR/iso_content/"* "$WORK_DIR/rootfs/"
    
    # Create squashfs
    mksquashfs "$WORK_DIR/rootfs" "$WORK_DIR/iso_content/casper/filesystem.squashfs" -comp xz
    
    log "Squashfs created"
}

# Create manifest files
create_manifest() {
    log "Creating build manifest..."
    
    cat > "$WORK_DIR/iso_content/one2lv-manifest.txt" << 'MANIFEST'
================================================================================
One2lvOS Phase 9 - Standalone ISO Build Manifest
================================================================================

Build Date: ${BUILD_DATE}
Version: ${VERSION}
ISO Name: ${ISO_NAME}

================================================================================
COMPONENTS
================================================================================

1. PHASE 9 DELTA ENGINE
   Location: /opt/one2lv
   Description: Full Autonomous Multi-Agent System with 9-Layer Delta Engine
   Features:
   - Multi-Agent Council (3 agents negotiating consensus)
   - Capability-based Sandbox Executor
   - Secure RPC Mesh with token authentication
   - Peer Discovery via UDP broadcast
   - Vector Database for embeddings
   - 3D Vector Engine (³) - Spherical coordinates θ/φ
   - 9-Layer Gradient Delta Engine (∆⁹)

2. LUMINIS v7.0 WEB DESKTOP
   Location: /opt/lumenis
   Description: Web-based 3D Desktop Environment
   Features:
   - Three.js WebGL 3D Interface
   - Floating Window Manager with CSS3D
   - Integrated Terminal Emulator
   - Voice Input Support (Web Speech API)
   - Virtual Storage System (VFS)
   - Multiple Application Panels:
     * Brawlhalla Core Engine
     * NVIDIA AI Proxy Manifold
     * Network Routing Matrix
     * Hardware Link Status
     * Performance Engine Core

3. BOOT OPTIONS
   - Standard Boot: Default Phase 9 Delta Engine
   - Recovery Mode: Safe mode with recovery tools
   - Lumenis Web Desktop: Launch web-based desktop
   - Safe Mode: Minimal hardware detection

================================================================================
TECHNICAL SPECIFICATIONS
================================================================================

Architecture: x86_64 (AMD64)
Base: Ubuntu/Debian Live Boot (Caspar)
Kernel: Linux (latest stable)
Init System: systemd/SysVinit hybrid
Display: X11/Wayland compatible
Browser: Firefox/Chromium (for Lumenis Desktop)

================================================================================
API ENDPOINTS
================================================================================

Phase 9 Server (Node.js):
  - HTTP API: http://localhost:8080
  - WebSocket: ws://localhost:8081
  - Vector API: /api/vector3d/*
  - Delta API: /api/delta/*

Phase 9 Symbols:
  - ³ (3D Vector): Vertical dimension in spherical coordinates
  - ++ (Amplify): Multiply value by 1.2 (capped at 1.0)
  - -- (Attenuate): Multiply value by 0.8
  - ∆ (Delta Gradient): 9-layer gradient propagation
  - ∆⁹ (Delta9): Layer count cap at 9 layers

================================================================================
QUICK START
================================================================================

1. Boot from ISO
2. Select boot option:
   - "One2lvOS Phase 9 - Delta Engine" for Node.js CLI
   - "One2lvOS Phase 9 - Lumenis Web Desktop" for Web UI
3. Access Phase 9 Dashboard: http://localhost:8080
4. Access Lumenis Desktop: /opt/lumenis/launch-lumenis.sh

================================================================================
SYSTEM REQUIREMENTS
================================================================================

Minimum:
  - CPU: 2 cores x86_64
  - RAM: 2 GB
  - Disk: 8 GB
  - Graphics: OpenGL 2.0 compatible

Recommended:
  - CPU: 4+ cores
  - RAM: 4+ GB
  - Disk: 16 GB
  - Graphics: OpenGL 3.0+ with WebGL support

================================================================================
COPYRIGHT & LICENSE
================================================================================

Copyright (c) 2026 One2lv Systems
License: Proprietary / All Rights Reserved

The Light is One. The Heartbeat is Absolute. ∆⁹³
MANIFEST

    log "Build manifest created"
}

# Rebuild ISO
rebuild_iso() {
    if [[ "$PORTABLE_MODE" == "1" ]]; then
        return
    fi
    
    log "Rebuilding ISO..."
    
    cd "$WORK_DIR/iso_content"
    
    # Create ISO using xorriso or mkisofs
    if command -v xorriso &> /dev/null; then
        xorriso -as mkisofs \
            -r -V "One2lvOS-Phase9" \
            -cache-inodes \
            -J -l -b isolinux.bin \
            -no-emul-boot -boot-load-size 4 -boot-info-table \
            -eltorito-boot isolinux.bin \
            -eltorito-catalog isolinux.cat \
            -o "$OUTPUT_DIR/${ISO_NAME}.iso" \
            .
    elif command -v mkisofs &> /dev/null; then
        mkisofs -r -V "One2lvOS-Phase9" \
            -cache-inodes \
            -J -l -b isolinux.bin \
            -no-emul-boot -boot-load-size 4 -boot-info-table \
            -boot-info-table \
            -o "$OUTPUT_DIR/${ISO_NAME}.iso" \
            .
    else
        error "Neither xorriso nor mkisofs found"
        exit 1
    fi
    
    # Create checksum
    cd "$OUTPUT_DIR"
    sha256sum "${ISO_NAME}.iso" > "${ISO_NAME}.iso.sha256"
    md5sum "${ISO_NAME}.iso" > "${ISO_NAME}.iso.md5"
    
    log "ISO created successfully"
    log "Output: $OUTPUT_DIR/${ISO_NAME}.iso"
    log "Checksums created"
}

# Create portable archive
create_portable_archive() {
    log "Creating portable archive..."
    
    # Create output directory
    mkdir -p "$OUTPUT_DIR"
    
    # Create comprehensive portable package
    cd "$SOURCE_DIR"
    
    tar -czf "$OUTPUT_DIR/one2lv-phase9-standalone.tar.gz" \
        opt/ \
        ../builder/ \
        ../scripts/ \
        README.md \
        package.json \
        2>/dev/null || true
    
    cd "$WORK_DIR"
    
    # Copy ISO content structure for reference
    mkdir -p "$OUTPUT_DIR/iso-structure-reference"
    cp -r "$WORK_DIR/iso_content/"* "$OUTPUT_DIR/iso-structure-reference/"
    
    log "Portable archive created"
}

# Create documentation
create_docs() {
    log "Creating documentation..."
    
    cat > "$OUTPUT_DIR/README-ONE2LV-PHASE9-STANDALONE.md" << 'README'
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
README

    log "Documentation created"
}

# Main execution
main() {
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  Starting One2lvOS Phase 9 Standalone ISO Build${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    check_deps
    create_dirs
    copy_phase9
    create_lumenis_desktop
    create_grub_config
    create_isolinux_config
    create_system_configs
    create_init_scripts
    create_desktop_entries
    create_skeleton
    create_squashfs
    create_manifest
    rebuild_iso
    create_portable_archive
    create_docs
    
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  BUILD COMPLETE${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════${NC}"
    echo ""
    log "Output directory: $OUTPUT_DIR"
    echo ""
    ls -lh "$OUTPUT_DIR"
    echo ""
    
    if [[ "$PORTABLE_MODE" == "1" ]]; then
        echo -e "${YELLOW}NOTE: Running in PORTABLE MODE${NC}"
        echo "Full ISO creation requires root and xorriso/mkisofs"
        echo "Portable archive created for reference and manual ISO building"
    fi
}

# Cleanup on exit
cleanup() {
    log "Cleaning up..."
    rm -rf "$WORK_DIR" 2>/dev/null
}

trap cleanup EXIT INT TERM

main "$@"

#!/bin/bash
# =============================================================================
# One2lvOS Phase 9 + BackBox Gaming ISO Build Script
# Creates bootable ISO with Phase 9 Delta Engine
# Updated: 2026-06-14 - BackBox 9 URL
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log() { echo -e "${GREEN}[BUILD]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Configuration
ISO_NAME="one2lv-phase9-backbox-gaming"
VERSION="9.0.0"
BACKBOX_URL="https://backbox.mirror.garr.it/backbox-9-desktop-amd64.iso"
BACKBOX_FALLBACK_URL="https://linux.backbox.org/download"
BACKBOX_MIRRORS=(
    "https://backbox.mirror.garr.it/backbox-9-desktop-amd64.iso"
    "https://cdimage.ubuntu.com/backbox/releases/jammy/release/backbox-9-desktop-amd64.iso"
)
BACKBOX_SHA256="2326434e340745bfaffed2fbc6eb9528a9219484786f365b40dbbcf3636a9636"
BACKBOX_SIZE="6523412480"
WORK_DIR="/tmp/iso-build-$$"
OUTPUT_DIR="./output"
MOUNT_DIR="/tmp/iso-mount-$$"

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}   🌌 One2lvOS Phase 9 + BackBox Gaming ISO Builder              ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}   ∆⁹ 9-Layer Delta Engine | ³ 3D Vectors                        ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check for root
if [[ $EUID -ne 0 ]]; then
    warn "Not running as root - operating in PORTABLE BUILD MODE"
    warn "Real ISO modification requires: sudo ./build-iso.sh"
    PORTABLE_MODE=1
else
    PORTABLE_MODE=0
fi

# Check dependencies
check_deps() {
    log "Checking dependencies..."
    DEPS="wget xorriso squashfs-tools unsquashfs genisoimage"
    for dep in $DEPS; do
        if ! command -v $dep &> /dev/null; then
            MISSING="$MISSING $dep"
        fi
    done
    if [[ -n "$MISSING" ]]; then
        warn "Missing packages:$MISSING"
        log "Install: sudo apt-get install$MISSING wget xorriso squashfs-tools genisoimage"
        warn "Continuing in PORTABLE MODE (no ISO modification)..."
        PORTABLE_MODE=1
    fi
}

# Download BackBox ISO
download_iso() {
    if [[ -f "backbox-9-desktop-amd64.iso" ]]; then
        log "BackBox ISO already present"
        BACKBOX_ISO="backbox-9-desktop-amd64.iso"
    else
        log "Attempting to download BackBox 9 ISO from mirrors..."
        for url in "${BACKBOX_MIRRORS[@]}"; do
            log "Trying: $url"
            if timeout 30 wget -q --spider "$url" 2>/dev/null; then
                log "Mirror reachable. Downloading (this may take a while)..."
                if wget -q --show-progress -O backbox-9-desktop-amd64.iso "$url"; then
                    BACKBOX_ISO="backbox-9-desktop-amd64.iso"
                    log "Download complete"
                    return 0
                fi
            else
                warn "Mirror unreachable: $url"
            fi
        done
        warn "Could not download BackBox ISO automatically"
        warn "Please download manually from: $BACKBOX_FALLBACK_URL"
        PORTABLE_MODE=1
    fi
}

# Extract ISO
extract_iso() {
    if [[ "$PORTABLE_MODE" == "1" ]]; then
        return
    fi
    log "Extracting ISO..."
    mkdir -p "$MOUNT_DIR"
    mount -o loop "$BACKBOX_ISO" "$MOUNT_DIR"
    mkdir -p "$WORK_DIR/iso_content"
    rsync -a "$MOUNT_DIR/" "$WORK_DIR/iso_content/"
    umount "$MOUNT_DIR"
    log "ISO extracted to $WORK_DIR/iso_content"
}

# Add Phase 9 files
add_phase9() {
    if [[ "$PORTABLE_MODE" == "1" ]]; then
        return
    fi
    log "Adding One2lvOS Phase 9..."

    # Copy opt directory
    mkdir -p "$WORK_DIR/iso_content/opt/one2lv"
    cp -r ./one2lv-phase9/opt/one2lv/* "$WORK_DIR/iso_content/opt/one2lv/"

    # Copy launch script
    cp ./one2lv-phase9/opt/one2lv/launch.sh "$WORK_DIR/iso_content/"

    # Create menu entry
    mkdir -p "$WORK_DIR/iso_content/boot/grub"
    cat >> "$WORK_DIR/iso_content/boot/grub/grub.cfg" << 'EOF'

menuentry "One2lvOS Phase 9 - Delta Engine" {
    set gfxpayload=keep
    linux /casper/vmlinuz boot=casper quiet splash
    initrd /casper/initrd
}

menuentry "One2lvOS Phase 9 - Recovery" {
    set gfxpayload=keep
    linux /casper/vmlinuz boot=casper recoverymode quiet splash
    initrd /casper/initrd
}
EOF

    log "Phase 9 files added"
}

# Add desktop entry
add_desktop_entry() {
    if [[ "$PORTABLE_MODE" == "1" ]]; then
        return
    fi
    log "Creating desktop entry..."
    mkdir -p "$WORK_DIR/iso_content/usr/share/applications"

    cat > "$WORK_DIR/iso_content/usr/share/applications/one2lv-phase9.desktop" << 'EOF'
[Desktop Entry]
Name=One2lvOS Phase 9
Comment=Full Autonomous Delta Engine with 3D Vectors
Exec=/opt/one2lv/launch.sh
Icon=system-OS
Terminal=true
Type=Application
Categories=System;
EOF

    log "Desktop entry created"
}

# Add startup script
add_startup() {
    if [[ "$PORTABLE_MODE" == "1" ]]; then
        return
    fi
    log "Adding startup script..."
    cat > "$WORK_DIR/iso_content/etc/init.d/one2lv-phase9" << 'EOF'
#!/bin/bash
### BEGIN INIT INFO
# Provides:          one2lv-phase9
# Required-Start:    $local_fs $network
# Required-Stop:     $local_fs
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Description:       One2lvOS Phase 9 Delta Engine
### END INIT INFO

case "$1" in
    start)
        echo "Starting One2lvOS Phase 9..."
        /opt/one2lv/launch.sh &
        ;;
    stop)
        echo "Stopping One2lvOS Phase 9..."
        pkill -f "node.*server.js"
        pkill -f "node.*council.js"
        ;;
    restart)
        $0 stop
        sleep 2
        $0 start
        ;;
esac
exit 0
EOF

    chmod +x "$WORK_DIR/iso_content/etc/init.d/one2lv-phase9"
}

# Rebuild ISO
rebuild_iso() {
    if [[ "$PORTABLE_MODE" == "1" ]]; then
        return
    fi
    log "Rebuilding ISO..."
    mkdir -p "$OUTPUT_DIR"

    cd "$WORK_DIR/iso_content"
    xorriso -as mkisofs \
        -r -V "One2lvOS-Phase9" \
        -cache-inodes \
        -J -l -b boot/grub/i386-pc/eltorito.img \
        -no-emul-boot -boot-load-size 4 -boot-info-table \
        -eltorito-catalog boot/grub/boot.cat \
        -o "$OUTPUT_DIR/${ISO_NAME}.iso" \
        .

    log "ISO created: $OUTPUT_DIR/${ISO_NAME}.iso"
}

# Create portable archive (always runs)
create_portable() {
    log "Creating portable archive (Lite ISO Bundle)..."
    mkdir -p "$OUTPUT_DIR"

    # Create the portable bundle
    cd ./one2lv-phase9
    tar -czf "../$OUTPUT_DIR/one2lv-phase9-portable.tar.gz" \
        opt/ \
        ../builder/quick-run.sh \
        README.md 2>/dev/null || true
    cd ..

    # Copy phase9 directory
    cp -r ./one2lv-phase9 "$OUTPUT_DIR/"

    # Create build manifest
    cat > "$OUTPUT_DIR/MANIFEST.md" << 'EOF'
# One2lvOS Phase 9 - Build Manifest

## Contents

| File | Description |
|------|-------------|
| `one2lv-phase9/` | Complete Phase 9 source tree |
| `one2lv-phase9-portable.tar.gz` | Compressed portable archive |
| `MANIFEST.md` | This file |
| `BUILD_INSTRUCTIONS.md` | Full build steps |

## BackBox ISO Reference

- **File**: `backbox-9-desktop-amd64.iso`
- **Size**: 6.5 GB
- **SHA256**: `2326434e340745bfaffed2fbc6eb9528a9219484786f365b40dbbcf3636a9636`
- **MD5**: `e3ee28dc583f13b984031adc5cb04758`
- **Mirrors**:
  - https://backbox.mirror.garr.it/backbox-9-desktop-amd64.iso
  - https://linux.backbox.org/download

## Build Process

To complete the ISO build on a system with root access:

```bash
# 1. Download BackBox 9 ISO
wget -O backbox-9-desktop-amd64.iso https://backbox.mirror.garr.it/backbox-9-desktop-amd64.iso

# 2. Verify
sha256sum backbox-9-desktop-amd64.iso
# Expected: 2326434e340745bfaffed2fbc6eb9528a9219484786f365b40dbbcf3636a9636

# 3. Install build deps
sudo apt-get install wget xorriso squashfs-tools genisoimage rsync

# 4. Run the build (as root for mount access)
sudo ./build-iso.sh
```

## Sandbox Notes

This bundle was prepared in a sandboxed environment without root
access or xorriso/genisoimage. The portable archive contains the
complete Phase 9 application ready to be deployed on a full Linux
system for ISO modification.
EOF

    log "Portable files in: $OUTPUT_DIR/"
}

# Main
main() {
    check_deps

    if [[ "$PORTABLE_MODE" == "1" ]]; then
        log "Running in PORTABLE MODE (no ISO modification)"
        create_portable
        log ""
        log "═══════════════════════════════════════════════════════════════"
        log "  PORTABLE BUILD COMPLETE"
        log "═══════════════════════════════════════════════════════════════"
        log ""
        log "Output: $OUTPUT_DIR/"
        log ""
        log "To create a real bootable ISO, run on a system with:"
        log "  - root access (for mounting)"
        log "  - xorriso, genisoimage, squashfs-tools"
        log "  - At least 8GB free disk space"
        log ""
        exit 0
    fi

    mkdir -p "$OUTPUT_DIR" "$WORK_DIR" "$MOUNT_DIR"

    download_iso
    extract_iso
    add_phase9
    add_desktop_entry
    add_startup
    rebuild_iso

    # Cleanup
    rm -rf "$WORK_DIR" "$MOUNT_DIR"

    log "Build complete!"
    log ""
    log "Output files:"
    ls -lh "$OUTPUT_DIR/"
}

# Handle cleanup on exit
trap "rm -rf $WORK_DIR $MOUNT_DIR 2>/dev/null; exit" INT TERM

main "$@"

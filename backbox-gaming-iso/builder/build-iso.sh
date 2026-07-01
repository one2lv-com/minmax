#!/bin/bash
# BackBox Gaming OS - ISO Builder
# =============================================

set -e

# Configuration
BACKBOX_VERSION="8.1"
ARCH="amd64"
ISO_NAME="backbox-${BACKBOX_VERSION}-gaming-${ARCH}"
OUTPUT_DIR="output"

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}=============================================="
echo -e "  BackBox Gaming OS ISO Builder"
echo -e "==============================================${NC}"

# Check dependencies
check_deps() {
    echo "Checking dependencies..."
    deps=("wget" "xorriso" "squashfs-tools" "genisoimage")
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            echo -e "${RED}Missing: $dep${NC}"
            echo "Install with: sudo apt-get install $dep"
            exit 1
        fi
    done
    echo -e "${GREEN}All dependencies found!${NC}"
}

# Download base ISO
download_base() {
    echo "Downloading BackBox base ISO..."
    mkdir -p "$OUTPUT_DIR"
    if [ ! -f "$OUTPUT_DIR/backbox-${BACKBOX_VERSION}-${ARCH}.iso" ]; then
        wget -O "$OUTPUT_DIR/backbox-${BACKBOX_VERSION}-${ARCH}.iso" \
            "https://nchc.dl.sourceforge.net/project/backbox/BTX/${BACKBOX_VERSION}/backbox-${BACKBOX_VERSION}-${ARCH}.iso"
    fi
    echo -e "${GREEN}Base ISO ready!${NC}"
}

# Create overlay
create_overlay() {
    echo "Creating custom overlay..."
    mkdir -p overlay/{squashfs,image}

    # Copy Lumenis
    cp -r ../lumenis overlay/squashfs/opt/lumenis

    # Create autostart
    cat > overlay/squashfs/etc/systemd/system/lumenis.service <<EOF
[Unit]
Description=Lumenis Gaming Assistant
After=network.target

[Service]
Type=simple
ExecStart=/opt/lumenis/server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF
}

# Build ISO
build_iso() {
    echo "Building ISO..."
    cd overlay

    # Make squashfs
    mksquashfs squashfs image/squashfs -comp xz

    # Create ISO
    xorriso -as mkisofs \
        -b boot/extlinux/isolinux.bin \
        -c boot/extlinux/boot.cat \
        -no-emul-boot \
        -boot-load-size 4 \
        -boot-info-table \
        -eltorito-alt-boot \
        -e boot/efi.img \
        -no-emul-boot \
        -isohybrid-gpt-basdat \
        -o ../${OUTPUT_DIR}/${ISO_NAME}.iso .

    cd ..
    echo -e "${GREEN}ISO created: ${OUTPUT_DIR}/${ISO_NAME}.iso${NC}"
}

# Main
check_deps
download_base
create_overlay
build_iso

echo ""
echo -e "${GREEN}Build complete!${NC}"
echo "ISO: ${OUTPUT_DIR}/${ISO_NAME}.iso"
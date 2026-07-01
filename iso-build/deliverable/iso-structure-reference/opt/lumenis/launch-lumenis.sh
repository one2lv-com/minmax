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

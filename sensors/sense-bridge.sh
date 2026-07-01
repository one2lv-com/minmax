#!/data/data/com.termux/files/usr/bin/bash

echo "=== [Lumenis Sentry] Sensor Bridge Initializing ==="

API="http://localhost:3000/api/deploy"
TOKEN_FILE="$HOME/.one2lv_token"

if [ ! -f "$TOKEN_FILE" ]; then
  echo "Token file missing: $TOKEN_FILE"
  exit 1
fi

TOKEN=$(cat $TOKEN_FILE)

echo "Bridge Online"

termux-sensor -s light,gravity -d 1000 | while read line
do

LIGHT=$(echo "$line" | grep -o '"light":[^}]*' | grep -o '[0-9.]*' | head -n1)

if [ -z "$LIGHT" ]; then
  continue
fi

echo "Light level: $LIGHT"

# Darkness amplification logic
if (( ${LIGHT%.*} < 10 )); then

  echo "Low light detected — boosting HUD"

  curl -s -X POST $API \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cmd":"HUD_BRIGHTNESS_MAX","reason":"S_AMPLIFY"}'

fi

done

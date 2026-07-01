#!/data/data/com.termux/files/usr/bin/bash

echo "=== Lumenis 0x73 Runtime ==="

BASE=~/one2lvos_final

# Start sensor bridge
if [ -f "$BASE/sensors/sense-bridge.sh" ]; then
    echo "[SENTRY] Starting sensor bridge"
    bash $BASE/sensors/sense-bridge.sh &
fi

# Start CV node
if [ -f "$BASE/sensors/cv-node.py" ]; then
    echo "[VISION] Starting OpenCV node"
    python $BASE/sensors/cv-node.py &
fi

# Start Infinity Glass
if [ -f "$BASE/infinity-glass/bin/infinity-glass" ]; then
    echo "[CORE] Starting Infinity Glass runtime"
    cd $BASE/infinity-glass
    ./bin/infinity-glass
else
    echo "[WARN] Infinity Glass runtime missing"
fi

wait

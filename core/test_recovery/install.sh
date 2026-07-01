#!/bin/bash
set -e
echo "=== one2lvos_v4 install ==="
[ -f .env ] || cp .env.example .env
mkdir -p workspace workspace/.snapshots logs
npm install
echo "[ok] install complete"

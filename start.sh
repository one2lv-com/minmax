#!/bin/bash
echo "Launching One2lvOS..."

cd ~/one2lvos_final/core
node server.js
node reactor_core/lumenis_core.js &

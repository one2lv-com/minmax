#!/bin/bash

echo "🚀 Starting One2lvOS..."

node core/server.js &
node reactor_core/lumenis_agent.js &

echo "🌌 Universe: http://127.0.0.1:3000/universe.html"


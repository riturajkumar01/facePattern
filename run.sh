#!/bin/bash
# AURA Quantum Banking Launcher
# Resolves Node environment cleanly and boots server

if [ -d "$HOME/.nvm/versions/node/v22.23.2/bin" ]; then
  export PATH="$HOME/.nvm/versions/node/v22.23.2/bin:$PATH"
elif [ -d "$HOME/.nvm/versions/node/v18.20.8/bin" ]; then
  export PATH="$HOME/.nvm/versions/node/v18.20.8/bin:$PATH"
fi

echo "=========================================================="
echo "🏦 Starting Bharat National Bank (BNB) 3FA NetBanking Portal"
echo "🌐 Open your browser at: http://localhost:8080"
echo "=========================================================="
node server.js


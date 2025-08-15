#!/bin/bash
# Chaos Mode: Spin up multiple experiments for parallel development

echo "🔥 CHAOS MODE ACTIVATED 🔥"
echo "================================"

# Get the root directory
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# Kill any existing Next.js processes
echo "🧹 Cleaning up existing processes..."
pkill -f "next dev" 2>/dev/null || true
sleep 2

# Function to check if worktree exists
check_worktree() {
    local worktree_name=$1
    if [ ! -d "worktrees/$worktree_name" ]; then
        echo "📁 Creating worktree: $worktree_name"
        git worktree add "worktrees/$worktree_name" -b "$worktree_name" 2>/dev/null || \
        git worktree add "worktrees/$worktree_name" "$worktree_name" 2>/dev/null || \
        echo "⚠️  Worktree $worktree_name already exists"
    fi
}

# Create worktrees if they don't exist
check_worktree "experiment-1"
check_worktree "experiment-2"
check_worktree "wild-idea"

# Start main development server
echo ""
echo "🚀 Starting MAIN on port 3000..."
PORT=3000 npm run dev > /tmp/chaos-main.log 2>&1 &
echo "   PID: $! | Logs: tail -f /tmp/chaos-main.log"

# Start experiment servers
cd worktrees/experiment-1 2>/dev/null && {
    echo "🧪 Starting EXPERIMENT-1 on port 3001..."
    PORT=3001 npm run dev > /tmp/chaos-exp1.log 2>&1 &
    echo "   PID: $! | Logs: tail -f /tmp/chaos-exp1.log"
    cd - > /dev/null
}

cd worktrees/experiment-2 2>/dev/null && {
    echo "🧪 Starting EXPERIMENT-2 on port 3002..."
    PORT=3002 npm run dev > /tmp/chaos-exp2.log 2>&1 &
    echo "   PID: $! | Logs: tail -f /tmp/chaos-exp2.log"
    cd - > /dev/null
}

cd worktrees/wild-idea 2>/dev/null && {
    echo "💡 Starting WILD-IDEA on port 3003..."
    PORT=3003 npm run dev > /tmp/chaos-wild.log 2>&1 &
    echo "   PID: $! | Logs: tail -f /tmp/chaos-wild.log"
    cd - > /dev/null
}

# Wait a moment for servers to start
sleep 5

echo ""
echo "================================"
echo "🎯 Your chaos lab is ready!"
echo "================================"
echo ""
echo "📍 Main Development:"
echo "   http://localhost:3000/template"
echo ""
echo "🧪 Experiments:"
echo "   http://localhost:3001/template (experiment-1)"
echo "   http://localhost:3002/template (experiment-2)"
echo "   http://localhost:3003/template (wild-idea)"
echo ""
echo "📝 Useful commands:"
echo "   View logs: tail -f /tmp/chaos-*.log"
echo "   Kill all:  pkill -f 'next dev'"
echo "   Compare:   diff -r worktrees/experiment-1/src worktrees/experiment-2/src"
echo ""
echo "🔥 Break things! When something works, we'll figure out why later!"
echo ""
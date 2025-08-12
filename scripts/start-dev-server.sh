#!/bin/bash
set -e

# VVG Template Dynamic Development Server Starter
# Automatically detects context (main/production/staging) and starts appropriate server with ngrok

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Configuration
NGROK_HOSTNAME="${NGROK_HOSTNAME:-mike-development.ngrok-free.app}"
MIN_PORT=3000
MAX_PORT=10000
PORT_INCREMENT=1

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Function to check if a port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1  # Port is in use
    else
        return 0  # Port is available
    fi
}

# Detect current context (main, production, staging)
detect_context() {
    local current_dir="$(pwd)"
    local git_root="$(git rev-parse --show-toplevel 2>/dev/null || echo "")"
    
    if [[ "$current_dir" == *"/worktrees/production"* ]]; then
        echo "production"
    elif [[ "$current_dir" == *"/worktrees/staging"* ]]; then
        echo "staging"
    else
        echo "main"
    fi
}

# Get environment-specific settings
get_env_settings() {
    local context=$1
    local env_file=""
    local default_port=""
    local base_path=""
    
    case "$context" in
        production)
            env_file=".env.production"
            default_port=3000
            ;;
        staging)
            env_file=".env.staging"
            default_port=3001
            ;;
        main)
            # Check which env file exists in main
            if [ -f ".env.production" ]; then
                env_file=".env.production"
                default_port=3000
            elif [ -f ".env.staging" ]; then
                env_file=".env.staging"
                default_port=3001
            else
                env_file=".env"
                default_port=3000
            fi
            ;;
    esac
    
    # Read BASE_PATH from env file if it exists
    if [ -f "$env_file" ]; then
        base_path=$(grep "^BASE_PATH=" "$env_file" 2>/dev/null | cut -d'=' -f2 || echo "")
        # Also check for PORT override in env file
        local env_port=$(grep "^PORT=" "$env_file" 2>/dev/null | cut -d'=' -f2 || echo "")
        if [ ! -z "$env_port" ]; then
            default_port=$env_port
        fi
    fi
    
    echo "$env_file|$default_port|$base_path"
}

# Pre-flight checks
check_dependencies() {
    local errors=0
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm is not installed${NC}"
        ((errors++))
    fi
    
    if ! command -v tmux &> /dev/null; then
        echo -e "${RED}❌ tmux is not installed${NC}"
        ((errors++))
    fi
    
    if ! command -v ngrok &> /dev/null; then
        echo -e "${YELLOW}⚠️  ngrok is not installed${NC}"
        echo -e "${YELLOW}   Install with: brew install ngrok (macOS) or download from ngrok.com${NC}"
        ((errors++))
    fi
    
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ No package.json found in current directory${NC}"
        ((errors++))
    fi
    
    if [ $errors -gt 0 ]; then
        exit 1
    fi
    
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}⚠️  node_modules not found, running npm install...${NC}"
        npm install
    fi
}

# Find available port
find_available_port() {
    local start_port=$1
    local port=$start_port
    
    while ! check_port $port; do
        echo -e "${YELLOW}Port $port is in use, trying next...${NC}"
        port=$((port + PORT_INCREMENT))
        if [ $port -gt $MAX_PORT ]; then
            echo -e "${RED}❌ No available ports found between $start_port-$MAX_PORT${NC}"
            exit 1
        fi
    done
    
    echo $port
}

# Get npm command based on context
get_npm_command() {
    local context=$1
    local port=$2
    
    case "$context" in
        production)
            if [ -f "worktrees/production/package.json" ] && [ "$PWD" = "$PROJECT_ROOT" ]; then
                echo "cd worktrees/production && PORT=$port npm run dev"
            else
                echo "PORT=$port npm run dev"
            fi
            ;;
        staging)
            if [ -f "worktrees/staging/package.json" ] && [ "$PWD" = "$PROJECT_ROOT" ]; then
                echo "cd worktrees/staging && PORT=$port npm run dev"
            else
                echo "PORT=$port npm run dev"
            fi
            ;;
        main)
            echo "PORT=$port npm run dev"
            ;;
    esac
}

# Main execution
main() {
    # Banner
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════╗"
    echo "║          VVG Template Development Server              ║"
    echo "║              with Ngrok Integration                   ║"
    echo "╚═══════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    # Detect context
    CONTEXT=$(detect_context)
    echo -e "${BLUE}Context:${NC} $CONTEXT"
    echo -e "${BLUE}Directory:${NC} $(pwd)"
    
    # Pre-flight checks
    check_dependencies
    
    # Get environment settings
    IFS='|' read -r env_file default_port base_path <<< "$(get_env_settings "$CONTEXT")"
    
    if [ ! -z "$env_file" ] && [ -f "$env_file" ]; then
        echo -e "${BLUE}Environment:${NC} $env_file"
    fi
    
    if [ ! -z "$base_path" ]; then
        echo -e "${BLUE}BasePath:${NC} $base_path"
    fi
    
    # Find available port
    PORT=${PORT:-$default_port}
    PORT=$(find_available_port $PORT)
    echo -e "${GREEN}✅ Using port:${NC} $PORT"
    
    # Get current tmux session name
    if [ -z "$TMUX" ]; then
        echo -e "${RED}❌ Not running inside tmux${NC}"
        echo -e "${YELLOW}Please run this script from within a tmux session${NC}"
        exit 1
    fi
    
    SESSION=$(tmux display-message -p '#S')
    WINDOW_NAME="dev-$CONTEXT-$PORT"
    
    # Check if window already exists
    if tmux list-windows -t "$SESSION" | grep -q "$WINDOW_NAME"; then
        echo -e "${YELLOW}⚠️  Window $WINDOW_NAME already exists${NC}"
        read -p "Kill existing window and restart? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            tmux kill-window -t "$SESSION:$WINDOW_NAME"
        else
            echo -e "${CYAN}Switching to existing window...${NC}"
            tmux select-window -t "$SESSION:$WINDOW_NAME"
            exit 0
        fi
    fi
    
    # Create new tmux window
    echo -e "${BLUE}Creating tmux window:${NC} $WINDOW_NAME"
    tmux new-window -t "$SESSION" -n "$WINDOW_NAME"
    
    # Split the window horizontally (60/40 split for better visibility)
    tmux split-window -h -p 40 -t "$SESSION:$WINDOW_NAME"
    
    # Get npm command
    npm_command=$(get_npm_command "$CONTEXT" "$PORT")
    
    # Start the application in the left pane (larger)
    echo -e "${BLUE}Starting development server...${NC}"
    tmux send-keys -t "$SESSION:$WINDOW_NAME.0" "$npm_command" C-m
    
    # Start ngrok in the right pane
    echo -e "${BLUE}Starting ngrok tunnel...${NC}"
    tmux send-keys -t "$SESSION:$WINDOW_NAME.1" "ngrok http --hostname=$NGROK_HOSTNAME $PORT" C-m
    
    # Select the left pane (application pane)
    tmux select-pane -t "$SESSION:$WINDOW_NAME.0"
    
    # Switch to the new window
    tmux select-window -t "$SESSION:$WINDOW_NAME"
    
    # Display summary
    echo ""
    echo -e "${GREEN}🚀 Development server started successfully!${NC}"
    echo ""
    echo -e "${BOLD}Access URLs:${NC}"
    echo -e "  ${BLUE}Local:${NC}      http://localhost:$PORT$base_path"
    echo -e "  ${BLUE}Ngrok:${NC}      https://$NGROK_HOSTNAME$base_path"
    echo ""
    echo -e "${BOLD}Tmux Navigation:${NC}"
    echo -e "  ${BLUE}Switch panes:${NC}  Ctrl+b then arrow keys"
    echo -e "  ${BLUE}Kill window:${NC}   Ctrl+b then &"
    echo -e "  ${BLUE}Detach tmux:${NC}   Ctrl+b then d"
    echo ""
    echo -e "${CYAN}Window: $SESSION:$WINDOW_NAME${NC}"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h       Show this help message"
        echo "  --context        Show detected context and exit"
        echo ""
        echo "Environment Variables:"
        echo "  PORT             Override default port"
        echo "  NGROK_HOSTNAME   Override ngrok hostname (default: mike-development.ngrok-free.app)"
        echo ""
        echo "This script automatically detects if you're in the main project,"
        echo "production worktree, or staging worktree and starts the appropriate"
        echo "development server with ngrok integration."
        exit 0
        ;;
    --context)
        CONTEXT=$(detect_context)
        echo "Context: $CONTEXT"
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac
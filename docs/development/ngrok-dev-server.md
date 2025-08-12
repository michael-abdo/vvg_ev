# Dynamic Development Server with Ngrok

Smart development server that automatically detects your project context and starts the appropriate server with ngrok integration.

## Features

✅ **Context Detection** - Automatically detects main/production/staging worktree  
✅ **Smart Port Selection** - Finds available ports automatically  
✅ **Ngrok Integration** - Sets up secure tunnel with custom hostname  
✅ **Tmux Management** - Creates organized tmux windows with split panes  
✅ **Environment Aware** - Uses correct environment files and settings  
✅ **Conflict Resolution** - Handles existing windows and port conflicts  

## Usage

### Quick Start

```bash
# From anywhere in the project
npm run dev:ngrok

# Or directly
./scripts/start-dev-server.sh

# Check context without starting
npm run dev:context
```

### Context-Specific Usage

```bash
# From main project directory
cd ~/projects/vvg/vvg_template
npm run dev:ngrok
# → Starts main development server

# From production worktree
cd ~/projects/vvg/vvg_template/worktrees/production
npm run dev:ngrok
# → Starts production development server

# From staging worktree
cd ~/projects/vvg/vvg_template/worktrees/staging
npm run dev:ngrok
# → Starts staging development server
```

## How It Works

### 1. **Context Detection**
The script automatically detects where you are:

| Location | Context | Default Port | Environment |
|----------|---------|--------------|-------------|
| Project root | `main` | 3000 | `.env.production` or `.env` |
| `worktrees/production/` | `production` | 3000 | `.env.production` |
| `worktrees/staging/` | `staging` | 3001 | `.env.staging` |

### 2. **Port Management**
- Uses context-appropriate default ports
- Automatically finds available ports if defaults are in use
- Respects `PORT` environment variable override
- Searches from 3000-10000 range

### 3. **Tmux Window Layout**
```
┌─────────────────────────┬──────────────────┐
│                         │                  │
│   Development Server    │   Ngrok Tunnel   │
│   (npm run dev)         │   (ngrok http)   │
│                         │                  │
│   Port: 3000           │   Hostname:       │
│   Context: production   │   mike-dev...    │
│                         │                  │
│                         │                  │
└─────────────────────────┴──────────────────┘
```

### 4. **Environment Integration**
- Reads `BASE_PATH` from environment files
- Uses correct npm commands for each context
- Loads environment-specific configurations
- Handles worktree path resolution

## Configuration

### Environment Variables

```bash
# Override default port
PORT=4000 npm run dev:ngrok

# Override ngrok hostname
NGROK_HOSTNAME=custom-hostname.ngrok-free.app npm run dev:ngrok
```

### Project Settings

The script reads configuration from:
- `.env.production` (production context)
- `.env.staging` (staging context)
- `package.json` scripts
- PM2 ecosystem configs

## Access URLs

After starting, you'll get access to:

```bash
🚀 Development server started successfully!

Access URLs:
  Local:      http://localhost:3001/template-staging
  Ngrok:      https://mike-development.ngrok-free.app/template-staging

Tmux Navigation:
  Switch panes:  Ctrl+b then arrow keys
  Kill window:   Ctrl+b then &
  Detach tmux:   Ctrl+b then d

Window: vvg_template:dev-staging-3001
```

## Dependencies

### Required
- **tmux** - Terminal multiplexer
- **ngrok** - Secure tunnel to localhost
- **npm** - Node package manager

### Installation
```bash
# macOS
brew install tmux ngrok

# Ubuntu/Debian
sudo apt install tmux
# Download ngrok from ngrok.com

# Verify installation
tmux --version
ngrok version
```

## Troubleshooting

### Port Conflicts
```bash
# Check what's using a port
lsof -i :3000

# Force specific port
PORT=4000 npm run dev:ngrok
```

### Tmux Issues
```bash
# Must run from within tmux
tmux new-session -d -s dev
tmux attach -t dev

# List active sessions
tmux list-sessions

# Kill problematic window
tmux kill-window -t session:window-name
```

### Context Detection
```bash
# Check detected context
npm run dev:context

# Verify worktree structure
git worktree list
```

### Ngrok Problems
```bash
# Check ngrok auth
ngrok config check

# Test ngrok manually
ngrok http 3000
```

## Advanced Usage

### Multiple Environments
You can run multiple contexts simultaneously:

```bash
# Terminal 1: Production worktree
cd worktrees/production
npm run dev:ngrok
# → Runs on port 3000

# Terminal 2: Staging worktree  
cd worktrees/staging
npm run dev:ngrok
# → Runs on port 3001
```

### Custom Hostnames
```bash
# Use different ngrok hostname per environment
NGROK_HOSTNAME=staging.ngrok-free.app npm run dev:ngrok
```

### Development Workflow
```bash
# 1. Setup worktrees (one-time)
npm run worktree:setup
npm run worktree:install

# 2. Copy environment files
cp .env.production worktrees/production/
cp .env.staging worktrees/staging/

# 3. Start development with ngrok
npm run dev:ngrok

# 4. Access via ngrok URL for external testing
```

## Script Options

```bash
# Show help
./scripts/start-dev-server.sh --help

# Check context only
./scripts/start-dev-server.sh --context

# Standard execution
./scripts/start-dev-server.sh
```

## Integration with Clean Reset

The development server integrates with the clean-reset functionality:

```bash
# Reset and restart development
npm run clean-reset:force
npm run dev:ngrok
```

This ensures a completely fresh development environment with the latest code and dependencies.

---

**Pro Tip**: Set up tmux sessions for different projects and use this script to quickly spin up development environments with external access via ngrok!
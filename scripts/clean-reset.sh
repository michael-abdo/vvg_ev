#!/bin/bash
set -e

# VVG Template - Clean Reset Script
# Performs complete rebuild and restart for both staging and production environments
# Usage: ./scripts/clean-reset.sh [--force] [--skip-staging] [--skip-production]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Configuration
FORCE_MODE=false
SKIP_STAGING=false
SKIP_PRODUCTION=false
HOST=${HOST:-localhost}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --force)
            FORCE_MODE=true
            shift
            ;;
        --skip-staging)
            SKIP_STAGING=true
            shift
            ;;
        --skip-production)
            SKIP_PRODUCTION=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [--force] [--skip-staging] [--skip-production]"
            echo ""
            echo "Options:"
            echo "  --force              Skip confirmation prompts"
            echo "  --skip-staging       Skip staging environment reset"
            echo "  --skip-production    Skip production environment reset"
            echo "  --help, -h          Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option $1"
            exit 1
            ;;
    esac
done

# Function to display banner
show_banner() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                    VVG TEMPLATE CLEAN RESET                   ║"
    echo "║               Complete Rebuild & Restart Utility             ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Function to log with timestamp
log_with_timestamp() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

# Function to check if PM2 is installed and running
check_pm2() {
    if ! command -v pm2 &> /dev/null; then
        echo -e "${RED}❌ PM2 is not installed or not in PATH${NC}"
        echo -e "${YELLOW}Install PM2: npm install -g pm2${NC}"
        exit 1
    fi

    # Check if PM2 daemon is running
    pm2 ping &> /dev/null || {
        echo -e "${YELLOW}⚠️  PM2 daemon not running, starting...${NC}"
        pm2 ping
    }
}

# Function to check if environment files exist
check_env_files() {
    local missing_files=()
    
    if [ "$SKIP_STAGING" = false ] && [ ! -f ".env.staging" ]; then
        missing_files+=(".env.staging")
    fi
    
    if [ "$SKIP_PRODUCTION" = false ] && [ ! -f ".env.production" ]; then
        missing_files+=(".env.production")
    fi
    
    if [ ${#missing_files[@]} -gt 0 ]; then
        echo -e "${RED}❌ Missing environment files:${NC}"
        for file in "${missing_files[@]}"; do
            echo -e "   ${RED}•${NC} $file"
        done
        echo -e "${YELLOW}Create the missing files before running clean reset${NC}"
        exit 1
    fi
}

# Function to show current PM2 status
show_pm2_status() {
    echo -e "${CYAN}📊 Current PM2 Status:${NC}"
    if pm2 list | grep -q "vvg-template"; then
        pm2 list | grep vvg-template || true
    else
        echo -e "${YELLOW}No VVG Template processes found${NC}"
    fi
    echo ""
}

# Function to clean build artifacts
clean_build_artifacts() {
    log_with_timestamp "🧹 Cleaning build artifacts..."
    
    # Remove Next.js build cache
    if [ -d ".next" ]; then
        rm -rf .next
        echo -e "   ${GREEN}✓${NC} Removed .next directory"
    fi
    
    # Remove standalone build
    if [ -d ".next-standalone" ]; then
        rm -rf .next-standalone
        echo -e "   ${GREEN}✓${NC} Removed .next-standalone directory"
    fi
    
    # Clear npm cache (optional, only if force mode)
    if [ "$FORCE_MODE" = true ]; then
        npm cache clean --force 2>/dev/null || true
        echo -e "   ${GREEN}✓${NC} Cleared npm cache"
    fi
    
    echo -e "   ${GREEN}✓${NC} Build artifacts cleaned"
}

# Function to rebuild application
rebuild_application() {
    log_with_timestamp "🔨 Rebuilding application..."
    
    # Install/update dependencies
    if [ "$FORCE_MODE" = true ]; then
        npm ci
    else
        npm install
    fi
    echo -e "   ${GREEN}✓${NC} Dependencies installed"
    
    # Build application
    npm run build
    echo -e "   ${GREEN}✓${NC} Application built successfully"
}

# Function to reset environment
reset_environment() {
    local env_name=$1
    local skip_flag=$2
    
    if [ "$skip_flag" = true ]; then
        echo -e "${YELLOW}⏭️  Skipping $env_name environment${NC}"
        return 0
    fi
    
    echo -e "${BOLD}${CYAN}🔄 Resetting $env_name Environment${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Use existing deploy-env.sh script
    if [ -f "$SCRIPT_DIR/deploy-env.sh" ]; then
        log_with_timestamp "Executing deployment for $env_name..."
        
        # Make sure script is executable
        chmod +x "$SCRIPT_DIR/deploy-env.sh"
        
        # Run deployment with proper environment
        if "$SCRIPT_DIR/deploy-env.sh" "$env_name" "$HOST"; then
            echo -e "   ${GREEN}✅ $env_name environment reset successfully${NC}"
            return 0
        else
            echo -e "   ${RED}❌ $env_name environment reset failed${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ Deploy script not found: $SCRIPT_DIR/deploy-env.sh${NC}"
        return 1
    fi
}

# Function to verify environments are running
verify_environments() {
    log_with_timestamp "🔍 Verifying environments..."
    
    local all_good=true
    
    # Check staging
    if [ "$SKIP_STAGING" = false ]; then
        if pm2 describe vvg-template-staging &>/dev/null; then
            local staging_status=$(pm2 describe vvg-template-staging | grep "status" | head -1 | awk '{print $3}' || echo "unknown")
            if [ "$staging_status" = "online" ]; then
                echo -e "   ${GREEN}✓${NC} Staging (port 3001): Running"
            else
                echo -e "   ${RED}✗${NC} Staging (port 3001): $staging_status"
                all_good=false
            fi
        else
            echo -e "   ${RED}✗${NC} Staging: Process not found"
            all_good=false
        fi
    fi
    
    # Check production
    if [ "$SKIP_PRODUCTION" = false ]; then
        if pm2 describe vvg-template-production &>/dev/null; then
            local prod_status=$(pm2 describe vvg-template-production | grep "status" | head -1 | awk '{print $3}' || echo "unknown")
            if [ "$prod_status" = "online" ]; then
                echo -e "   ${GREEN}✓${NC} Production (port 3000): Running"
            else
                echo -e "   ${RED}✗${NC} Production (port 3000): $prod_status"
                all_good=false
            fi
        else
            echo -e "   ${RED}✗${NC} Production: Process not found"
            all_good=false
        fi
    fi
    
    return $all_good
}

# Function to show completion summary
show_completion_summary() {
    echo ""
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                    CLEAN RESET COMPLETE                       ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo -e "${GREEN}🎉 Clean reset completed successfully!${NC}"
    echo ""
    echo -e "${BOLD}Next steps:${NC}"
    echo -e "${CYAN}•${NC} View logs: ${YELLOW}pm2 logs vvg-template${NC}"
    echo -e "${CYAN}•${NC} Check status: ${YELLOW}pm2 status${NC}"
    echo -e "${CYAN}•${NC} Access staging: ${YELLOW}http://localhost:3001/template-staging${NC}"
    echo -e "${CYAN}•${NC} Access production: ${YELLOW}http://localhost:3000/template${NC}"
}

# Main execution
main() {
    show_banner
    
    # Change to project root
    cd "$PROJECT_ROOT"
    
    log_with_timestamp "Starting clean reset process..."
    echo -e "${CYAN}Host:${NC} $HOST"
    echo -e "${CYAN}Staging:${NC} $([ "$SKIP_STAGING" = true ] && echo "SKIPPED" || echo "INCLUDED")"
    echo -e "${CYAN}Production:${NC} $([ "$SKIP_PRODUCTION" = true ] && echo "SKIPPED" || echo "INCLUDED")"
    echo -e "${CYAN}Force mode:${NC} $([ "$FORCE_MODE" = true ] && echo "ENABLED" || echo "DISABLED")"
    echo ""
    
    # Confirmation prompt (unless force mode)
    if [ "$FORCE_MODE" = false ]; then
        echo -e "${YELLOW}⚠️  This will rebuild and restart your applications.${NC}"
        echo -e "${YELLOW}Continue? [y/N]${NC}"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            echo -e "${CYAN}Clean reset cancelled.${NC}"
            exit 0
        fi
        echo ""
    fi
    
    # Pre-flight checks
    log_with_timestamp "🔍 Running pre-flight checks..."
    check_pm2
    check_env_files
    echo -e "   ${GREEN}✓${NC} Pre-flight checks passed"
    echo ""
    
    # Show current status
    show_pm2_status
    
    # Clean build artifacts
    clean_build_artifacts
    echo ""
    
    # Rebuild application
    rebuild_application
    echo ""
    
    # Reset environments
    local reset_failed=false
    
    if [ "$SKIP_STAGING" = false ]; then
        if ! reset_environment "staging" "$SKIP_STAGING"; then
            reset_failed=true
        fi
        echo ""
    fi
    
    if [ "$SKIP_PRODUCTION" = false ]; then
        if ! reset_environment "production" "$SKIP_PRODUCTION"; then
            reset_failed=true
        fi
        echo ""
    fi
    
    if [ "$reset_failed" = true ]; then
        echo -e "${RED}❌ Some environments failed to reset${NC}"
        echo -e "${YELLOW}Check the logs above for details${NC}"
        exit 1
    fi
    
    # Verify everything is running
    if verify_environments; then
        show_completion_summary
    else
        echo -e "${RED}❌ Some environments are not running properly${NC}"
        echo -e "${YELLOW}Run 'pm2 status' and 'pm2 logs' for details${NC}"
        exit 1
    fi
}

# Handle interrupts gracefully
trap 'echo -e "\n${RED}Clean reset interrupted${NC}"; exit 1' INT TERM

# Run main function
main "$@"
#!/bin/bash

# Memory Check Script for Next.js Builds
# Automatically stops builds if available memory is too low
# Prevents out-of-memory build failures

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REQUIRED_MEMORY_GB=1
REQUIRED_MEMORY_MB=$((REQUIRED_MEMORY_GB * 1024))

# Logging functions
log() {
    echo -e "${GREEN}[MEMORY-CHECK] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[MEMORY-CHECK] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[MEMORY-CHECK] ERROR: $1${NC}"
}

info() {
    echo -e "${BLUE}[MEMORY-CHECK] INFO: $1${NC}"
}

# Function to get available memory in MB
get_available_memory() {
    if command -v free &> /dev/null; then
        # Linux/Unix systems
        local available_kb=$(free | grep '^Mem:' | awk '{print $7}')
        if [ -z "$available_kb" ]; then
            # Fallback for older free versions
            available_kb=$(free | grep '^Mem:' | awk '{print $4 + $6}')
        fi
        echo $((available_kb / 1024))
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        local pages_free=$(vm_stat | grep "Pages free" | awk '{print $3}' | tr -d '.')
        local page_size=$(vm_stat | grep "page size" | awk '{print $8}')
        echo $(( (pages_free * page_size) / 1024 / 1024 ))
    else
        # Fallback - assume we have enough memory if we can't detect
        echo $((REQUIRED_MEMORY_MB + 100))
    fi
}

# Function to get total memory in MB
get_total_memory() {
    if command -v free &> /dev/null; then
        local total_kb=$(free | grep '^Mem:' | awk '{print $2}')
        echo $((total_kb / 1024))
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        local total_bytes=$(sysctl -n hw.memsize)
        echo $((total_bytes / 1024 / 1024))
    else
        echo "unknown"
    fi
}

# Function to format memory size
format_memory() {
    local mb=$1
    if [ "$mb" -lt 1024 ]; then
        echo "${mb}MB"
    else
        local gb=$(echo "scale=1; $mb / 1024" | bc 2>/dev/null || echo "$((mb / 1024))")
        echo "${gb}GB"
    fi
}

# Function to show memory cleanup suggestions
show_cleanup_suggestions() {
    echo ""
    error "BUILD BLOCKED: Insufficient memory for Next.js build"
    echo ""
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}                 MEMORY CLEANUP REQUIRED                  ${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Next.js builds require at least ${REQUIRED_MEMORY_GB}GB of available memory."
    echo "Your system currently has insufficient memory to complete the build safely."
    echo ""
    echo "🔧 IMMEDIATE ACTIONS:"
    echo ""
    echo "1. Free up system memory:"
    echo "   • Close unnecessary applications (browsers, IDEs, etc.)"
    echo "   • Kill memory-intensive processes"
    echo "   • Clear system caches"
    echo ""
    echo "2. Check for memory leaks:"
    echo "   • Stop any runaway Node.js processes"
    echo "   • Check Docker containers: docker ps"
    echo "   • Kill zombie processes: ps aux | grep defunct"
    echo ""
    echo "3. System-specific cleanup:"
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "   • Clear page cache: sudo sync && sudo sysctl vm.drop_caches=1"
        echo "   • Check swap usage: swapon --show"
        echo "   • Free swap if needed: sudo swapoff -a && sudo swapon -a"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "   • Purge memory: sudo purge"
        echo "   • Close memory-hungry apps from Activity Monitor"
        echo "   • Restart system services if needed"
    fi
    
    echo ""
    echo "4. Alternative build strategies:"
    echo "   • Use a machine with more RAM (recommended)"
    echo "   • Build on a remote server with sufficient memory"
    echo "   • Use Docker with memory limits for controlled builds"
    echo ""
    echo "📊 Memory Requirements:"
    echo "   • Minimum: ${REQUIRED_MEMORY_GB}GB available"
    echo "   • Recommended: 2GB+ available for optimal performance"
    echo "   • Large projects: 4GB+ available"
    echo ""
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Function to display current memory status
show_memory_status() {
    local available_mb=$1
    local total_mb=$2
    local used_mb=$((total_mb - available_mb))
    local usage_percent=$(echo "scale=1; $used_mb * 100 / $total_mb" | bc 2>/dev/null || echo "$((used_mb * 100 / total_mb))")
    
    echo ""
    info "Current Memory Status:"
    echo "   Total Memory: $(format_memory $total_mb)"
    echo "   Used Memory:  $(format_memory $used_mb) (${usage_percent}%)"
    echo "   Available:    $(format_memory $available_mb)"
    echo "   Required:     $(format_memory $REQUIRED_MEMORY_MB)"
    echo ""
}

# Main memory check function
check_memory() {
    log "Checking system memory before build..."
    
    # Get memory information
    local available_mb=$(get_available_memory)
    local total_mb=$(get_total_memory)
    
    # Show current memory status
    show_memory_status "$available_mb" "$total_mb"
    
    # Check if we have enough memory
    if [ "$available_mb" -lt "$REQUIRED_MEMORY_MB" ]; then
        show_cleanup_suggestions
        error "Build terminated due to insufficient memory"
        error "Available: $(format_memory $available_mb) | Required: $(format_memory $REQUIRED_MEMORY_MB)"
        exit 1
    fi
    
    # Memory is sufficient
    log "Memory check passed ✓"
    log "Available memory: $(format_memory $available_mb) (sufficient for build)"
    
    # Show warning if memory is low but still acceptable
    if [ "$available_mb" -lt $((REQUIRED_MEMORY_MB + 512)) ]; then
        warn "Memory is sufficient but low. Consider freeing up more memory for optimal performance."
    fi
    
    echo ""
    return 0
}

# Function to show system load information
show_system_load() {
    if command -v uptime &> /dev/null; then
        local load_info=$(uptime)
        info "System Load: $load_info"
    fi
    
    if command -v nproc &> /dev/null; then
        local cpu_count=$(nproc)
        info "CPU Cores Available: $cpu_count"
    fi
    echo ""
}

# Main execution
main() {
    echo ""
    log "=== Next.js Build Memory Check ==="
    
    # Show system information
    show_system_load
    
    # Perform memory check
    check_memory
    
    log "=== Memory Check Complete ==="
    echo ""
}

# Run the check
main "$@"
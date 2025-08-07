#!/bin/bash
# Common functions and utilities for all scripts
# This file should be sourced, not executed directly

# Color codes
export GREEN='\033[0;32m'
export RED='\033[0;31m'
export YELLOW='\033[1;33m'
export BLUE='\033[0;34m'
export NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $*"
}

error() {
    echo -e "${RED}[ERROR]${NC} $*" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $*"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $*"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $*"
}

# Check environment variable with consistent error handling
check_env() {
    local var_name="$1"
    local var_value="${!var_name}"
    local required="${2:-false}"
    
    if [ -z "$var_value" ]; then
        if [ "$required" = "true" ]; then
            error "Missing required environment variable: $var_name"
            return 1
        else
            warning "Optional environment variable not set: $var_name"
            return 2
        fi
    else
        success "$var_name is set"
        return 0
    fi
}

# Source environment validation if available
if [ -f "${SCRIPT_DIR}/env-validation.sh" ]; then
    source "${SCRIPT_DIR}/env-validation.sh"
fi

# Validate all required environment variables using generated validation
validate_required_env() {
    local env_type="${1:-common}"
    
    # If validation functions are loaded, use them; otherwise fall back to basic validation
    if type validate_all_env_vars &>/dev/null; then
        log "Running comprehensive environment validation..."
        if validate_all_env_vars "$env_type"; then
            success "All required environment variables are valid"
            return 0
        else
            error "Environment validation failed"
            return 1
        fi
    else
        # Fallback: basic validation without generated functions
        warning "Generated validation not loaded, using basic validation"
        local missing_count=0
        local basic_vars=("ENVIRONMENT" "NEXTAUTH_URL" "NEXTAUTH_SECRET")
        for var in "${basic_vars[@]}"; do
            if ! check_env "$var" true; then
                ((missing_count++))
            fi
        done
        
        if [ $missing_count -gt 0 ]; then
            error "Missing: $missing_count required environment variables"
            return 1
        fi
        
        success "Basic environment validation passed"
        return 0
    fi
}

# Generate Docker environment file
generate_env_file() {
    local env_file="$1"
    local environment="${2:-$ENVIRONMENT}"
    
    cat > "$env_file" << EOF
# Generated environment file for $environment
ENVIRONMENT=$environment
NODE_ENV=production
BASE_PATH=${BASE_PATH:-/$APP_PROJECT-$environment}

# Application settings
APP_NAME=${APP_NAME}
APP_PROJECT=${APP_PROJECT}
APP_URL=${APP_URL}

# NextAuth
NEXTAUTH_URL=${NEXTAUTH_URL}
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}

# Azure AD
AZURE_AD_CLIENT_ID=${AZURE_AD_CLIENT_ID}
AZURE_AD_CLIENT_SECRET=${AZURE_AD_CLIENT_SECRET}
AZURE_AD_TENANT_ID=${AZURE_AD_TENANT_ID}

# Database
MYSQL_HOST=${MYSQL_HOST}
MYSQL_PORT=${MYSQL_PORT:-3306}
MYSQL_USER=${MYSQL_USER}
MYSQL_PASSWORD=${MYSQL_PASSWORD}
MYSQL_DATABASE=${MYSQL_DATABASE}

# Storage
STORAGE_PROVIDER=${STORAGE_PROVIDER:-local}
LOCAL_STORAGE_PATH=${LOCAL_STORAGE_PATH:-.storage}
EOF

    # Add AWS/S3 config for production or if S3 is enabled
    if [ "$environment" = "production" ] || [ "$STORAGE_PROVIDER" = "s3" ]; then
        cat >> "$env_file" << EOF

# AWS/S3 Configuration
AWS_REGION=${AWS_REGION}
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID}
S3_BUCKET_NAME=${S3_BUCKET_NAME}
EOF
    fi
}

# Perform health check on URL
perform_health_check() {
    local health_url="$1"
    local max_attempts="${2:-10}"
    local retry_delay="${3:-5}"
    
    log "Checking health endpoint: $health_url"
    
    for i in $(seq 1 "$max_attempts"); do
        if curl -f -s "$health_url" > /dev/null; then
            success "Health check passed"
            return 0
        fi
        
        if [ "$i" -eq "$max_attempts" ]; then
            error "Health check failed after $max_attempts attempts"
            return 1
        fi
        
        log "Attempt $i failed, retrying in $retry_delay seconds..."
        sleep "$retry_delay"
    done
}

# Docker container operations
docker_stop_container() {
    local container_name="$1"
    
    if docker ps -a | grep -q "$container_name"; then
        log "Stopping existing container: $container_name"
        docker stop "$container_name" || true
        docker rm "$container_name" || true
        success "Container stopped and removed"
    else
        info "Container $container_name not found"
    fi
}

docker_run_container() {
    local container_name="$1"
    local image="$2"
    local env_file="$3"
    local port_mapping="${4:-3000:3000}"
    local additional_args="${5:-}"
    
    log "Starting container: $container_name"
    log "Image: $image"
    log "Port mapping: $port_mapping"
    
    # Base docker run command
    local docker_cmd="docker run -d"
    docker_cmd="$docker_cmd --name $container_name"
    docker_cmd="$docker_cmd --restart unless-stopped"
    docker_cmd="$docker_cmd --env-file $env_file"
    docker_cmd="$docker_cmd -p $port_mapping"
    
    # Add volume for logs
    docker_cmd="$docker_cmd -v /var/log/$container_name:/app/logs"
    
    # Add any additional arguments
    if [ -n "$additional_args" ]; then
        docker_cmd="$docker_cmd $additional_args"
    fi
    
    # Add image
    docker_cmd="$docker_cmd $image"
    
    # Execute
    if eval "$docker_cmd"; then
        success "Container started successfully"
        return 0
    else
        error "Failed to start container"
        return 1
    fi
}

# ECR operations
ecr_login() {
    if [ -z "$AWS_REGION" ] || [ -z "$ECR_REGISTRY" ]; then
        error "AWS_REGION and ECR_REGISTRY must be set"
        return 1
    fi
    
    log "Authenticating with AWS ECR..."
    
    if ! command -v aws &> /dev/null; then
        error "AWS CLI is not installed"
        return 1
    fi
    
    if aws ecr get-login-password --region "$AWS_REGION" | \
        docker login --username AWS --password-stdin "$ECR_REGISTRY"; then
        success "Successfully authenticated with ECR"
        return 0
    else
        error "Failed to authenticate with ECR"
        return 1
    fi
}

# Confirmation prompt for dangerous operations
confirm_action() {
    local action="$1"
    local confirmation_text="$2"
    
    echo -e "${YELLOW}⚠️  WARNING: You are about to $action${NC}"
    echo ""
    read -p "Type '$confirmation_text' to continue: " user_input
    
    if [ "$user_input" != "$confirmation_text" ]; then
        error "Action cancelled"
        return 1
    fi
    
    return 0
}

# Create backup tag for rollback
create_backup_tag() {
    local container_name="$1"
    local backup_file="${2:-/tmp/last_${container_name}_backup.txt}"
    local backup_tag="backup-$(date +%Y%m%d-%H%M%S)"
    
    if docker ps -a | grep -q "$container_name"; then
        local current_image=$(docker inspect "$container_name" --format='{{.Config.Image}}' 2>/dev/null || echo "")
        
        if [ -n "$current_image" ]; then
            docker tag "$current_image" "$current_image:$backup_tag"
            echo "$backup_tag" > "$backup_file"
            log "Backed up current image as: $current_image:$backup_tag"
            return 0
        fi
    fi
    
    warning "No existing container to backup"
    return 1
}

# Export functions for use in sourcing scripts
export -f log error success warning info
export -f check_env validate_required_env
export -f generate_env_file perform_health_check
export -f docker_stop_container docker_run_container
export -f ecr_login confirm_action create_backup_tag
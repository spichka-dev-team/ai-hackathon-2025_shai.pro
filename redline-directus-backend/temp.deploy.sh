#> cat deploy.sh
# copied deploy.sh file from staging server (that was changed) (idk who changed and why) (15-09-2025, 6:35 PM)

#!/bin/bash

# redline Directus Backend Deployment Script
# This script pulls the latest changes, builds and runs the Directus application

set -e  # Exit on any error

echo "🚀 Starting Directus deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_NAME="directus"
COMPOSE_FILE="docker-compose.staging.yml"

echo -e "${BLUE}=== Directus Deployment Script (PRODUCTION) ===${NC}"
echo -e "${YELLOW}Project: $PROJECT_NAME${NC}"
echo ""

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log() { echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }
error() { echo -e "${RED}[ERROR] $1${NC}"; }
warning() { echo -e "${YELLOW}[WARNING] $1${NC}"; }

# Check if git is available
if ! command -v git &> /dev/null; then
    print_error "Git is not installed or not available in PATH"
    exit 1
fi

# Проверка Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed or not available in PATH"
    exit 1
fi

if ! command -v docker compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not installed or not available in PATH"
    exit 1
fi

# Определяем docker compose
DOCKER_COMPOSE_CMD="docker-compose"
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
fi
log "Using: $DOCKER_COMPOSE_CMD"

# Проверяем файлы
if [ ! -f "$COMPOSE_FILE" ]; then
    error "File $COMPOSE_FILE not found!"
    exit 1
fi

if [ ! -f ".env" ]; then
    error "File .env not found!"
    exit 1
fi

# Step 1: Pull latest changes from git (skip if running in CI/CD)
if [ -z "$CI" ]; then
    print_status "Pulling latest changes from git..."
    if git pull origin main; then
        print_success "Successfully pulled latest changes"
    else
        print_error "Failed to pull changes from git"
        exit 1
    fi
else
    print_status "Running in CI/CD environment, skipping git pull"
fi

# Стоп и удаление старых контейнеров
log "Stopping old containers..."
$DOCKER_COMPOSE_CMD -f $COMPOSE_FILE down --remove-orphans || print_warning "No containers were running"

# Ensure external network for production compose exists
NETWORK_NAME="redline-network"
if ! docker network inspect "$NETWORK_NAME" >/dev/null 2>&1; then
    print_status "Creating Docker network: $NETWORK_NAME"
    if docker network create "$NETWORK_NAME"; then
        print_success "Created network $NETWORK_NAME"
    else
        print_error "Failed to create network $NETWORK_NAME"
        exit 1
    fi
fi

# Показываем volumes
log "Checking volumes..."
docker volume ls | grep $PROJECT_NAME || print_warning "No project volumes found yet"

# Clean up old Docker images
print_status "Cleaning up old Docker images..."
docker image prune -f || print_warning "Could not clean up images"

# Обновление образов
log "Updating Docker images..."
$DOCKER_COMPOSE_CMD -f $COMPOSE_FILE pull || print_warning "Some images could not be pulled (custom built images)"

# Запуск
log "Building and starting containers..."
if $DOCKER_COMPOSE_CMD -f $COMPOSE_FILE up --build -d; then
    print_success "Directus application built and started successfully"
else
    print_error "Failed to build and start the application"
    exit 1
fi

log "Waiting for services to start..."
sleep 15

log "Container status:"
$DOCKER_COMPOSE_CMD -f $COMPOSE_FILE ps

# Show logs for all services
print_status "Showing recent logs..."
if SERVICES=$($DOCKER_COMPOSE_CMD -f $COMPOSE_FILE ps --services 2>/dev/null); then
    for svc in $SERVICES; do
        print_status "Recent logs for service: $svc"
        $DOCKER_COMPOSE_CMD -f $COMPOSE_FILE logs --tail=20 "$svc" || print_warning "No logs available for $svc"
        echo ""
    done
else
    print_warning "Could not list compose services to show logs"
    log "Latest Directus logs:"
    $DOCKER_COMPOSE_CMD -f $COMPOSE_FILE logs --tail=20 directus || true
    
    log "Latest PostgreSQL logs:"
    $DOCKER_COMPOSE_CMD -f $COMPOSE_FILE logs --tail=10 postgres || true
fi

# Health check for Directus services
print_status "Performing health check..."
sleep 10  # Additional time for Directus to fully start

# Health check URLs based on your docker-compose.staging.yml
DIRECTUS_MAIN_URL="http://localhost:8055"
DIRECTUS_ADMIN_URL="http://localhost:8000"

# Check main Directus instance
print_status "Checking main Directus instance (port 8055)..."
if curl -f -s "$DIRECTUS_MAIN_URL/server/health" > /dev/null 2>&1; then
    print_success "✅ Main Directus instance is healthy: $DIRECTUS_MAIN_URL"
else
    print_warning "⚠️ Main Directus instance health check failed"
    print_status "Retrying health check in 10 seconds..."
    sleep 10
    if curl -f -s "$DIRECTUS_MAIN_URL/server/health" > /dev/null 2>&1; then
        print_success "✅ Main Directus instance is healthy on retry: $DIRECTUS_MAIN_URL"
    else
        print_warning "⚠️ Main Directus instance may still be starting up. Check logs: $DOCKER_COMPOSE_CMD -f $COMPOSE_FILE logs directus"
    fi
fi

# Check admin Directus instance
print_status "Checking admin Directus instance (port 8000)..."
if curl -f -s "$DIRECTUS_ADMIN_URL/server/health" > /dev/null 2>&1; then
    print_success "✅ Admin Directus instance is healthy: $DIRECTUS_ADMIN_URL"
else
    print_warning "⚠️ Admin Directus instance health check failed"
    print_status "Retrying health check in 5 seconds..."
    sleep 5
    if curl -f -s "$DIRECTUS_ADMIN_URL/server/health" > /dev/null 2>&1; then
        print_success "✅ Admin Directus instance is healthy on retry: $DIRECTUS_ADMIN_URL"
    else
        print_warning "⚠️ Admin Directus instance may still be starting up. Check logs: $DOCKER_COMPOSE_CMD -f $COMPOSE_FILE logs directus-primary"
    fi
fi

print_success "Deployment completed! 🎉"

echo ""
echo -e "${BLUE}=== Directus Service Information ===${NC}"
echo -e "${GREEN}Main API URL: http://localhost:8055${NC}"
echo -e "${GREEN}Admin Panel URL: http://localhost:8000${NC}"
echo -e "${GREEN}External Access: http://YOUR_SERVER_IP:8055${NC}"
echo ""
echo -e "${BLUE}=== Useful Commands ===${NC}"
echo -e "${YELLOW}View logs: $DOCKER_COMPOSE_CMD -f $COMPOSE_FILE logs -f${NC}"
echo -e "${YELLOW}Stop services: $DOCKER_COMPOSE_CMD -f $COMPOSE_FILE down${NC}"
echo -e "${YELLOW}Restart services: $DOCKER_COMPOSE_CMD -f $COMPOSE_FILE restart${NC}"
echo -e "${YELLOW}Check status: $DOCKER_COMPOSE_CMD -f $COMPOSE_FILE ps${NC}"
echo -e "${YELLOW}View specific service logs: $DOCKER_COMPOSE_CMD -f $COMPOSE_FILE logs -f [directus|directus-primary|postgres]${NC}"
echo ""
echo -e "${BLUE}=== Sync Tools ===${NC}"
echo -e "${YELLOW}Run directus-sync: $DOCKER_COMPOSE_CMD -f $COMPOSE_FILE --profile tools run --rm directus-sync${NC}"
echo ""

log "✅ Directus deployment complete (production)"
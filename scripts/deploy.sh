#!/bin/bash
# OBELISK - Deployment Script
# Usage: ./deploy.sh [command]
# Commands: setup, start, stop, restart, logs, ssl, status

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DOMAIN="${OBELISK_DOMAIN:-obelisk.example.com}"
EMAIL="${OBELISK_EMAIL:-admin@example.com}"

log() { echo -e "${GREEN}[OBELISK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Check prerequisites
check_prereqs() {
    command -v docker >/dev/null 2>&1 || error "Docker not installed"
    command -v docker-compose >/dev/null 2>&1 || error "Docker Compose not installed"
    log "Prerequisites OK"
}

# Initial setup
setup() {
    log "Setting up OBELISK..."

    # Create .env if not exists
    if [ ! -f .env ]; then
        log "Creating .env file..."
        cat > .env << EOF
# OBELISK Production Environment
NODE_ENV=production
ADMIN_API_KEY=$(openssl rand -hex 32)
ALLOWED_ORIGINS=https://${DOMAIN}
SENTRY_DSN=
EOF
        log ".env created with random ADMIN_API_KEY"
    fi

    # Create directories
    mkdir -p certbot/conf certbot/www
    mkdir -p obelisk-backend/data

    # Update nginx.conf with domain
    if [ -f nginx.conf ]; then
        sed -i "s/obelisk.example.com/${DOMAIN}/g" nginx.conf
        log "Updated nginx.conf with domain: ${DOMAIN}"
    fi

    log "Setup complete!"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Edit .env with your settings"
    echo "2. Run: ./deploy.sh ssl"
    echo "3. Run: ./deploy.sh start"
}

# Get SSL certificate
ssl() {
    log "Obtaining SSL certificate for ${DOMAIN}..."

    # Start nginx temporarily for ACME challenge
    docker-compose up -d nginx

    # Get certificate
    docker-compose run --rm certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email ${EMAIL} \
        --agree-tos \
        --no-eff-email \
        -d ${DOMAIN}

    # Restart nginx with SSL
    docker-compose restart nginx

    log "SSL certificate obtained!"
}

# Start all services
start() {
    log "Starting OBELISK..."
    check_prereqs

    docker-compose up -d backend nginx certbot

    log "Waiting for services to start..."
    sleep 5

    status
}

# Stop all services
stop() {
    log "Stopping OBELISK..."
    docker-compose down
    log "Stopped"
}

# Restart services
restart() {
    log "Restarting OBELISK..."
    docker-compose restart
    log "Restarted"
}

# Show logs
logs() {
    local service="${1:-backend}"
    docker-compose logs -f --tail=100 "$service"
}

# Show status
status() {
    echo ""
    echo -e "${BLUE}=== OBELISK Status ===${NC}"
    echo ""

    # Check containers
    docker-compose ps

    echo ""

    # Check backend health
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        HEALTH=$(curl -s http://localhost:3001/health)
        echo -e "${GREEN}Backend: HEALTHY${NC}"
        echo "  Uptime: $(echo $HEALTH | grep -o '"uptime":[0-9]*' | cut -d: -f2)s"
    else
        echo -e "${RED}Backend: DOWN${NC}"
    fi

    # Check nginx
    if docker-compose exec -T nginx nginx -t > /dev/null 2>&1; then
        echo -e "${GREEN}Nginx: HEALTHY${NC}"
    else
        echo -e "${RED}Nginx: CONFIG ERROR${NC}"
    fi

    echo ""
}

# Update and redeploy
update() {
    log "Updating OBELISK..."

    # Pull latest code (if git repo)
    if [ -d .git ]; then
        git pull origin main
    fi

    # Rebuild and restart
    docker-compose build --no-cache backend
    docker-compose up -d backend

    log "Update complete!"
    status
}

# Backup database
backup() {
    local BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).db"
    log "Creating backup: ${BACKUP_FILE}"

    cp obelisk-backend/obelisk.db "backups/${BACKUP_FILE}"

    log "Backup created: backups/${BACKUP_FILE}"
}

# Main
case "${1:-help}" in
    setup)   setup ;;
    ssl)     ssl ;;
    start)   start ;;
    stop)    stop ;;
    restart) restart ;;
    logs)    logs "$2" ;;
    status)  status ;;
    update)  update ;;
    backup)  backup ;;
    *)
        echo ""
        echo -e "${BLUE}OBELISK Deployment Script${NC}"
        echo ""
        echo "Usage: ./deploy.sh [command]"
        echo ""
        echo "Commands:"
        echo "  setup    - Initial setup (create .env, directories)"
        echo "  ssl      - Obtain Let's Encrypt SSL certificate"
        echo "  start    - Start all services"
        echo "  stop     - Stop all services"
        echo "  restart  - Restart all services"
        echo "  logs     - Show logs (optional: service name)"
        echo "  status   - Show service status"
        echo "  update   - Pull updates and redeploy"
        echo "  backup   - Backup database"
        echo ""
        echo "Environment variables:"
        echo "  OBELISK_DOMAIN - Your domain (default: obelisk.example.com)"
        echo "  OBELISK_EMAIL  - Email for SSL cert (default: admin@example.com)"
        echo ""
        ;;
esac

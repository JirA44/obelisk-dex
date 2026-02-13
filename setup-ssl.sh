#!/bin/bash
# OBELISK SSL Setup Script
# Usage: ./setup-ssl.sh yourdomain.com [email@example.com]

set -e

DOMAIN=$1
EMAIL=${2:-"admin@$DOMAIN"}

if [ -z "$DOMAIN" ]; then
    echo "Usage: ./setup-ssl.sh yourdomain.com [email@example.com]"
    echo ""
    echo "Example:"
    echo "  ./setup-ssl.sh obelisk.app contact@obelisk.app"
    exit 1
fi

echo "╔══════════════════════════════════════════════════════════╗"
echo "║           OBELISK SSL Setup                              ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "Domain: $DOMAIN"
echo "Email:  $EMAIL"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root (sudo ./setup-ssl.sh $DOMAIN)"
    exit 1
fi

# Check dependencies
echo "[1/6] Checking dependencies..."
apt-get update -qq
apt-get install -y -qq nginx certbot python3-certbot-nginx

# Create nginx config
echo "[2/6] Configuring Nginx..."
NGINX_CONF="/etc/nginx/sites-available/obelisk"

# Replace domain in nginx.conf
sed "s/obelisk.example.com/$DOMAIN/g" ./nginx.conf > $NGINX_CONF

# Enable site
ln -sf $NGINX_CONF /etc/nginx/sites-enabled/obelisk

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t

# Create webroot for certbot
echo "[3/6] Preparing for SSL certificate..."
mkdir -p /var/www/certbot
mkdir -p /var/www/obelisk

# Temporarily start with HTTP only for certbot
echo "[4/6] Obtaining SSL certificate..."

# Create temporary HTTP-only config for certbot
cat > /etc/nginx/sites-available/obelisk-temp << EOF
server {
    listen 80;
    server_name $DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 'Obelisk is setting up SSL...';
        add_header Content-Type text/plain;
    }
}
EOF

ln -sf /etc/nginx/sites-available/obelisk-temp /etc/nginx/sites-enabled/obelisk
systemctl reload nginx

# Get certificate
certbot certonly --webroot -w /var/www/certbot \
    -d $DOMAIN \
    --email $EMAIL \
    --agree-tos \
    --non-interactive

# Restore full config
echo "[5/6] Activating HTTPS..."
ln -sf $NGINX_CONF /etc/nginx/sites-enabled/obelisk
rm /etc/nginx/sites-available/obelisk-temp
systemctl reload nginx

# Setup auto-renewal
echo "[6/6] Setting up auto-renewal..."
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'") | crontab -

# Copy frontend files
echo ""
echo "Copying frontend files..."
cp -r ./obelisk-dex/* /var/www/obelisk/ 2>/dev/null || echo "(Frontend files will need to be deployed separately)"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║           SSL SETUP COMPLETE!                            ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  HTTPS:  https://$DOMAIN"
echo "║  API:    https://$DOMAIN/api/"
echo "║  WS:     wss://$DOMAIN/ws"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "  1. Start the backend: cd obelisk-backend && npm start"
echo "  2. Update .env with ALLOWED_ORIGINS=https://$DOMAIN"
echo "  3. Set SENTRY_DSN in .env for error tracking"
echo ""

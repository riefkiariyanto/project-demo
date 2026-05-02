#!/bin/bash
set -e

echo "🚀 Starting Railway deployment..."

php artisan config:cache
php artisan route:cache  
php artisan view:cache

echo "🗄️  Running migrations..."
php artisan migrate --force

echo "🌱 Running seeders..."
php artisan db:seed --force

php artisan storage:link || true
php artisan optimize

echo "✅ Starting FrankenPHP..."
exec frankenphp run --config /etc/caddy/Caddyfile
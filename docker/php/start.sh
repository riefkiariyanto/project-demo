#!/bin/bash
set -e

echo "🚀 Starting deployment setup..."

# Generate app key if not set
if [ -z "$APP_KEY" ]; then
    echo "⚠️  APP_KEY not set, generating..."
    php artisan key:generate --force
fi

# Cache config
echo "📦 Caching config..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations
echo "🗄️  Running migrations..."
php artisan migrate --force

# Create storage link
echo "🔗 Creating storage link..."
php artisan storage:link || true

# Optimize
echo "⚡ Optimizing..."
php artisan optimize

echo "✅ Setup complete!"

# Configure nginx port
export PORT=${PORT:-80}
echo "🌐 Configuring nginx on port $PORT..."
envsubst '${PORT}' < /etc/nginx/conf.d/default.conf > /tmp/nginx.conf
cp /tmp/nginx.conf /etc/nginx/conf.d/default.conf
echo "✅ Nginx will listen on port $PORT"
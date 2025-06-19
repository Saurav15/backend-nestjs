#!/bin/sh
echo "🛠 Running migrations for NODE_ENV: $NODE_ENV"
# Run migrations based on NODE_ENV
if [ "$NODE_ENV" = "production" ]; then
    echo "📦 Running production migrations..."
    npm run migration:run:prod
elif [ "$NODE_ENV" = "development" ]; then
    echo "🔧 Running development migrations..."
    npm run migration:run:dev
else
    echo "⚠️  NODE_ENV not set or invalid. Defaulting to development..."
    npm run migration:run:dev
fi
echo "🚀 Starting app: $@"
exec "$@"
: $@"
exec "$@"

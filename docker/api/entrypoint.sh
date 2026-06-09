#!/bin/sh
set -e

mkdir -p /app/uploads
chown -R nextjs:nodejs /app/uploads

echo "Running database migrations..."
su-exec nextjs npx prisma migrate deploy

echo "Seeding database..."
su-exec nextjs npx tsx prisma/seed.ts || true

echo "Starting API server..."
exec su-exec nextjs "$@"

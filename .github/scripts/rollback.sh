#!/bin/bash
set -e

PREVIOUS_SHA=$1

if [ -z "$PREVIOUS_SHA" ]; then
  echo "❌ Usage: ./rollback.sh <previous_sha>"
  exit 1
fi

echo "🔄 Rollback vers $PREVIOUS_SHA..."

docker pull ghcr.io/$GITHUB_REPOSITORY-backend:$PREVIOUS_SHA
docker pull ghcr.io/$GITHUB_REPOSITORY-frontend:$PREVIOUS_SHA

BACKEND_IMAGE=ghcr.io/$GITHUB_REPOSITORY-backend:$PREVIOUS_SHA \
FRONTEND_IMAGE=ghcr.io/$GITHUB_REPOSITORY-frontend:$PREVIOUS_SHA \
docker compose up -d --no-build

echo "✅ Rollback terminé vers $PREVIOUS_SHA"
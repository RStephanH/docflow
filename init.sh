#!/usr/bin/env bash
# Local development bootstrap only: never run this against Atlas or any shared database.
set -euo pipefail

if [ ! -f .env ]; then
  {
    echo "JWT_SECRET=$(openssl rand -hex 32)"
    echo "PDF_SERVICE_TOKEN=$(openssl rand -hex 32)"
    echo "DEMO_ADMIN_PASSWORD=$(openssl rand -hex 12)"
  } > .env
  echo "Created .env with random secrets"
fi

docker compose up --build -d --wait

docker compose exec -T mongo mongosh pdfgen --quiet --eval "
  db.documents.createIndex({ createdAt: -1 }, { name: 'idx_createdAt' });
  db.documents.createIndex({ title: 'text' }, { name: 'idx_title_text' });
  print('indexes ready');
"

echo "DocFlow ready: http://localhost:8080 (API: http://localhost:3000)"
echo "Login: admin@docflow.fr / password in .env (DEMO_ADMIN_PASSWORD)"

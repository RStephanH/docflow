#!/bin/bash

BASE_URL="http://localhost:3000"

echo "🔐 Login..."

# 1️⃣ Récupérer le token
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@docflow.fr","password":"admin123"}')

# 2️⃣ Extraire le token (sans jq)
TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Erreur: impossible de récupérer le token"
  echo "Response: $RESPONSE"
  exit 1
fi

echo "✅ Token récupéré"

# 3️⃣ Test génération documents (circuit breaker / load)
echo "🚀 Génération de documents..."

for i in {1..10}; do
  curl -s -X POST "$BASE_URL/api/documents/generate" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"title\":\"Doc $i\",\"content\":\"Test circuit breaker\"}" \
    --output /dev/null

  echo "Doc $i envoyé"
done

# 4️⃣ Test pagination
echo "📄 Test pagination..."

curl -s -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/api/documents?page=1&limit=5" | jq '.' 2>/dev/null || echo "jq non installé"

# 5️⃣ Test metrics
echo "📊 Metrics..."

curl -s -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/api/metrics" | jq '.' 2>/dev/null || echo "jq non installé"

echo "✅ Test terminé"
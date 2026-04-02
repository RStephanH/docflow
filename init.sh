#!/bin/bash
set -e

echo "🚀 DocFlow — Initialisation"

# 1. Build et démarrage
echo "📦 Build des conteneurs..."
docker compose down --volumes
docker compose up --build -d

# 2. Attendre que MongoDB soit healthy
echo "⏳ Attente MongoDB..."
until docker compose exec mongo mongosh --eval "db.adminCommand('ping')" --quiet 2>/dev/null; do
  sleep 2
done
echo "✅ MongoDB prêt"

# 3. Attendre que le backend soit healthy
echo "⏳ Attente backend..."
until curl -sf http://localhost:80/health > /dev/null 2>&1; do
  sleep 2
done
echo "✅ Backend prêt"

# 4. Seed 1000 utilisateurs
echo "🌱 Seed 1000 utilisateurs..."
docker compose exec mongo mongosh pdfgen --eval "
  db.users.deleteMany({});
  const users = [];
  const roles = ['user', 'admin', 'manager'];
  const depts = ['RH', 'Finance', 'IT', 'Legal', 'Operations'];
  for (let i = 1; i <= 1000; i++) {
    users.push({
      _id: new ObjectId(),
      email: 'user' + i + '@docflow.fr',
      name: 'Utilisateur ' + i,
      role: roles[i % roles.length],
      department: depts[i % depts.length],
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      active: Math.random() > 0.1
    });
  }
  db.users.insertMany(users);
  print('✅ ' + db.users.countDocuments() + ' utilisateurs insérés');
"

# 5. Migrations — index de performance
echo "🔧 Migrations MongoDB..."
docker compose exec mongo mongosh pdfgen --eval "
  db.documents.createIndex({ createdAt: -1 }, { name: 'idx_createdAt' });
  db.documents.createIndex({ title: 'text' }, { name: 'idx_title_text' });
  db.users.createIndex({ email: 1 }, { unique: true, name: 'idx_email_unique' });
  db.users.createIndex({ department: 1, role: 1 }, { name: 'idx_dept_role' });
  print('✅ Index créés');
"

echo ""
echo "✅ DocFlow prêt sur http://localhost:80"
echo "   Login : admin@docflow.fr / admin123"
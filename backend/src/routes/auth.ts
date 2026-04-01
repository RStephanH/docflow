import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'docflow-secret-dev';

// Utilisateurs mock — en prod, remplacer par une vraie BDD
const MOCK_USERS = [
  { email: 'admin@docflow.fr', password: 'admin123', role: 'admin' },
  { email: 'user@docflow.fr',  password: 'user123',  role: 'user'  },
];

// POST /auth/login
router.post('/login', (req: Request, res: Response): void => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email et mot de passe requis' });
    return;
  }

  const user = MOCK_USERS.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    res.status(401).json({ error: 'Identifiants incorrects' });
    return;
  }

  const token = jwt.sign(
    { email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({ token, email: user.email, role: user.role });
});

export default router;
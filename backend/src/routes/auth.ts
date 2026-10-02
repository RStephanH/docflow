import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { createHash, timingSafeEqual } from 'node:crypto';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET;
const DEMO_ADMIN_PASSWORD = process.env.DEMO_ADMIN_PASSWORD;
const DEMO_USER_PASSWORD = process.env.DEMO_USER_PASSWORD;

// Fail fast at startup instead of silently running with weak defaults
if (!JWT_SECRET || !DEMO_ADMIN_PASSWORD || !DEMO_USER_PASSWORD) {
  throw new Error('JWT_SECRET, DEMO_ADMIN_PASSWORD and DEMO_USER_PASSWORD are required');
}

// Demo accounts only: passwords come from the environment, never from Git
const DEMO_USERS = [
  { email: 'admin@docflow.fr', password: DEMO_ADMIN_PASSWORD, role: 'admin' },
  { email: 'user@docflow.fr', password: DEMO_USER_PASSWORD, role: 'user' },
];

// Constant-time comparison: hash both sides so lengths always match
const sha256 = (value: string): Buffer => createHash('sha256').update(value).digest();
const safeEqual = (a: string, b: string): boolean => timingSafeEqual(sha256(a), sha256(b));

// POST /auth/login
router.post('/login', (req: Request, res: Response): void => {
  const { email, password } = req.body ?? {};

  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    res.status(400).json({ error: 'Email et mot de passe requis' });
    return;
  }

  const user = DEMO_USERS.find((u) => u.email === email);

  if (!user || !safeEqual(password, user.password)) {
    res.status(401).json({ error: 'Identifiants incorrects' });
    return;
  }

  const token = jwt.sign({ email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: '8h',
  });

  res.json({ token, email: user.email, role: user.role });
});

export default router;

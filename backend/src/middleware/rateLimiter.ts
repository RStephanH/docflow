import rateLimit from 'express-rate-limit'

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de requêtes, réessaie dans 15 minutes.' },
})
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,                    // v8 name for "max"
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // only failed attempts count
  message: { error: 'Trop de tentatives de connexion, réessaie dans 15 minutes.' },
})
// Each generated PDF is stored for good: cap how many one client can create per hour
export const generateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Limite de génération atteinte, réessaie dans une heure.' },
})

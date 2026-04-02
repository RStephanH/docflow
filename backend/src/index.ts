import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { z } from 'zod'
import documentsRouter from './routes/documents'
import authRouter from './routes/auth'
import { authMiddleware } from './middleware/auth'
import { rateLimiter } from './middleware/rateLimiter'
import metricsRouter from './routes/metrics'
import { requestLogger } from './middleware/logger'
import logger from './config/logger'

dotenv.config()

// ── Validation des variables d'environnement ──────────────────────────────
const EnvSchema = z.object({
  PORT:        z.string().default('3000'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI est requis'),
  JWT_SECRET:  z.string().default('docflow-secret-dev'),
  LOG_LEVEL:   z.string().default('info'),
  NODE_ENV:    z.string().default('development'),
})

const envParsed = EnvSchema.safeParse(process.env)
if (!envParsed.success) {
  console.error('❌ Variables d\'environnement invalides :')
  console.error(z.treeifyError(envParsed.error))
  process.exit(1)
}

const ENV = envParsed.data

// ── App ───────────────────────────────────────────────────────────────────
const app = express()
app.set('trust proxy', 1)  // ← AJOUT — fait confiance à Nginx

app.use(express.json())
app.use(requestLogger)
app.use(rateLimiter)

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  if (req.method === 'OPTIONS') { res.sendStatus(204); return }
  next()
})

// Health check — non protégé
app.get('/health', (req, res) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState })
})

// Auth — non protégé
app.use('/auth', authRouter)

// Routes protégées JWT
app.use('/api', authMiddleware)
app.use('/api/metrics',   metricsRouter)
app.use('/api/documents', documentsRouter)

// ── MongoDB + démarrage ───────────────────────────────────────────────────
mongoose
  .connect(ENV.MONGODB_URI)
  .then(() => {
    logger.info('MongoDB connecté')
    app.listen(parseInt(ENV.PORT), () => {
      logger.info('Serveur démarré', { port: ENV.PORT, env: ENV.NODE_ENV })
    })
  })
  .catch((err) => {
    logger.error('Erreur MongoDB', { message: err.message })
    process.exit(1)
  })
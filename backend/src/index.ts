import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import documentsRouter from './routes/documents'
import authRouter from './routes/auth';
import { authMiddleware } from './middleware/auth';
import { rateLimiter } from './middleware/rateLimiter'  
import metricsRouter from './routes/metrics'             

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo:27017/pdfgen'

app.use(express.json())
app.use(rateLimiter)  // ← ajout du rate limiter

// CORS — autorise Authorization pour le JWT
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')  // ← ajout Authorization
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')   // ← ajout OPTIONS
  if (req.method === 'OPTIONS') {                                             // ← preflight
    res.sendStatus(204)
    return
  }
  next()
})

// Health check — non protégé
app.get('/health', (req, res) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState })
})

// Auth — non protégé
app.use('/auth', authRouter)

// Toutes les routes /api/* sont protégées par JWT
app.use('/api', authMiddleware)
app.use('/api/metrics', metricsRouter)    
app.use('/api/documents', documentsRouter)
app.use('/api/documents', documentsRouter)

// Connexion MongoDB puis démarrage serveur
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connecté')
    app.listen(PORT, () => {
      console.log(`✅ Serveur démarré sur le port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error('❌ Erreur MongoDB :', err.message)
    process.exit(1)
  })
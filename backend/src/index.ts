import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo:27017/pdfgen'

app.use(express.json())

// CORS simple — autorise le frontend à appeler l'API
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE')
  next()
})

// Health check — pour vérifier que le serveur tourne
app.get('/health', (req, res) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState })
})

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
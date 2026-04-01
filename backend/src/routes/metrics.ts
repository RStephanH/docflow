import { Router, Request, Response } from 'express'
import mongoose from 'mongoose'
import DocumentModel from '../models/Document'

const router = Router()

const startTime = Date.now()
let totalErrors = 0
let totalGenerationMs = 0
let totalGenerations = 0

// Exporté pour être incrémenté depuis d'autres services
export const recordGeneration = (ms: number) => {
  totalGenerations++
  totalGenerationMs += ms
}
export const recordError = () => { totalErrors++ }

// GET /api/metrics
router.get('/', async (req: Request, res: Response) => {
  try {
    const totalDocs = await DocumentModel.countDocuments()
    res.json({
      totalDocs,
      totalErrors,
      uptime: Math.floor((Date.now() - startTime) / 1000),
      dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      avgGenerationMs: totalGenerations > 0
        ? Math.round(totalGenerationMs / totalGenerations)
        : 0,
    })
  } catch {
    res.status(500).json({ error: 'Erreur métriques' })
  }
})

export default router
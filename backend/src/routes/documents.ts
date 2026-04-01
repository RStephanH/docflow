import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { generatePdf } from '../services/pdfService'
import DocumentModel from '../models/Document'

const router = Router()

// Schéma de validation
const CreateDocumentSchema = z.object({
  title:   z.string().min(1, 'Le titre est requis'),
  content: z.string().min(1, 'Le contenu est requis'),
})

// POST /api/documents
router.post('/', async (req: Request, res: Response) => {
  try {
    // 1. Validation
    const parsed = CreateDocumentSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() })
    }

    const { title, content } = parsed.data

    // 2. Génération PDF
    const pdfBuffer = await generatePdf({ title, content })

    // 3. Sauvegarde en base
    const doc = await DocumentModel.create({ title, content })

    // 4. Retourne le PDF directement en binaire
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${doc.id}.pdf"`,
      'X-Document-Id': doc.id,
    })

    return res.send(pdfBuffer)

  } catch (err) {
    console.error('Erreur génération PDF :', err)
    return res.status(500).json({ error: 'Erreur interne' })
  }
})

// GET /api/documents
router.get('/', async (req: Request, res: Response) => {
  const docs = await DocumentModel.find().sort({ createdAt: -1 })
  return res.json(docs)
})

export default router
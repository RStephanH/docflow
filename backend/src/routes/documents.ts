import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { generatePdf } from '../services/pdfService'
import DocumentModel from '../models/Document'
import { recordGeneration, recordError } from './metrics'
import { signDocument } from '../services/signatureService'

const router = Router()

const CreateDocumentSchema = z.object({
  title:   z.string().min(1, 'Le titre est requis'),
  content: z.string().min(1, 'Le contenu est requis'),
})

// POST /api/documents/generate
router.post('/generate', async (req: Request, res: Response) => {
  const start = Date.now()  // ← ajout
  try {
    const parsed = CreateDocumentSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ errors: z.treeifyError(parsed.error) })
    }

    const { title, content } = parsed.data
    const pdfBuffer = await generatePdf({ title, content })
    const doc = await DocumentModel.create({ title, content })

    // Signature asynchrone — on ne bloque pas la réponse PDF
signDocument(doc.id)
  .then(sig => console.log(`[Signature] Doc ${doc.id} signé : ${sig}`))
  .catch(err => console.error(`[Signature] Doc ${doc.id} : ${err.message}`))

    recordGeneration(Date.now() - start)  // ← ajout

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${doc.id}.pdf"`,
      'X-Document-Id': doc.id,
    })
    return res.send(pdfBuffer)

  } catch (err) {
    recordError()  // ← ajout
    console.error('Erreur génération PDF :', err)
    return res.status(500).json({ error: 'Erreur interne' })
  }
})

// GET /api/documents?page=1&limit=10
router.get('/', async (req: Request, res: Response) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page  as string) || 1)
    const limit = Math.min(50, parseInt(req.query.limit as string) || 10)
    const skip  = (page - 1) * limit

    const [docs, total] = await Promise.all([
      DocumentModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      DocumentModel.countDocuments(),
    ])

    return res.json({
      docs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err) {
    console.error('Erreur listing documents :', err)
    return res.status(500).json({ error: 'Erreur interne' })
  }
})

export default router
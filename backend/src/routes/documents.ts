import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { generatePdf } from '../services/pdfService'
import { uploadPdf, downloadPdf } from '../services/storageService'
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
  const start = Date.now()
  try {
    const parsed = CreateDocumentSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ errors: z.treeifyError(parsed.error) })
    }

    const { title, content } = parsed.data

    // 1. Génération PDF
    const pdfBuffer = await generatePdf({ title, content })

    // 2. Upload GridFS
    const fileId = await uploadPdf(pdfBuffer, `${title}-${Date.now()}.pdf`)

    // 3. Sauvegarde en base avec fileId
    const doc = await DocumentModel.create({
      title,
      content,
      fileId: fileId.toString()
    })

    recordGeneration(Date.now() - start)

    // 4. Signature asynchrone
    signDocument(doc.id)
      .then(sig => console.log(`[Signature] Doc ${doc.id} signé : ${sig}`))
      .catch(err => console.error(`[Signature] Doc ${doc.id} : ${err.message}`))

    // 5. Retourne les métadonnées + lien download
    return res.status(201).json({
      id:        doc.id,
      title:     doc.title,
      fileId:    doc.fileId,
      createdAt: doc.createdAt,
      downloadUrl: `/api/documents/${doc.id}/download`
    })

  } catch (err) {
    recordError()
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

    return res.json({ docs, total, page, totalPages: Math.ceil(total / limit) })
  } catch (err) {
    recordError()
    return res.status(500).json({ error: 'Erreur interne' })
  }
})

// GET /api/documents/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const doc = await DocumentModel.findById(req.params.id)
    if (!doc) return res.status(404).json({ error: 'Document introuvable' })

    return res.json({
      id:          doc.id,
      title:       doc.title,
      content:     doc.content,
      fileId:      doc.fileId,
      createdAt:   doc.createdAt,
      downloadUrl: doc.fileId ? `/api/documents/${doc.id}/download` : null
    })
  } catch {
    return res.status(500).json({ error: 'Erreur interne' })
  }
})

// GET /api/documents/:id/download
router.get('/:id/download', async (req: Request, res: Response) => {
  try {
    const doc = await DocumentModel.findById(req.params.id)
    if (!doc) return res.status(404).json({ error: 'Document introuvable' })
    if (!doc.fileId) return res.status(404).json({ error: 'Fichier PDF introuvable' })

    res.set({
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="${doc.title}.pdf"`,
    })

    const downloadStream = downloadPdf(doc.fileId)
    downloadStream.pipe(res)

    downloadStream.on('error', () => {
      res.status(500).json({ error: 'Erreur téléchargement' })
    })

  } catch {
    return res.status(500).json({ error: 'Erreur interne' })
  }
})

export default router
import mongoose, { Schema, Document } from 'mongoose'

export interface IDocument extends Document {
  title: string
  content: string
  fileId?: string   // ← référence GridFS
  createdAt: Date
  updatedAt: Date
}

const DocumentSchema = new Schema<IDocument>(
  {
    title:   { type: String, required: true },
    content: { type: String, required: true },
    fileId:  { type: String, default: null },  // ← ajout
  },
  { timestamps: true }
)

export default mongoose.model<IDocument>('Document', DocumentSchema)
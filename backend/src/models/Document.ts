import mongoose, { Schema, Document as MongoDocument } from 'mongoose'

export interface IDocument extends MongoDocument {
  title: string
  content: string
  createdAt: Date
}

const DocumentSchema = new Schema<IDocument>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
)

export default mongoose.model<IDocument>('Document', DocumentSchema)
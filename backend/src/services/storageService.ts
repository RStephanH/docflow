import mongoose from 'mongoose'
import { GridFSBucket, ObjectId } from 'mongodb'
import { Readable } from 'stream'

let bucket: GridFSBucket | null = null

const getBucket = (): GridFSBucket => {
  if (!bucket) {
    bucket = new GridFSBucket(mongoose.connection.db!, {
      bucketName: 'pdfs'
    })
  }
  return bucket
}

// Upload un buffer PDF dans GridFS — retourne le fileId
export const uploadPdf = (buffer: Buffer, filename: string): Promise<ObjectId> => {
  return new Promise((resolve, reject) => {
    const b = getBucket()
    const uploadStream = b.openUploadStream(filename, {
  metadata: { contentType: 'application/pdf' }
})

    const readable = Readable.from(buffer)
    readable.pipe(uploadStream)

    uploadStream.on('finish', () => resolve(uploadStream.id as ObjectId))
    uploadStream.on('error', reject)
  })
}

// Télécharge un PDF depuis GridFS — retourne un stream
export const downloadPdf = (fileId: string) => {
  const b = getBucket()
  return b.openDownloadStream(new ObjectId(fileId))
}

// Supprime un PDF de GridFS
export const deletePdf = async (fileId: string): Promise<void> => {
  const b = getBucket()
  await b.delete(new ObjectId(fileId))
}
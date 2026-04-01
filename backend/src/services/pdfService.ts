import htmlPdf from 'html-pdf-node'

interface PdfData {
  title: string
  content: string
}

export const generatePdf = async (data: PdfData): Promise<Buffer> => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          h1   { color: #1a1a2e; border-bottom: 2px solid #eee; padding-bottom: 12px; }
          p    { line-height: 1.7; }
        </style>
      </head>
      <body>
        <h1>${data.title}</h1>
        <p>${data.content}</p>
      </body>
    </html>
  `

  const file = { content: html }
  const options = {
  format: 'A4' as const,
  printBackground: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
}

  const buffer = await htmlPdf.generatePdf(file, options)
  return buffer as Buffer
}
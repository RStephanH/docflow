interface PdfData {
  title: string
  content: string
}

// Turn user text into inert text: "<" becomes "&lt;", so it can't become markup.
const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

export const generatePdf = async (data: PdfData): Promise<Buffer> => {
  const hostPort = process.env.PDF_SERVICE_HOSTPORT
  const token = process.env.PDF_SERVICE_TOKEN
  if (!hostPort || !token) {
    throw new Error('PDF service is not configured')
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          h1 { color: #1a1a2e; border-bottom: 2px solid #eee; padding-bottom: 12px; }
          p { line-height: 1.7; white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(data.title)}</h1>
        <p>${escapeHtml(data.content)}</p>
      </body>
    </html>
  `

  const res = await fetch(`http://${hostPort}/render`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-service-token': token,
    },
    body: JSON.stringify({ html }),
    signal: AbortSignal.timeout(20_000), // never wait forever on the PDF service
  })

  if (!res.ok) {
    throw new Error(`PDF service responded with ${res.status}`)
  }

  return Buffer.from(await res.arrayBuffer())
}

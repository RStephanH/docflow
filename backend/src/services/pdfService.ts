import puppeteer from 'puppeteer-core'

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
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #333;
          }

          h1 {
            color: #1a1a2e;
            border-bottom: 2px solid #eee;
            padding-bottom: 12px;
          }

          p {
            line-height: 1.7;
          }
        </style>
      </head>
      <body>
        <h1>${data.title}</h1>
        <p>${data.content}</p>
      </body>
    </html>
  `

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  })

  try {
    const page = await browser.newPage()

    await page.setContent(html, {
      waitUntil: 'load',
    })

    const buffer = await page.pdf({
      format: 'A4',
      printBackground: true,
    })

    return Buffer.from(buffer)
  } finally {
    await browser.close()
  }
}

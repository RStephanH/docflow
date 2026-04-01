declare module 'html-pdf-node' {
  interface File {
    content?: string
    url?: string
  }

  interface Options {
    format?: 'A4' | 'A3' | 'Letter'
    printBackground?: boolean
    args?: string[]
  }

  function generatePdf(file: File, options?: Options): Promise<Buffer>

  export { generatePdf, File, Options }
}
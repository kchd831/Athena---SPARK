export const extractFromPDF = async (file: File): Promise<string> => {
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
  
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  
  let text = ''
  for (let i = 1; i <= Math.min(pdf.numPages, 20); i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items.map((item: any) => item.str).join(' ')
    text += pageText + '\n'
  }
  return text.trim().slice(0, 8000)
}

export const extractFromWord = async (file: File): Promise<string> => {
  const mammoth = await import('mammoth')
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value.trim().slice(0, 8000)
}

export const extractFromFile = async (file: File): Promise<string> => {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return extractFromPDF(file)
  if (ext === 'docx' || ext === 'doc') return extractFromWord(file)
  throw new Error('不支持的文件格式，请上传 PDF 或 Word 文件')
}
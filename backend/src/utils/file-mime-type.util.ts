export function getMimeType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop() || ''
  switch (ext) {
    case 'pdf':
      return 'application/pdf'
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    case 'epub':
      return 'application/epub+zip'
    case 'html':
    case 'htm':
      return 'text/html'
    case 'md':
    case 'markdown':
      return 'text/markdown'
    case 'txt':
    default:
      return 'text/plain'
  }
}

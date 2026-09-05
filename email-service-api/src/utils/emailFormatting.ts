export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function textToHtml(text: string): string {
  const safe = escapeHtml(text || '')
  // Split on blank lines into paragraphs, preserve single-line breaks as <br/>
  const paragraphs = safe.split(/\r?\n\s*\r?\n/).map(p => p.replace(/\r?\n/g, '<br/>'))
  return paragraphs.map(p => `<p>${p}</p>`).join('')
}


export default { escapeHtml, textToHtml }

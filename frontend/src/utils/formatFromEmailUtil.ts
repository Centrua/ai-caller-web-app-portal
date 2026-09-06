export function formatFromEmail(from: any): string {
  if (!from) return 'Unknown'
  const first = Array.isArray(from) ? from[0] : from
  if (!first) return 'Unknown'

  if (typeof first === 'object' && first !== null) {
    if (first.email) return first.email
    if (first.name) return first.name
    return JSON.stringify(first)
  }

  if (typeof first === 'string') {
    const match = first.match(/<([^>]+)>/)
    if (match && match[1]) {
      return match[1]
    }
    return first.trim()
  }

  return String(first)
}
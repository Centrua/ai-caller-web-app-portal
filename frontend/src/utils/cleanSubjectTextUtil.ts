export function cleanSubject(subject?: string): string {
    if (!subject) return 'No Subject'
    let cleaned = subject
    const rePattern = /^(?:re:\s*)+/i
    while (rePattern.test(cleaned)) {
        cleaned = cleaned.replace(rePattern, '')
    }
    return cleaned.trim() || 'No Subject'
}
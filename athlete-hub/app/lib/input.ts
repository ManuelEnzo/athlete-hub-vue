export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function sanitizeString(input: unknown): string {
  if (input == null)
    return ''
  const s = String(input)
  return escapeHtml(s)
}

export function isEmail(value: string): boolean {
  // simple regex, good for client-side validation only
  return /^[^@\s]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(value)
}

export function isNotEmpty(value: unknown): boolean {
  if (value == null)
    return false
  if (typeof value === 'string')
    return value.trim().length > 0
  if (Array.isArray(value))
    return value.length > 0
  if (typeof value === 'object')
    return Object.keys(value).length > 0
  return true
}

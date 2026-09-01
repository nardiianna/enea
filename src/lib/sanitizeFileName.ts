/**
 * Supabase Storage rejects keys containing accented letters, and some
 * punctuation ("Invalid key" on upload) even though the File's original
 * name allows them (e.g. "Atelier d'architettura.png"). Strip everything
 * outside a safe ASCII set before building a storage path.
 */
export function sanitizeFileName(name: string): string {
  const dot = name.lastIndexOf('.')
  const base = dot > 0 ? name.slice(0, dot) : name
  const ext = dot > 0 ? name.slice(dot).replace(/[^a-zA-Z0-9.]/g, '') : ''
  const combiningMarks = new RegExp('[\\u0300-\\u036f]', 'g')
  const safeBase = base
    .normalize('NFD')
    .replace(combiningMarks, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return (safeBase || 'file') + ext
}

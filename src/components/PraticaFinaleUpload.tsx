import { useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Props {
  praticaId: string
  path: string | null
  onChange: (path: string | null) => void
}

export function PraticaFinaleUpload({ praticaId, path, onChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function persist(newPath: string | null) {
    await supabase.from('pratiche').update({ pratica_finale_path: newPath }).eq('id', praticaId)
    onChange(newPath)
  }

  async function handleUpload(fileList: FileList | null) {
    const file = fileList?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    const newPath = `${praticaId}/pratica-finale/${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage.from('fatture').upload(newPath, file)
    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }
    if (path) await supabase.storage.from('fatture').remove([path])
    await persist(newPath)
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleRemove() {
    if (!path) return
    await supabase.storage.from('fatture').remove([path])
    await persist(null)
  }

  async function handleDownload() {
    if (!path) return
    const { data, error } = await supabase.storage.from('fatture').createSignedUrl(path, 60)
    if (!error && data) window.open(data.signedUrl, '_blank')
  }

  const filename = path?.split('/').pop()?.replace(/^\d+-/, '')

  return (
    <div className="rounded border border-gray-200 dark:border-gray-700 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Pratica finale</h3>
        {!path && (
          <label className="rounded bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 text-xs font-medium cursor-pointer">
            {uploading ? 'Caricamento...' : '+ Carica pratica finale'}
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              disabled={uploading}
              onChange={(e) => handleUpload(e.target.files)}
            />
          </label>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {path ? (
        <div className="flex items-center justify-between text-sm">
          <button onClick={handleDownload} className="text-brand-700 hover:underline text-left truncate max-w-xs">
            {filename}
          </button>
          <button onClick={handleRemove} className="text-xs text-red-600">
            Rimuovi
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-500">Nessuna pratica finale allegata ancora.</p>
      )}
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

interface FileRow {
  name: string
  id: string
  created_at: string
}

export function FileManager({ praticaId }: { praticaId: string }) {
  const [files, setFiles] = useState<FileRow[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function loadFiles() {
    const { data, error } = await supabase.storage.from('fatture').list(praticaId, {
      sortBy: { column: 'created_at', order: 'desc' },
    })
    if (!error) setFiles((data ?? []) as unknown as FileRow[])
    setLoading(false)
  }

  useEffect(() => {
    loadFiles()
  }, [praticaId])

  async function handleUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    setUploading(true)
    setError(null)
    for (const file of Array.from(fileList)) {
      const path = `${praticaId}/${Date.now()}-${file.name}`
      const { error } = await supabase.storage.from('fatture').upload(path, file)
      if (error) setError(error.message)
    }
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
    loadFiles()
  }

  async function handleDelete(name: string) {
    await supabase.storage.from('fatture').remove([`${praticaId}/${name}`])
    loadFiles()
  }

  async function handleDownload(name: string) {
    const { data, error } = await supabase.storage.from('fatture').createSignedUrl(`${praticaId}/${name}`, 60)
    if (!error && data) window.open(data.signedUrl, '_blank')
  }

  return (
    <div className="rounded border border-gray-200 dark:border-gray-700 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Fatture e documenti</h3>
        <label className="rounded bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 text-xs font-medium cursor-pointer">
          {uploading ? 'Caricamento...' : '+ Carica file'}
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleUpload(e.target.files)}
          />
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-500">Caricamento...</p>
      ) : files.length === 0 ? (
        <p className="text-sm text-gray-500">Nessun file caricato ancora.</p>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {files.map((f) => (
            <li key={f.id} className="flex items-center justify-between py-2 text-sm">
              <button onClick={() => handleDownload(f.name)} className="text-brand-700 hover:underline text-left truncate max-w-xs">
                {f.name.replace(/^\d+-/, '')}
              </button>
              <button onClick={() => handleDelete(f.name)} className="text-xs text-red-600">
                Elimina
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

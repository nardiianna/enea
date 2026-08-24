import { useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

export type PraticaFinaleSlotKey = 'enea' | 'ricevuta' | 'dichiarazione'

const SLOT_LABELS: Record<PraticaFinaleSlotKey, string> = {
  enea: 'Pratica ENEA',
  ricevuta: 'Ricevuta',
  dichiarazione: 'Dichiarazione del fornitore',
}

const SLOT_ORDER: PraticaFinaleSlotKey[] = ['enea', 'ricevuta', 'dichiarazione']

interface Props {
  praticaId: string
  paths: Partial<Record<PraticaFinaleSlotKey, string | null>>
  onChange: (key: PraticaFinaleSlotKey, path: string | null) => void
}

export function PraticaFinaleUpload({ praticaId, paths, onChange }: Props) {
  return (
    <div className="rounded border border-gray-200 dark:border-gray-700 p-4 space-y-3">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Pratica finale</h3>
      {SLOT_ORDER.map((key) => (
        <FinalDocSlot
          key={key}
          praticaId={praticaId}
          slotKey={key}
          path={paths[key] ?? null}
          onChange={(path) => onChange(key, path)}
        />
      ))}
    </div>
  )
}

interface SlotProps {
  praticaId: string
  slotKey: PraticaFinaleSlotKey
  path: string | null
  onChange: (path: string | null) => void
}

function FinalDocSlot({ praticaId, slotKey, path, onChange }: SlotProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleUpload(fileList: FileList | null) {
    const file = fileList?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    const newPath = `${praticaId}/pratica-finale/${slotKey}/${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage.from('fatture').upload(newPath, file)
    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }
    if (path) await supabase.storage.from('fatture').remove([path])
    onChange(newPath)
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleRemove() {
    if (!path) return
    await supabase.storage.from('fatture').remove([path])
    onChange(null)
  }

  async function handleDownload() {
    if (!path) return
    const preview = window.open('', '_blank', 'noopener,noreferrer')
    const { data, error } = await supabase.storage.from('fatture').createSignedUrl(path, 60)
    if (!error && data && preview) preview.location.href = data.signedUrl
    else preview?.close()
  }

  const filename = path?.split('/').pop()?.replace(/^\d+-/, '')

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragActive(true)
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragActive(false)
        handleUpload(e.dataTransfer.files)
      }}
      className={`rounded border p-3 space-y-2 transition-colors ${
        dragActive
          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">{SLOT_LABELS[slotKey]}</h4>
        {!path && (
          <label className="rounded bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 text-xs font-medium cursor-pointer">
            {uploading ? 'Caricamento...' : '+ Carica file'}
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
        <p className="text-xs text-gray-500">Nessun file caricato ancora. Trascina qui il file o usa il bottone.</p>
      )}
    </div>
  )
}

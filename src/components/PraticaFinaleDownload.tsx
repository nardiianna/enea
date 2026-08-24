import { supabase } from '../lib/supabase'

const SLOTS: { key: 'enea' | 'ricevuta' | 'dichiarazione'; label: string }[] = [
  { key: 'enea', label: 'Pratica ENEA' },
  { key: 'ricevuta', label: 'Ricevuta' },
  { key: 'dichiarazione', label: 'Dichiarazione del fornitore' },
]

interface Props {
  paths: {
    enea: string | null
    ricevuta: string | null
    dichiarazione: string | null
  }
}

export function PraticaFinaleDownload({ paths }: Props) {
  async function handleDownload(path: string) {
    const preview = window.open('', '_blank', 'noopener,noreferrer')
    const { data, error } = await supabase.storage.from('fatture').createSignedUrl(path, 60)
    if (!error && data && preview) preview.location.href = data.signedUrl
    else preview?.close()
  }

  return (
    <div className="rounded border border-gray-200 dark:border-gray-700 p-4 space-y-3">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Pratica finale</h3>
      <ul className="divide-y divide-gray-100 dark:divide-gray-800">
        {SLOTS.map(({ key, label }) => {
          const path = paths[key]
          if (!path) return null
          const filename = path.split('/').pop()?.replace(/^\d+-/, '')
          return (
            <li key={key} className="flex items-center justify-between py-2 text-sm">
              <span className="text-gray-500 dark:text-gray-400">{label}</span>
              <button onClick={() => handleDownload(path)} className="text-brand-700 hover:underline text-left truncate max-w-xs">
                {filename}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

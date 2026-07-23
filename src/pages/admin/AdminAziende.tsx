import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { TopBar } from '../../components/TopBar'
import type { AziendaPartner } from '../../types/pratica'

export function AdminAziende() {
  const [aziende, setAziende] = useState<AziendaPartner[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [aziendeRes, praticheRes] = await Promise.all([
        supabase.from('aziende_partner').select('id, nome').order('nome'),
        supabase.from('pratiche').select('azienda_partner_id'),
      ])
      setAziende(aziendeRes.data ?? [])
      const c: Record<string, number> = {}
      for (const row of praticheRes.data ?? []) {
        c[row.azienda_partner_id] = (c[row.azienda_partner_id] ?? 0) + 1
      }
      setCounts(c)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      <TopBar title="Pratiche ENEA — Admin" />
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Aziende partner</h2>
          <Link to="/admin/pratiche" className="text-sm text-brand-700 hover:underline">
            Vedi tutte le pratiche →
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Caricamento...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {aziende.map((a) => (
              <Link
                key={a.id}
                to={`/admin/aziende/${a.id}`}
                className="rounded-lg border-2 border-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors p-4 flex items-center justify-between"
              >
                <span className="font-semibold text-brand-700 dark:text-brand-400">{a.nome}</span>
                <span className="text-xs text-gray-500">
                  {counts[a.id] ?? 0} client{counts[a.id] === 1 ? 'e' : 'i'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

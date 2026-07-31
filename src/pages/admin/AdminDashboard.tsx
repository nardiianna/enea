import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { TopBar } from '../../components/TopBar'
import { Pallino } from '../../components/Pallino'
import { getColorePallino } from '../../lib/pallino'
import type { AziendaPartner, Pratica } from '../../types/pratica'

type Row = Pick<
  Pratica,
  | 'id'
  | 'cognome'
  | 'nome'
  | 'stato'
  | 'azienda_partner_id'
  | 'created_at'
  | 'inserita_enea'
  | 'visibile_azienda'
  | 'problema'
  | 'pratica_finale_path'
>

export function AdminDashboard() {
  const [pratiche, setPratiche] = useState<Row[]>([])
  const [aziende, setAziende] = useState<AziendaPartner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [praticheRes, aziendeRes] = await Promise.all([
        supabase
          .from('pratiche')
          .select(
            'id, cognome, nome, stato, azienda_partner_id, created_at, inserita_enea, visibile_azienda, problema, pratica_finale_path',
          )
          .order('created_at', { ascending: false }),
        supabase.from('aziende_partner').select('id, nome').order('nome'),
      ])
      setPratiche(praticheRes.data ?? [])
      setAziende(aziendeRes.data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  function aziendaNome(id: string) {
    return aziende.find((a) => a.id === id)?.nome ?? '—'
  }

  async function handleFlagChange(praticaId: string, field: 'inserita_enea' | 'visibile_azienda', checked: boolean) {
    setPratiche((rows) => rows.map((r) => (r.id === praticaId ? { ...r, [field]: checked } : r)))
    await supabase.from('pratiche').update({ [field]: checked }).eq('id', praticaId)
  }

  return (
    <div>
      <TopBar title="Pratiche ENEA — Admin" />
      <div className="p-6 space-y-4">
        <Link to="/admin" className="text-sm text-brand-700 hover:underline">
          ← Aziende partner
        </Link>
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Tutte le pratiche</h2>
          <Link to="/admin/pratiche/nuova" className="rounded bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 text-sm font-medium">
            + Nuova pratica
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Caricamento...</p>
        ) : pratiche.length === 0 ? (
          <p className="text-sm text-gray-500">Nessuna pratica creata ancora.</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                <th className="py-2 pr-4">Cliente</th>
                <th className="py-2 pr-4">Azienda</th>
                <th className="py-2 pr-4">Stato</th>
                <th className="py-2 pr-4">Visibile azienda</th>
                <th className="py-2 pr-4">Creata il</th>
              </tr>
            </thead>
            <tbody>
              {pratiche.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-2 pr-4">
                    <Link to={`/admin/pratiche/${p.id}`} className="text-brand-700 hover:underline">
                      {p.cognome || p.nome ? `${p.cognome ?? ''} ${p.nome ?? ''}`.trim() : '(senza nome)'}
                    </Link>
                  </td>
                  <td className="py-2 pr-4">{aziendaNome(p.azienda_partner_id)}</td>
                  <td className="py-2 pr-4">
                    <Pallino
                      colore={getColorePallino(p)}
                      onClick={() => handleFlagChange(p.id, 'inserita_enea', !p.inserita_enea)}
                    />
                  </td>
                  <td className="py-2 pr-4">
                    <input
                      type="checkbox"
                      checked={p.visibile_azienda}
                      onChange={(e) => handleFlagChange(p.id, 'visibile_azienda', e.target.checked)}
                    />
                  </td>
                  <td className="py-2 pr-4">{new Date(p.created_at).toLocaleDateString('it-IT')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { TopBar } from '../../components/TopBar'
import { Pallino } from '../../components/Pallino'
import { getColorePallino } from '../../lib/pallino'
import type { AziendaPartner, Pratica } from '../../types/pratica'
import { useAuth } from '../../hooks/useAuth'

type Row = Pick<
  Pratica,
  | 'id'
  | 'cognome'
  | 'nome'
  | 'stato'
  | 'created_at'
  | 'inserita_enea'
  | 'visibile_azienda'
  | 'problema'
  | 'pratica_finale_path'
>

export function AdminAziendaDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { session } = useAuth()
  const [azienda, setAzienda] = useState<AziendaPartner | null>(null)
  const [pratiche, setPratiche] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    async function load() {
      const [aziendaRes, praticheRes] = await Promise.all([
        supabase.from('aziende_partner').select('id, nome').eq('id', id).single(),
        supabase
          .from('pratiche')
          .select(
            'id, cognome, nome, stato, created_at, inserita_enea, visibile_azienda, problema, pratica_finale_path',
          )
          .eq('azienda_partner_id', id)
          .order('created_at', { ascending: false }),
      ])
      setAzienda(aziendaRes.data ?? null)
      setPratiche(praticheRes.data ?? [])
      setLoading(false)
    }
    load()
  }, [id])

  async function handleFlagChange(praticaId: string, field: 'inserita_enea' | 'visibile_azienda', checked: boolean) {
    setPratiche((rows) => rows.map((r) => (r.id === praticaId ? { ...r, [field]: checked } : r)))
    await supabase.from('pratiche').update({ [field]: checked }).eq('id', praticaId)
  }

  async function handleNuovoCliente() {
    if (!id) return
    setCreating(true)
    setError(null)
    const { data, error } = await supabase
      .from('pratiche')
      .insert({ azienda_partner_id: id, tipo_lavoro: [], created_by: session?.user.id })
      .select('id')
      .single()
    setCreating(false)
    if (error) {
      setError(error.message)
      return
    }
    if (data) navigate(`/admin/pratiche/${data.id}`)
  }

  return (
    <div>
      <TopBar title="Pratiche ENEA — Admin" />
      <div className="p-6 space-y-4">
        <Link to="/admin" className="text-sm text-brand-700 hover:underline">
          ← Aziende partner
        </Link>
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">{azienda?.nome ?? '...'} — clienti</h2>
          {id && (
            <button
              onClick={handleNuovoCliente}
              disabled={creating}
              className="rounded bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {creating ? 'Creazione...' : '+ Nuovo cliente'}
            </button>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {loading ? (
          <p className="text-sm text-gray-500">Caricamento...</p>
        ) : pratiche.length === 0 ? (
          <p className="text-sm text-gray-500">Nessun cliente per questa azienda ancora.</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                <th className="py-2 pr-4">Cliente</th>
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

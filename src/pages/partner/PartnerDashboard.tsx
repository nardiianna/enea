import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { TopBar } from '../../components/TopBar'
import { Pallino } from '../../components/Pallino'
import type { Pratica } from '../../types/pratica'
import { STATO_LABELS } from '../../types/pratica'

type Row = Pick<
  Pratica,
  | 'id'
  | 'cognome'
  | 'nome'
  | 'azienda'
  | 'stato'
  | 'created_at'
  | 'problema'
  | 'pratica_finale_enea_path'
  | 'pratica_finale_ricevuta_path'
  | 'pratica_finale_dichiarazione_path'
>

export function PartnerDashboard() {
  const [pratiche, setPratiche] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('pratiche')
      .select(
        'id, cognome, nome, azienda, stato, created_at, problema, pratica_finale_enea_path, pratica_finale_ricevuta_path, pratica_finale_dichiarazione_path',
      )
      .order('cognome', { ascending: true })
      .order('nome', { ascending: true })
      .then(({ data }) => {
        setPratiche(data ?? [])
        setLoading(false)
      })
  }, [])

  async function handleElimina(praticaId: string, nomeCliente: string) {
    if (!window.confirm(`Eliminare ${nomeCliente || 'questo cliente'}? L'operazione non è reversibile.`)) return
    const { error } = await supabase.from('pratiche').delete().eq('id', praticaId)
    if (error) {
      setError(error.message)
      return
    }
    setPratiche((rows) => rows.filter((r) => r.id !== praticaId))
  }

  return (
    <div>
      <TopBar title="Pratiche ENEA — Area partner" />
      <div className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Le tue pratiche</h2>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {loading ? (
          <p className="text-sm text-gray-500">Caricamento...</p>
        ) : pratiche.length === 0 ? (
          <p className="text-sm text-gray-500">Nessuna pratica ancora.</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                <th className="py-2 pr-4"></th>
                <th className="py-2 pr-4">Cliente</th>
                <th className="py-2 pr-4">Stato</th>
                <th className="py-2 pr-4">Creata il</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {pratiche.map((p) => {
                const praticaFinaleCompleta =
                  p.pratica_finale_enea_path && p.pratica_finale_ricevuta_path && p.pratica_finale_dichiarazione_path
                const colore = praticaFinaleCompleta ? 'verde' : p.problema ? 'rosso' : 'bianco'
                return (
                  <tr key={p.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 pr-4">
                      <Pallino colore={colore} />
                    </td>
                    <td className="py-2 pr-4">
                      <Link to={`/partner/pratiche/${p.id}`} className="text-brand-700 hover:underline">
                        {p.cognome || p.nome ? `${p.cognome ?? ''} ${p.nome ?? ''}`.trim() : p.azienda || '(senza nome)'}
                      </Link>
                    </td>
                    <td className="py-2 pr-4">{STATO_LABELS[p.stato]}</td>
                    <td className="py-2 pr-4">{new Date(p.created_at).toLocaleDateString('it-IT')}</td>
                    <td className="py-2 pr-4">
                      <button
                        onClick={() => handleElimina(p.id, `${p.cognome ?? ''} ${p.nome ?? ''}`.trim())}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Elimina
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

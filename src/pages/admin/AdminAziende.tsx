import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { TopBar } from '../../components/TopBar'
import type { AziendaPartner } from '../../types/pratica'

export function AdminAziende() {
  const navigate = useNavigate()
  const [aziende, setAziende] = useState<AziendaPartner[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingNome, setEditingNome] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [])

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

  function startEdit(a: AziendaPartner) {
    setEditingId(a.id)
    setEditingNome(a.nome)
    setError(null)
  }

  async function saveEdit() {
    if (!editingId) return
    const nome = editingNome.trim()
    setEditingId(null)
    if (!nome) return
    const { error } = await supabase.from('aziende_partner').update({ nome }).eq('id', editingId)
    if (error) {
      setError(error.message)
      return
    }
    setAziende((rows) => rows.map((a) => (a.id === editingId ? { ...a, nome } : a)))
  }

  async function handleNuovaAzienda() {
    const nome = window.prompt('Nome della nuova azienda partner:')
    if (!nome || !nome.trim()) return
    setCreating(true)
    setError(null)
    const { data, error } = await supabase
      .from('aziende_partner')
      .insert({ nome: nome.trim() })
      .select('id, nome')
      .single()
    setCreating(false)
    if (error) {
      setError(error.message)
      return
    }
    if (data) setAziende((rows) => [...rows, data].sort((x, y) => x.nome.localeCompare(y.nome)))
  }

  return (
    <div>
      <TopBar title="Pratiche ENEA — Admin" />
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Aziende partner</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={handleNuovaAzienda}
              disabled={creating}
              className="text-sm text-brand-700 hover:underline disabled:opacity-50"
            >
              {creating ? 'Creazione...' : '+ Nuova azienda'}
            </button>
            <Link to="/admin/pratiche" className="text-sm text-brand-700 hover:underline">
              Vedi tutte le pratiche →
            </Link>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {loading ? (
          <p className="text-sm text-gray-500">Caricamento...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {aziende.map((a) => (
              <div
                key={a.id}
                onClick={() => editingId !== a.id && navigate(`/admin/aziende/${a.id}`)}
                className="rounded-lg border-2 border-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors p-4 flex items-center justify-between gap-2 cursor-pointer"
              >
                {editingId === a.id ? (
                  <input
                    autoFocus
                    className="font-semibold text-brand-700 dark:text-brand-400 bg-transparent border-b border-brand-400 outline-none flex-1"
                    value={editingNome}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setEditingNome(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit()
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                  />
                ) : (
                  <span className="font-semibold text-brand-700 dark:text-brand-400">{a.nome}</span>
                )}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-500">
                    {counts[a.id] ?? 0} client{counts[a.id] === 1 ? 'e' : 'i'}
                  </span>
                  {editingId !== a.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        startEdit(a)
                      }}
                      className="text-xs text-gray-400 hover:text-brand-700"
                      title="Rinomina"
                    >
                      ✎
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

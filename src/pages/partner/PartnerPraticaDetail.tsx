import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { TopBar } from '../../components/TopBar'
import { FileManager } from '../../components/FileManager'
import { PraticaForm, type PraticaFormValue } from '../../components/form/PraticaForm'
import type { AziendaPartner } from '../../types/pratica'

const CAMPI_MODIFICABILI = [
  'cognome',
  'nome',
  'telefono',
  'data_nascita',
  'luogo_nascita',
  'stato_nascita',
  'regione_nascita',
  'provincia_nascita',
  'residenza',
  'lavori_presso',
] as const

export function PartnerPraticaDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [aziende, setAziende] = useState<AziendaPartner[]>([])
  const [value, setValue] = useState<PraticaFormValue | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const skipNextAutosave = useRef(true)
  const pendingAutosave = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    supabase
      .from('aziende_partner')
      .select('id, nome')
      .order('nome')
      .then(({ data }) => setAziende(data ?? []))
  }, [])

  useEffect(() => {
    if (!id) return
    supabase
      .from('pratiche')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        skipNextAutosave.current = true
        setValue(data ?? {})
      })
  }, [id])

  async function saveNow() {
    if (!id || !value) return
    if (pendingAutosave.current) {
      clearTimeout(pendingAutosave.current)
      pendingAutosave.current = null
    }
    setSaving(true)
    setSaved(false)
    const patch = Object.fromEntries(CAMPI_MODIFICABILI.map((campo) => [campo, value[campo] ?? null]))
    const { error } = await supabase.from('pratiche').update(patch).eq('id', id)
    setSaving(false)
    if (error) setError(error.message)
    else {
      setError(null)
      setSaved(true)
    }
  }

  useEffect(() => {
    if (!id || !value) return
    if (skipNextAutosave.current) {
      skipNextAutosave.current = false
      return
    }
    setSaving(true)
    setSaved(false)
    pendingAutosave.current = setTimeout(saveNow, 800)
    return () => {
      if (pendingAutosave.current) clearTimeout(pendingAutosave.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  async function handleElimina() {
    if (!id) return
    if (!window.confirm(`Eliminare ${nomeCliente} dai tuoi clienti? L'operazione non è reversibile.`)) return
    const { error } = await supabase.from('pratiche').delete().eq('id', id)
    if (error) {
      setError(error.message)
      return
    }
    navigate('/partner')
  }

  if (!value) {
    return (
      <div>
        <TopBar title="Cliente" />
        <p className="p-6 text-sm text-gray-500">Caricamento...</p>
      </div>
    )
  }

  const nomeCliente = value.cognome || value.nome ? `${value.cognome ?? ''} ${value.nome ?? ''}`.trim() : 'Nuovo cliente'

  return (
    <div>
      <TopBar title={nomeCliente} />
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center text-xs">
          <button onClick={handleElimina} className="text-red-600 hover:underline">
            Elimina cliente
          </button>
          <span className="text-gray-500 h-4">{saving ? 'Salvataggio...' : saved ? 'Salvato ✓' : null}</span>
        </div>

        {id && <FileManager praticaId={id} />}

        <PraticaForm
          value={value}
          onChange={(patch) => setValue((v) => ({ ...(v ?? {}), ...patch }))}
          aziende={aziende}
          editableMeta={false}
          basicOnly
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          onClick={saveNow}
          disabled={saving}
          className="rounded bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 text-sm font-medium disabled:opacity-50"
        >
          {saving ? 'Salvataggio...' : 'Salva'}
        </button>
      </div>
    </div>
  )
}

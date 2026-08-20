import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
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
  const [aziende, setAziende] = useState<AziendaPartner[]>([])
  const [value, setValue] = useState<PraticaFormValue | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      .then(({ data }) => setValue(data ?? {}))
  }, [id])

  async function handleSave() {
    if (!id || !value) return
    setSaving(true)
    setError(null)
    setSaved(false)
    const patch = Object.fromEntries(CAMPI_MODIFICABILI.map((campo) => [campo, value[campo] ?? null]))
    const { error } = await supabase.from('pratiche').update(patch).eq('id', id)
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
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
          onClick={handleSave}
          disabled={saving}
          className="rounded bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 text-sm font-medium disabled:opacity-50"
        >
          {saving ? 'Salvataggio...' : saved ? 'Salvato!' : 'Salva'}
        </button>
      </div>
    </div>
  )
}

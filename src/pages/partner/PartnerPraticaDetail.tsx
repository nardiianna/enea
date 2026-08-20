import { useEffect, useRef, useState } from 'react'
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
  const skipNextAutosave = useRef(true)

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

  useEffect(() => {
    if (!id || !value) return
    if (skipNextAutosave.current) {
      skipNextAutosave.current = false
      return
    }
    setSaving(true)
    setSaved(false)
    const timeout = setTimeout(async () => {
      const patch = Object.fromEntries(CAMPI_MODIFICABILI.map((campo) => [campo, value[campo] ?? null]))
      const { error } = await supabase.from('pratiche').update(patch).eq('id', id)
      setSaving(false)
      if (error) setError(error.message)
      else {
        setError(null)
        setSaved(true)
      }
    }, 800)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

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
        <div className="flex justify-end text-xs text-gray-500 h-4">
          {saving ? 'Salvataggio...' : saved ? 'Salvato ✓' : null}
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
      </div>
    </div>
  )
}

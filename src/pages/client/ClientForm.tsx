import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { PraticaForm, type PraticaFormValue } from '../../components/form/PraticaForm'
import type { AziendaPartner } from '../../types/pratica'

export function ClientForm() {
  const { token } = useParams<{ token: string }>()
  const [value, setValue] = useState<PraticaFormValue | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    supabase
      .rpc('get_pratica_by_token', { p_token: token })
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true)
          return
        }
        setValue(data as PraticaFormValue)
        if ((data as PraticaFormValue).stato !== 'in_attesa_cliente') setSubmitted(true)
      })
  }, [token])

  async function handleSubmit() {
    if (!token || !value) return
    setSaving(true)
    setError(null)
    const { error } = await supabase.rpc('submit_pratica_by_token', { p_token: token, p_data: value })
    setSaving(false)
    if (error) {
      setError('Si è verificato un errore, riprova.')
      return
    }
    setSubmitted(true)
  }

  if (notFound) {
    return <CenteredMessage text="Link non valido o non più disponibile. Contatta chi ti ha inviato il link." />
  }

  if (!value) {
    return <CenteredMessage text="Caricamento..." />
  }

  if (submitted) {
    return <CenteredMessage text="Grazie! I tuoi dati sono stati inviati correttamente." />
  }

  const aziende: AziendaPartner[] = value.azienda_partner_id
    ? [{ id: value.azienda_partner_id, nome: (value as unknown as { azienda_partner_nome?: string }).azienda_partner_nome ?? '' }]
    : []

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Compila i tuoi dati per la Pratica ENEA</h1>
        <p className="text-sm text-gray-500">Compila tutti i campi possibili, poi invia il modulo.</p>
      </div>
      <PraticaForm
        value={value}
        onChange={(patch) => setValue((v) => ({ ...(v ?? {}), ...patch }))}
        aziende={aziende}
        editableMeta={false}
        showBonifico={false}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={saving}
        className="rounded bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 text-sm font-medium disabled:opacity-50"
      >
        {saving ? 'Invio in corso...' : 'Invia i dati'}
      </button>
    </div>
  )
}

function CenteredMessage({ text }: { text: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center text-gray-600 dark:text-gray-300">
      {text}
    </div>
  )
}

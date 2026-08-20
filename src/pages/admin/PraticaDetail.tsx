import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { TopBar } from '../../components/TopBar'
import { FileManager } from '../../components/FileManager'
import { PraticaFinaleUpload, type PraticaFinaleSlotKey } from '../../components/PraticaFinaleUpload'
import { PraticaForm, type PraticaFormValue } from '../../components/form/PraticaForm'
import type { AziendaPartner, Pratica, StatoPratica } from '../../types/pratica'
import { STATO_LABELS } from '../../types/pratica'
import { useAuth } from '../../hooks/useAuth'

const STATI: StatoPratica[] = ['in_attesa_cliente', 'compilata_da_cliente', 'in_revisione', 'completata']

const FIELD_BY_SLOT: Record<PraticaFinaleSlotKey, keyof PraticaFormValue> = {
  enea: 'pratica_finale_enea_path',
  ricevuta: 'pratica_finale_ricevuta_path',
  dichiarazione: 'pratica_finale_dichiarazione_path',
}

export function PraticaDetail() {
  const { id } = useParams<{ id: string }>()
  const isNew = id === 'nuova'
  const navigate = useNavigate()
  const { session } = useAuth()
  const [searchParams] = useSearchParams()
  const preselectedAzienda = searchParams.get('azienda') ?? undefined

  const [aziende, setAziende] = useState<AziendaPartner[]>([])
  const [value, setValue] = useState<PraticaFormValue>({
    tipo_lavoro: [],
    azienda_partner_id: preselectedAzienda,
  })
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [formOpen, setFormOpen] = useState(isNew)
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
    if (isNew || !id) return
    supabase
      .from('pratiche')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        const pratica = (data as Pratica) ?? {}
        skipNextAutosave.current = true
        setValue(pratica)
        setFormOpen(Boolean(pratica.cognome || pratica.nome || pratica.tipo_lavoro?.length))
        setLoading(false)
      })
  }, [id, isNew])

  async function saveNow() {
    if (isNew || !id) return
    if (pendingAutosave.current) {
      clearTimeout(pendingAutosave.current)
      pendingAutosave.current = null
    }
    setSaving(true)
    setSaved(false)
    const { error } = await supabase.from('pratiche').update(value).eq('id', id)
    setSaving(false)
    if (error) setError(error.message)
    else {
      setError(null)
      setSaved(true)
    }
  }

  useEffect(() => {
    if (isNew || !id || loading) return
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

  async function handleCreaPratica() {
    setSaving(true)
    setError(null)
    const { data, error } = await supabase
      .from('pratiche')
      .insert({ ...value, created_by: session?.user.id })
      .select('id')
      .single()
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    navigate(`/admin/pratiche/${data.id}`)
  }

  if (loading) {
    return (
      <div>
        <TopBar title="Pratica ENEA" />
        <p className="p-6 text-sm text-gray-500">Caricamento...</p>
      </div>
    )
  }

  const clientLink = value.access_token ? `${window.location.origin}/p/${value.access_token}` : null
  const nomeCliente = value.cognome || value.nome ? `${value.cognome ?? ''} ${value.nome ?? ''}`.trim() : null

  return (
    <div>
      <TopBar title={isNew ? 'Nuova pratica' : nomeCliente ?? 'Nuovo cliente'} />
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {value.azienda_partner_id && (
          <Link to={`/admin/aziende/${value.azienda_partner_id}`} className="text-sm text-brand-700 hover:underline">
            ← Torna ai clienti dell'azienda
          </Link>
        )}

        {!isNew && (
          <div className="flex justify-end text-xs text-gray-500 h-4">
            {saving ? 'Salvataggio...' : saved ? 'Salvato ✓' : null}
          </div>
        )}

        {!isNew && (
          <div className="rounded border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Cliente</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Cognome
                <input
                  className="mt-1 w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  value={value.cognome ?? ''}
                  onChange={(e) => setValue((v) => ({ ...v, cognome: e.target.value }))}
                />
              </label>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nome
                <input
                  className="mt-1 w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  value={value.nome ?? ''}
                  onChange={(e) => setValue((v) => ({ ...v, nome: e.target.value }))}
                />
              </label>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        )}

        {!isNew && id && <FileManager praticaId={id} />}

        {!isNew && id && (
          <PraticaFinaleUpload
            praticaId={id}
            paths={{
              enea: value.pratica_finale_enea_path,
              ricevuta: value.pratica_finale_ricevuta_path,
              dichiarazione: value.pratica_finale_dichiarazione_path,
            }}
            onChange={(key, path) => setValue((v) => ({ ...v, [FIELD_BY_SLOT[key]]: path }))}
          />
        )}

        {!isNew && (
          <div className="rounded border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="text-sm font-medium">
                Stato:{' '}
                <select
                  className="ml-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm"
                  value={value.stato}
                  onChange={(e) => setValue((v) => ({ ...v, stato: e.target.value as StatoPratica }))}
                >
                  {STATI.map((s) => (
                    <option key={s} value={s}>
                      {STATO_LABELS[s]}
                    </option>
                  ))}
                </select>
              </label>
              {clientLink && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Link per il cliente:</span>
                  <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{clientLink}</code>
                  <button
                    className="text-xs text-brand-700"
                    onClick={() => {
                      navigator.clipboard.writeText(clientLink)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 1500)
                    }}
                  >
                    {copied ? 'Copiato!' : 'Copia'}
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={value.inserita_enea ?? false}
                  onChange={(e) => setValue((v) => ({ ...v, inserita_enea: e.target.checked }))}
                />
                Cliente contattato
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={value.problema ?? false}
                  onChange={(e) => setValue((v) => ({ ...v, problema: e.target.checked }))}
                />
                C'è un problema
              </label>
            </div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Note interne
              <textarea
                className="mt-1 w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                rows={2}
                value={value.note ?? ''}
                onChange={(e) => setValue((v) => ({ ...v, note: e.target.value }))}
              />
            </label>
          </div>
        )}

        {!formOpen ? (
          <button
            onClick={() => setFormOpen(true)}
            className="w-full rounded-lg border-2 border-brand-600 text-brand-700 dark:text-brand-400 dark:border-brand-500 py-3 text-sm font-semibold hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors"
          >
            + Aggiungi dati Pratica ENEA
          </button>
        ) : (
          <>
            <PraticaForm value={value} onChange={(patch) => setValue((v) => ({ ...v, ...patch }))} aziende={aziende} editableMeta />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              onClick={isNew ? handleCreaPratica : saveNow}
              disabled={saving}
              className="rounded bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 text-sm font-medium disabled:opacity-50"
            >
              {isNew ? (saving ? 'Creazione...' : 'Crea pratica') : saving ? 'Salvataggio...' : 'Salva'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

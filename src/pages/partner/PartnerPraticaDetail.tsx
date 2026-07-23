import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { TopBar } from '../../components/TopBar'
import { PraticaForm, type PraticaFormValue } from '../../components/form/PraticaForm'
import type { AziendaPartner } from '../../types/pratica'
import { STATO_LABELS } from '../../types/pratica'

export function PartnerPraticaDetail() {
  const { id } = useParams<{ id: string }>()
  const [aziende, setAziende] = useState<AziendaPartner[]>([])
  const [value, setValue] = useState<PraticaFormValue | null>(null)

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

  if (!value) {
    return (
      <div>
        <TopBar title="Pratica ENEA" />
        <p className="p-6 text-sm text-gray-500">Caricamento...</p>
      </div>
    )
  }

  return (
    <div>
      <TopBar title="Pratica ENEA — sola lettura" />
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Stato: <strong>{value.stato ? STATO_LABELS[value.stato] : '—'}</strong>
        </p>
        <PraticaForm value={value} onChange={() => {}} aziende={aziende} editableMeta={false} disabled />
      </div>
    </div>
  )
}

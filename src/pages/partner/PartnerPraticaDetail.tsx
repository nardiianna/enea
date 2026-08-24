import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { TopBar } from '../../components/TopBar'
import { PraticaFinaleDownload } from '../../components/PraticaFinaleDownload'
import type { PraticaFormValue } from '../../components/form/PraticaForm'

export function PartnerPraticaDetail() {
  const { id } = useParams<{ id: string }>()
  const [value, setValue] = useState<PraticaFormValue | null>(null)

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
        <TopBar title="Cliente" />
        <p className="p-6 text-sm text-gray-500">Caricamento...</p>
      </div>
    )
  }

  const nomeCliente = value.cognome || value.nome ? `${value.cognome ?? ''} ${value.nome ?? ''}`.trim() : 'Cliente'

  return (
    <div>
      <TopBar title={nomeCliente} />
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <PraticaFinaleDownload
          paths={{
            enea: value.pratica_finale_enea_path ?? null,
            ricevuta: value.pratica_finale_ricevuta_path ?? null,
            dichiarazione: value.pratica_finale_dichiarazione_path ?? null,
          }}
        />
      </div>
    </div>
  )
}

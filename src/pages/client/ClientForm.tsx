import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { PraticaFinaleDownload } from '../../components/PraticaFinaleDownload'
import type { PraticaFormValue } from '../../components/form/PraticaForm'

export function ClientForm() {
  const { token } = useParams<{ token: string }>()
  const [value, setValue] = useState<PraticaFormValue | null>(null)
  const [notFound, setNotFound] = useState(false)

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
      })
  }, [token])

  if (notFound) {
    return <CenteredMessage text="Link non valido o non più disponibile. Contatta chi ti ha inviato il link." />
  }

  if (!value) {
    return <CenteredMessage text="Caricamento..." />
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">La tua Pratica ENEA</h1>
      <PraticaFinaleDownload
        paths={{
          enea: value.pratica_finale_enea_path ?? null,
          ricevuta: value.pratica_finale_ricevuta_path ?? null,
          dichiarazione: value.pratica_finale_dichiarazione_path ?? null,
        }}
      />
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

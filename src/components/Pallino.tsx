import type { ColorePallino } from '../lib/pallino'

const CLASSI: Record<ColorePallino, string> = {
  rosso: 'bg-red-500',
  giallo: 'bg-yellow-400',
  verde: 'bg-green-500',
  bianco: 'bg-white border border-gray-300 dark:border-gray-600',
}

const LABEL: Record<ColorePallino, string> = {
  rosso: 'Problema segnalato',
  giallo: 'Pratica compilata — manca comunicazione a ENEA',
  verde: 'Pratica finale allegata',
  bianco: 'Nessuna segnalazione',
}

export function Pallino({ colore }: { colore: ColorePallino }) {
  return (
    <span
      title={LABEL[colore]}
      className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${CLASSI[colore]}`}
    />
  )
}

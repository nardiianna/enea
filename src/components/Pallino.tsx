import type { ColorePallino } from '../lib/pallino'

const CLASSI: Record<ColorePallino, string> = {
  rosso: 'bg-red-500',
  giallo: 'bg-yellow-400',
  verde: 'bg-green-500',
  bianco: 'bg-white border border-gray-300 dark:border-gray-600',
}

const LABEL: Record<ColorePallino, string> = {
  rosso: 'Problema segnalato',
  giallo: 'Cliente contattato',
  verde: 'Pratica finale allegata',
  bianco: 'Nessuna segnalazione',
}

export function Pallino({ colore, onClick }: { colore: ColorePallino; onClick?: () => void }) {
  const className = `inline-block w-3.5 h-3.5 rounded-full shrink-0 ${CLASSI[colore]}`

  if (onClick) {
    return <button type="button" title={LABEL[colore]} onClick={onClick} className={className} />
  }
  return <span title={LABEL[colore]} className={className} />
}

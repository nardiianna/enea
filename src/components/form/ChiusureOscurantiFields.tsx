import type { ChiusuraOscuranteEsposizione, DettaglioChiusureOscuranti, Esposizione } from '../../types/pratica'
import { TextInput, Checkbox } from './fields'

const ESPOSIZIONI: { key: Esposizione; label: string }[] = [
  { key: 'nord', label: 'Nord' },
  { key: 'sud', label: 'Sud' },
  { key: 'est', label: 'Est' },
  { key: 'ovest', label: 'Ovest' },
]

export function ChiusureOscurantiFields({
  value,
  onChange,
  disabled,
}: {
  value: DettaglioChiusureOscuranti | null | undefined
  onChange: (v: DettaglioChiusureOscuranti) => void
  disabled?: boolean
}) {
  const v = value ?? {}

  function patchEsposizione(key: Esposizione, patch: Partial<ChiusuraOscuranteEsposizione>) {
    onChange({
      ...v,
      esposizioni: {
        ...v.esposizioni,
        [key]: { ...v.esposizioni?.[key], ...patch },
      },
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <TextInput
          label="Tapparelle n."
          value={v.tapparelle_numero}
          disabled={disabled}
          onChange={(x) => onChange({ ...v, tapparelle_numero: x })}
        />
        <TextInput
          label="Balconi n."
          value={v.balconi_numero}
          disabled={disabled}
          onChange={(x) => onChange({ ...v, balconi_numero: x })}
        />
        <TextInput
          label="Altro"
          value={v.altro}
          disabled={disabled}
          onChange={(x) => onChange({ ...v, altro: x })}
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {ESPOSIZIONI.map(({ key, label }) => (
          <div key={key} className="rounded border border-gray-200 dark:border-gray-700 p-2 space-y-2">
            <div className="text-xs font-semibold text-gray-500">{label}</div>
            <TextInput
              label="N."
              value={v.esposizioni?.[key]?.numero}
              disabled={disabled}
              onChange={(x) => patchEsposizione(key, { numero: x })}
            />
            <Checkbox
              label="Motorizzate"
              checked={v.esposizioni?.[key]?.motorizzata ?? false}
              disabled={disabled}
              onChange={(x) => patchEsposizione(key, { motorizzata: x })}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

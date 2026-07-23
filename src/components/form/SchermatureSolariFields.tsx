import type { DettaglioSchermatureSolari, SchermaturaSolareBlocco } from '../../types/pratica'
import { SelectInput, TextInput } from './fields'

function BloccoFields({
  blocco,
  onChange,
  disabled,
}: {
  blocco: SchermaturaSolareBlocco
  onChange: (v: SchermaturaSolareBlocco) => void
  disabled?: boolean
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SelectInput
          label="Tipologia tende"
          value={blocco.tipologia_tende}
          disabled={disabled}
          options={[
            { value: 'a_bracci', label: 'A bracci' },
            { value: 'a_caduta', label: 'A caduta' },
            { value: 'veneziana', label: 'Veneziana' },
            { value: 'altro', label: 'Altro' },
          ]}
          onChange={(x) => onChange({ ...blocco, tipologia_tende: x })}
        />
        {blocco.tipologia_tende === 'altro' && (
          <TextInput
            label="Altro - specificare"
            value={blocco.tipologia_tende_altro}
            disabled={disabled}
            onChange={(x) => onChange({ ...blocco, tipologia_tende_altro: x })}
          />
        )}
        <TextInput
          label="Numero"
          value={blocco.numero}
          disabled={disabled}
          onChange={(x) => onChange({ ...blocco, numero: x })}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SelectInput
          label="Tipo"
          value={blocco.tipo}
          disabled={disabled}
          options={[
            { value: 'manuale', label: 'Manuale' },
            { value: 'motorizzata', label: 'Motorizzata' },
          ]}
          onChange={(x) => onChange({ ...blocco, tipo: x })}
        />
        <SelectInput
          label="Orientamento"
          value={blocco.orientamento}
          disabled={disabled}
          options={[
            { value: 'nord', label: 'Nord' },
            { value: 'sud', label: 'Sud' },
            { value: 'est', label: 'Est' },
            { value: 'ovest', label: 'Ovest' },
          ]}
          onChange={(x) => onChange({ ...blocco, orientamento: x })}
        />
        <SelectInput
          label="Vetro protetto"
          value={blocco.vetro_protetto}
          disabled={disabled}
          options={[
            { value: 'finestra', label: 'Finestra' },
            { value: 'porta_finestra', label: 'Porta finestra' },
            { value: 'porta_finestra_scorrevole', label: 'Porta finestra scorrevole' },
          ]}
          onChange={(x) => onChange({ ...blocco, vetro_protetto: x })}
        />
      </div>
    </div>
  )
}

export function SchermatureSolariFields({
  value,
  onChange,
  disabled,
}: {
  value: DettaglioSchermatureSolari | null | undefined
  onChange: (v: DettaglioSchermatureSolari) => void
  disabled?: boolean
}) {
  const blocchi = value?.blocchi ?? [{}]

  function updateBlocco(index: number, blocco: SchermaturaSolareBlocco) {
    const next = [...blocchi]
    next[index] = blocco
    onChange({ blocchi: next })
  }

  function addBlocco() {
    onChange({ blocchi: [...blocchi, {}] })
  }

  function removeBlocco(index: number) {
    onChange({ blocchi: blocchi.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-4">
      {blocchi.map((blocco, i) => (
        <div key={i} className="rounded border border-gray-300 dark:border-gray-600 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Schermatura #{i + 1}</span>
            {!disabled && blocchi.length > 1 && (
              <button
                type="button"
                className="text-xs text-red-600"
                onClick={() => removeBlocco(i)}
              >
                Rimuovi
              </button>
            )}
          </div>
          <BloccoFields
            blocco={blocco}
            disabled={disabled}
            onChange={(v) => updateBlocco(i, v)}
          />
        </div>
      ))}
      {!disabled && (
        <button type="button" className="text-sm text-brand-700" onClick={addBlocco}>
          + Aggiungi un'altra schermatura
        </button>
      )}
    </div>
  )
}

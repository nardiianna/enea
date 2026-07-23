import type { AziendaPartner, Pratica, TipoLavoro } from '../../types/pratica'
import { TIPO_LAVORO_LABELS } from '../../types/pratica'
import { BoolRadio, Checkbox, NumberInput, Section, SelectInput, TextInput } from './fields'
import { ChiusureOscurantiFields } from './ChiusureOscurantiFields'
import { SchermatureSolariFields } from './SchermatureSolariFields'
import { DateOfBirthInput } from './DateOfBirthInput'

const TUTTI_TIPI_LAVORO: TipoLavoro[] = [
  'serramenti',
  'porta_blindata',
  'chiusure_oscuranti',
  'schermature_solari',
  'caldaia',
  'condizionatore',
]

export type PraticaFormValue = Partial<Pratica>

export function PraticaForm({
  value,
  onChange,
  aziende,
  editableMeta,
  disabled,
  showBonifico = true,
}: {
  value: PraticaFormValue
  onChange: (patch: PraticaFormValue) => void
  aziende: AziendaPartner[]
  editableMeta: boolean
  disabled?: boolean
  showBonifico?: boolean
}) {
  const tipoLavoro = value.tipo_lavoro ?? []

  function toggleTipoLavoro(t: TipoLavoro) {
    const next = tipoLavoro.includes(t)
      ? tipoLavoro.filter((x) => x !== t)
      : [...tipoLavoro, t]
    onChange({ tipo_lavoro: next })
  }

  return (
    <div className="space-y-6">
      <Section title="Azienda e tipo di lavoro">
        {editableMeta ? (
          <SelectInput
            label="Azienda partner"
            value={value.azienda_partner_id}
            onChange={(v) => onChange({ azienda_partner_id: v })}
            options={aziende.map((a) => ({ value: a.id, label: a.nome }))}
          />
        ) : (
          <div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Azienda partner</div>
            <div className="mt-1 text-sm">
              {aziende.find((a) => a.id === value.azienda_partner_id)?.nome ?? '—'}
            </div>
          </div>
        )}
        <SelectInput
          label="Aliquota"
          value={value.aliquota}
          disabled={!editableMeta}
          options={[
            { value: '50', label: '50%' },
            { value: '36', label: '36%' },
          ]}
          onChange={(v) => onChange({ aliquota: v })}
        />
        <div className="sm:col-span-2">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tipo di lavoro
          </div>
          <div className="flex flex-wrap gap-4">
            {TUTTI_TIPI_LAVORO.map((t) => (
              <Checkbox
                key={t}
                label={TIPO_LAVORO_LABELS[t]}
                checked={tipoLavoro.includes(t)}
                disabled={!editableMeta}
                onChange={() => toggleTipoLavoro(t)}
              />
            ))}
          </div>
        </div>
      </Section>

      <Section title="Dati anagrafici">
        <TextInput label="Cognome" value={value.cognome} disabled={disabled} onChange={(v) => onChange({ cognome: v })} />
        <TextInput label="Nome" value={value.nome} disabled={disabled} onChange={(v) => onChange({ nome: v })} />
        <TextInput label="Telefono" value={value.telefono} disabled={disabled} onChange={(v) => onChange({ telefono: v })} />
        <DateOfBirthInput value={value.data_nascita} disabled={disabled} onChange={(v) => onChange({ data_nascita: v })} />
        <TextInput label="Luogo di nascita" value={value.luogo_nascita} disabled={disabled} onChange={(v) => onChange({ luogo_nascita: v })} />
        <TextInput label="Stato" value={value.stato_nascita} disabled={disabled} onChange={(v) => onChange({ stato_nascita: v })} />
        <TextInput label="Regione" value={value.regione_nascita} disabled={disabled} onChange={(v) => onChange({ regione_nascita: v })} />
        <TextInput label="Provincia" value={value.provincia_nascita} disabled={disabled} onChange={(v) => onChange({ provincia_nascita: v })} />
        <TextInput label="Residenza" value={value.residenza} disabled={disabled} onChange={(v) => onChange({ residenza: v })} />
        <TextInput label="Lavori presso (indirizzo intervento)" value={value.lavori_presso} disabled={disabled} onChange={(v) => onChange({ lavori_presso: v })} />
      </Section>

      <Section title="Diritti sull'immobile">
        <BoolRadio
          label="È abitazione principale?"
          value={value.abitazione_principale}
          disabled={disabled}
          onChange={(v) => onChange({ abitazione_principale: v })}
        />
        <BoolRadio
          label="È di sua proprietà?"
          value={value.abitazione_proprieta}
          disabled={disabled}
          onChange={(v) => onChange({ abitazione_proprieta: v })}
        />
        {(value.abitazione_principale === false || value.abitazione_proprieta === false) && (
          <>
            <BoolRadio
              label="È familiare convivente senza diritto di godimento?"
              value={value.familiare_convivente}
              disabled={disabled}
              onChange={(v) => onChange({ familiare_convivente: v })}
            />
            <SelectInput
              label="Se ha un diritto di godimento, quale?"
              value={value.diritto_godimento}
              disabled={disabled}
              options={[
                { value: 'usufruttuario', label: 'Usufruttuario' },
                { value: 'nudo_proprietario', label: 'Nudo proprietario' },
                { value: 'uso_abitazione', label: 'Uso dell’abitazione' },
                { value: 'proprietario_superficie', label: 'Proprietario di superficie' },
              ]}
              onChange={(v) => onChange({ diritto_godimento: v })}
            />
          </>
        )}
      </Section>

      <Section title="Dati immobile">
        <SelectInput
          label="Tipo di abitazione"
          value={value.tipo_abitazione}
          disabled={disabled}
          options={[
            { value: 'singola', label: 'Singola' },
            { value: 'bifamiliare', label: 'Bifamiliare' },
            { value: 'schiera', label: 'A schiera' },
            { value: 'condominio_leq3', label: 'Condominio ≤ 3 piani' },
            { value: 'condominio_gt3', label: 'Condominio > 3 piani' },
          ]}
          onChange={(v) => onChange({ tipo_abitazione: v })}
        />
        <NumberInput label="Metri quadri" value={value.metri_quadri} disabled={disabled} onChange={(v) => onChange({ metri_quadri: v })} />
        <NumberInput label="Anno costruzione" value={value.anno_costruzione} disabled={disabled} onChange={(v) => onChange({ anno_costruzione: v })} />
        {value.tipo_abitazione && value.tipo_abitazione !== 'singola' && value.tipo_abitazione !== 'bifamiliare' && (
          <NumberInput
            label="Unità abitative"
            value={value.unita_abitative}
            disabled={disabled}
            onChange={(v) => onChange({ unita_abitative: v })}
          />
        )}
      </Section>

      <Section title="Impianti">
        <SelectInput
          label="Caldaia"
          value={value.caldaia}
          disabled={disabled}
          options={[
            { value: 'normale', label: 'Normale' },
            { value: 'condensazione', label: 'Condensazione' },
            { value: 'pompa_di_calore', label: 'Pompa di calore' },
            { value: 'altro', label: 'Altro' },
          ]}
          onChange={(v) => onChange({ caldaia: v })}
        />
        {value.caldaia === 'altro' && (
          <TextInput label="Caldaia - altro" value={value.caldaia_altro} disabled={disabled} onChange={(v) => onChange({ caldaia_altro: v })} />
        )}
        <SelectInput
          label="Combustibile"
          value={value.combustibile}
          disabled={disabled}
          options={[
            { value: 'gas_metano', label: 'Gas metano' },
            { value: 'gasolio', label: 'Gasolio' },
            { value: 'gpl', label: 'GPL' },
            { value: 'energia_elettrica', label: 'Energia elettrica' },
            { value: 'altro', label: 'Altro' },
          ]}
          onChange={(v) => onChange({ combustibile: v })}
        />
        {value.combustibile === 'altro' && (
          <TextInput label="Combustibile - altro" value={value.combustibile_altro} disabled={disabled} onChange={(v) => onChange({ combustibile_altro: v })} />
        )}
        <SelectInput
          label="Impianto"
          value={value.impianto_tipo}
          disabled={disabled}
          options={[
            { value: 'autonomo', label: 'Autonomo' },
            { value: 'centralizzato', label: 'Centralizzato' },
          ]}
          onChange={(v) => onChange({ impianto_tipo: v })}
        />
        <SelectInput
          label="Erogazione"
          value={value.impianto_erogazione}
          disabled={disabled}
          options={[
            { value: 'radiatori', label: 'Radiatori' },
            { value: 'pavimento', label: 'Impianto a pavimento' },
            { value: 'altro', label: 'Altro' },
          ]}
          onChange={(v) => onChange({ impianto_erogazione: v })}
        />
        {value.impianto_erogazione === 'altro' && (
          <TextInput label="Erogazione - altro" value={value.impianto_altro} disabled={disabled} onChange={(v) => onChange({ impianto_altro: v })} />
        )}
        <BoolRadio label="Condizionatore?" value={value.condizionatore} disabled={disabled} onChange={(v) => onChange({ condizionatore: v })} />
      </Section>

      <Section title={showBonifico ? 'Bonifico e dati catastali' : 'Dati catastali'}>
        {showBonifico && (
          <>
            <SelectInput
              label="Tipo bonifico"
              value={value.tipo_bonifico}
              disabled={disabled}
              options={[
                { value: 'risparmio_energetico', label: 'Risparmio energetico' },
                { value: 'ristrutturazione', label: 'Ristrutturazione' },
              ]}
              onChange={(v) => onChange({ tipo_bonifico: v })}
            />
            <div />
          </>
        )}
        <TextInput label="Foglio" value={value.foglio} disabled={disabled} onChange={(v) => onChange({ foglio: v })} />
        <TextInput label="Mappale" value={value.mappale} disabled={disabled} onChange={(v) => onChange({ mappale: v })} />
        <TextInput label="Sub" value={value.sub} disabled={disabled} onChange={(v) => onChange({ sub: v })} />
      </Section>

      {tipoLavoro.includes('serramenti') && (
        <Section title="Serramenti">
          <TextInput
            label="Numero"
            value={value.dettaglio_serramenti?.numero}
            disabled={disabled}
            onChange={(v) => onChange({ dettaglio_serramenti: { ...value.dettaglio_serramenti, numero: v } })}
          />
          <TextInput
            label="Il serramento che c'era precedentemente in che materiale era?"
            value={value.dettaglio_serramenti?.materiale_vecchi_serramenti}
            disabled={disabled}
            onChange={(v) =>
              onChange({ dettaglio_serramenti: { ...value.dettaglio_serramenti, materiale_vecchi_serramenti: v } })
            }
          />
          <SelectInput
            label="Il vecchio serramento aveva vetro singolo o doppio?"
            value={value.dettaglio_serramenti?.tipologia_vecchio_vetro}
            disabled={disabled}
            options={[
              { value: 'singolo', label: 'Singolo' },
              { value: 'doppio', label: 'Doppio' },
            ]}
            onChange={(v) =>
              onChange({ dettaglio_serramenti: { ...value.dettaglio_serramenti, tipologia_vecchio_vetro: v } })
            }
          />
        </Section>
      )}

      {tipoLavoro.includes('porta_blindata') && (
        <Section title="Porta blindata">
          <TextInput
            label="Il serramento che c'era precedentemente in che materiale era?"
            value={value.dettaglio_porta_blindata?.vecchia_materiale}
            disabled={disabled}
            onChange={(v) => onChange({ dettaglio_porta_blindata: { ...value.dettaglio_porta_blindata, vecchia_materiale: v } })}
          />
          <TextInput
            label="Aveva del vetro?"
            value={value.dettaglio_porta_blindata?.vecchia_con_vetro}
            disabled={disabled}
            onChange={(v) => onChange({ dettaglio_porta_blindata: { ...value.dettaglio_porta_blindata, vecchia_con_vetro: v } })}
          />
          <TextInput
            label="La porta blindata installata ora ha del vetro?"
            value={value.dettaglio_porta_blindata?.nuova_con_vetro}
            disabled={disabled}
            onChange={(v) => onChange({ dettaglio_porta_blindata: { ...value.dettaglio_porta_blindata, nuova_con_vetro: v } })}
          />
        </Section>
      )}

      {tipoLavoro.includes('chiusure_oscuranti') && (
        <div className="rounded border border-gray-200 dark:border-gray-700 p-4">
          <div className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Chiusure oscuranti</div>
          <ChiusureOscurantiFields
            value={value.dettaglio_chiusure_oscuranti}
            disabled={disabled}
            onChange={(v) => onChange({ dettaglio_chiusure_oscuranti: v })}
          />
        </div>
      )}

      {tipoLavoro.includes('schermature_solari') && (
        <div className="rounded border border-gray-200 dark:border-gray-700 p-4">
          <div className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Schermature solari</div>
          <SchermatureSolariFields
            value={value.dettaglio_schermature_solari}
            disabled={disabled}
            onChange={(v) => onChange({ dettaglio_schermature_solari: v })}
          />
        </div>
      )}

      {tipoLavoro.includes('caldaia') && (
        <Section title="Caldaia">
          <TextInput
            label="Tipo vecchia caldaia"
            value={value.dettaglio_caldaia?.tipo_vecchia_caldaia}
            disabled={disabled}
            onChange={(v) => onChange({ dettaglio_caldaia: { ...value.dettaglio_caldaia, tipo_vecchia_caldaia: v } })}
          />
          <TextInput
            label="Potenza (kW)"
            value={value.dettaglio_caldaia?.potenza_kw}
            disabled={disabled}
            onChange={(v) => onChange({ dettaglio_caldaia: { ...value.dettaglio_caldaia, potenza_kw: v } })}
          />
          <TextInput
            label="Marca e modello"
            value={value.dettaglio_caldaia?.marca_modello}
            disabled={disabled}
            onChange={(v) => onChange({ dettaglio_caldaia: { ...value.dettaglio_caldaia, marca_modello: v } })}
          />
        </Section>
      )}

      {tipoLavoro.includes('condizionatore') && (
        <Section title="Condizionatore">
          <SelectInput
            label="Tipo"
            value={value.dettaglio_condizionatore?.tipo}
            disabled={disabled}
            options={[
              { value: 'mono_split', label: 'Mono split' },
              { value: 'multi_split', label: 'Multi split' },
            ]}
            onChange={(v) => onChange({ dettaglio_condizionatore: { ...value.dettaglio_condizionatore, tipo: v } })}
          />
          <TextInput
            label="Numero unità"
            value={value.dettaglio_condizionatore?.numero_unita}
            disabled={disabled}
            onChange={(v) => onChange({ dettaglio_condizionatore: { ...value.dettaglio_condizionatore, numero_unita: v } })}
          />
          <TextInput
            label="Marca e modello"
            value={value.dettaglio_condizionatore?.marca_modello}
            disabled={disabled}
            onChange={(v) => onChange({ dettaglio_condizionatore: { ...value.dettaglio_condizionatore, marca_modello: v } })}
          />
        </Section>
      )}

      <div className="rounded border border-gray-200 dark:border-gray-700 p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Note
          <span className="block text-xs text-gray-500 font-normal mt-0.5">
            Se hai qualcosa da segnalare o da chiederci, scrivilo qui
          </span>
          <textarea
            className="mt-2 w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            rows={3}
            disabled={disabled}
            value={value.note_cliente ?? ''}
            onChange={(e) => onChange({ note_cliente: e.target.value })}
          />
        </label>
      </div>
    </div>
  )
}

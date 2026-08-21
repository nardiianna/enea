export type TipoLavoro =
  | 'serramenti'
  | 'porta_blindata'
  | 'chiusure_oscuranti'
  | 'schermature_solari'
  | 'caldaia'
  | 'condizionatore'

export const TIPO_LAVORO_LABELS: Record<TipoLavoro, string> = {
  serramenti: 'Serramenti',
  porta_blindata: 'Porta blindata',
  chiusure_oscuranti: 'Chiusure oscuranti (tapparelle/balconi)',
  schermature_solari: 'Schermature solari (tende, veneziane, pergola bioclimatica)',
  caldaia: 'Caldaia',
  condizionatore: 'Condizionatore',
}

export type StatoPratica =
  | 'in_attesa_cliente'
  | 'compilata_da_cliente'
  | 'in_revisione'
  | 'completata'

export const STATO_LABELS: Record<StatoPratica, string> = {
  in_attesa_cliente: 'In attesa del cliente',
  compilata_da_cliente: 'Compilata dal cliente',
  in_revisione: 'In revisione',
  completata: 'Completata',
}

export interface AziendaPartner {
  id: string
  nome: string
}

export type Esposizione = 'nord' | 'sud' | 'est' | 'ovest'

export interface DettaglioSerramenti {
  numero?: string
  materiale_vecchi_serramenti?: string
  tipologia_vecchio_vetro?: 'singolo' | 'doppio'
}

export interface DettaglioPortaBlindata {
  vecchia_materiale?: string
  vecchia_con_vetro?: string
  nuova_con_vetro?: string
}

export interface ChiusuraOscuranteEsposizione {
  numero?: string
  motorizzata?: boolean
}

export interface DettaglioChiusureOscuranti {
  tapparelle_numero?: string
  balconi_numero?: string
  altro?: string
  esposizioni?: Partial<Record<Esposizione, ChiusuraOscuranteEsposizione>>
}

export interface SchermaturaSolareBlocco {
  tipologia_tende?: 'a_bracci' | 'a_caduta' | 'veneziana' | 'altro'
  tipologia_tende_altro?: string
  numero?: string
  tipo?: 'manuale' | 'motorizzata'
  orientamento?: Esposizione
  vetro_protetto?: 'finestra' | 'porta_finestra' | 'porta_finestra_scorrevole'
}

export interface DettaglioSchermatureSolari {
  blocchi?: SchermaturaSolareBlocco[]
}

export interface DettaglioCaldaiaLavoro {
  tipo_vecchia_caldaia?: string
  potenza_kw?: string
  marca_modello?: string
}

export interface DettaglioCondizionatoreLavoro {
  tipo?: 'mono_split' | 'multi_split'
  numero_unita?: string
  marca_modello?: string
}

export interface Pratica {
  id: string
  azienda_partner_id: string
  access_token: string
  stato: StatoPratica
  tipo_lavoro: TipoLavoro[]
  aliquota: '50' | '36' | null

  cognome: string | null
  nome: string | null
  azienda: string | null
  telefono: string | null
  data_nascita: string | null
  luogo_nascita: string | null
  stato_nascita: string | null
  regione_nascita: string | null
  provincia_nascita: string | null
  residenza: string | null
  lavori_presso: string | null

  abitazione_principale: boolean | null
  abitazione_proprieta: boolean | null
  familiare_convivente: boolean | null
  diritto_godimento:
    | 'usufruttuario'
    | 'nudo_proprietario'
    | 'uso_abitazione'
    | 'proprietario_superficie'
    | null

  tipo_abitazione:
    | 'singola'
    | 'bifamiliare'
    | 'schiera'
    | 'condominio_leq3'
    | 'condominio_gt3'
    | null
  metri_quadri: number | null
  anno_costruzione: number | null
  unita_abitative: number | null

  caldaia: 'normale' | 'condensazione' | 'pompa_di_calore' | 'altro' | null
  caldaia_altro: string | null
  combustibile: 'gas_metano' | 'gasolio' | 'gpl' | 'energia_elettrica' | 'altro' | null
  combustibile_altro: string | null
  impianto_tipo: 'autonomo' | 'centralizzato' | null
  impianto_erogazione: 'radiatori' | 'pavimento' | 'altro' | null
  impianto_altro: string | null
  condizionatore: boolean | null

  tipo_bonifico: 'risparmio_energetico' | 'ristrutturazione' | null

  foglio: string | null
  mappale: string | null
  sub: string | null

  dettaglio_serramenti: DettaglioSerramenti | null
  dettaglio_porta_blindata: DettaglioPortaBlindata | null
  dettaglio_chiusure_oscuranti: DettaglioChiusureOscuranti | null
  dettaglio_schermature_solari: DettaglioSchermatureSolari | null
  dettaglio_caldaia: DettaglioCaldaiaLavoro | null
  dettaglio_condizionatore: DettaglioCondizionatoreLavoro | null

  note: string | null
  note_cliente: string | null
  inserita_enea: boolean
  problema: boolean
  pratica_finale_enea_path: string | null
  pratica_finale_ricevuta_path: string | null
  pratica_finale_dichiarazione_path: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type PraticaClientView = Omit<
  Pratica,
  'azienda_partner_id' | 'access_token' | 'note' | 'created_by' | 'created_at' | 'updated_at'
>

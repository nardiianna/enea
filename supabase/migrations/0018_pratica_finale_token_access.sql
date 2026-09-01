-- get_pratica_by_token() was never updated after 0013_pratica_finale_tre_file.sql
-- split pratica_finale_path into three columns, so the client-facing portal
-- (ClientForm.tsx / PraticaFinaleDownload) always saw them as null.

drop function if exists get_pratica_by_token(text);

create or replace function get_pratica_by_token(p_token text)
returns table (
  id uuid,
  stato text,
  azienda_partner_id uuid,
  azienda_partner_nome text,
  tipo_lavoro text[],
  cognome text,
  nome text,
  telefono text,
  data_nascita date,
  luogo_nascita text,
  stato_nascita text,
  regione_nascita text,
  provincia_nascita text,
  residenza text,
  lavori_presso text,
  abitazione_principale boolean,
  abitazione_proprieta boolean,
  familiare_convivente boolean,
  diritto_godimento text,
  tipo_abitazione text,
  metri_quadri int,
  anno_costruzione int,
  unita_abitative int,
  caldaia text,
  caldaia_altro text,
  combustibile text,
  combustibile_altro text,
  impianto_tipo text,
  impianto_erogazione text,
  impianto_altro text,
  condizionatore boolean,
  tipo_bonifico text,
  foglio text,
  mappale text,
  sub text,
  dettaglio_serramenti jsonb,
  dettaglio_porta_blindata jsonb,
  dettaglio_chiusure_oscuranti jsonb,
  dettaglio_schermature_solari jsonb,
  dettaglio_caldaia jsonb,
  dettaglio_condizionatore jsonb,
  note_cliente text,
  pratica_finale_enea_path text,
  pratica_finale_ricevuta_path text,
  pratica_finale_dichiarazione_path text
)
language sql security definer set search_path = public as $$
  select
    p.id, p.stato, p.azienda_partner_id, a.nome, p.tipo_lavoro, p.cognome, p.nome, p.telefono, p.data_nascita,
    p.luogo_nascita, p.stato_nascita, p.regione_nascita, p.provincia_nascita,
    p.residenza, p.lavori_presso, p.abitazione_principale, p.abitazione_proprieta,
    p.familiare_convivente, p.diritto_godimento, p.tipo_abitazione, p.metri_quadri,
    p.anno_costruzione, p.unita_abitative, p.caldaia, p.caldaia_altro, p.combustibile,
    p.combustibile_altro, p.impianto_tipo, p.impianto_erogazione, p.impianto_altro,
    p.condizionatore, p.tipo_bonifico, p.foglio, p.mappale, p.sub,
    p.dettaglio_serramenti, p.dettaglio_porta_blindata, p.dettaglio_chiusure_oscuranti,
    p.dettaglio_schermature_solari, p.dettaglio_caldaia, p.dettaglio_condizionatore, p.note_cliente,
    p.pratica_finale_enea_path, p.pratica_finale_ricevuta_path, p.pratica_finale_dichiarazione_path
  from pratiche p
  join aziende_partner a on a.id = p.azienda_partner_id
  where p.access_token = p_token;
$$;

revoke all on function get_pratica_by_token(text) from public;
grant execute on function get_pratica_by_token(text) to anon, authenticated;

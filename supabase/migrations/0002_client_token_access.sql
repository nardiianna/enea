-- Client-side access via one-time link token, with no Supabase auth account.
-- Both functions are SECURITY DEFINER so they can bypass RLS, but only ever
-- touch the single row matching the token, and only fields listed explicitly below.

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
  dettaglio_schermature_solari jsonb
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
    p.dettaglio_schermature_solari
  from pratiche p
  join aziende_partner a on a.id = p.azienda_partner_id
  where p.access_token = p_token;
$$;

revoke all on function get_pratica_by_token(text) from public;
grant execute on function get_pratica_by_token(text) to anon, authenticated;

create or replace function submit_pratica_by_token(p_token text, p_data jsonb)
returns void
language plpgsql security definer set search_path = public as $$
begin
  update pratiche set
    cognome = coalesce(p_data->>'cognome', cognome),
    nome = coalesce(p_data->>'nome', nome),
    telefono = coalesce(p_data->>'telefono', telefono),
    data_nascita = coalesce((p_data->>'data_nascita')::date, data_nascita),
    luogo_nascita = coalesce(p_data->>'luogo_nascita', luogo_nascita),
    stato_nascita = coalesce(p_data->>'stato_nascita', stato_nascita),
    regione_nascita = coalesce(p_data->>'regione_nascita', regione_nascita),
    provincia_nascita = coalesce(p_data->>'provincia_nascita', provincia_nascita),
    residenza = coalesce(p_data->>'residenza', residenza),
    lavori_presso = coalesce(p_data->>'lavori_presso', lavori_presso),
    abitazione_principale = coalesce((p_data->>'abitazione_principale')::boolean, abitazione_principale),
    abitazione_proprieta = coalesce((p_data->>'abitazione_proprieta')::boolean, abitazione_proprieta),
    familiare_convivente = coalesce((p_data->>'familiare_convivente')::boolean, familiare_convivente),
    diritto_godimento = coalesce(p_data->>'diritto_godimento', diritto_godimento),
    tipo_abitazione = coalesce(p_data->>'tipo_abitazione', tipo_abitazione),
    metri_quadri = coalesce((p_data->>'metri_quadri')::int, metri_quadri),
    anno_costruzione = coalesce((p_data->>'anno_costruzione')::int, anno_costruzione),
    unita_abitative = coalesce((p_data->>'unita_abitative')::int, unita_abitative),
    caldaia = coalesce(p_data->>'caldaia', caldaia),
    caldaia_altro = coalesce(p_data->>'caldaia_altro', caldaia_altro),
    combustibile = coalesce(p_data->>'combustibile', combustibile),
    combustibile_altro = coalesce(p_data->>'combustibile_altro', combustibile_altro),
    impianto_tipo = coalesce(p_data->>'impianto_tipo', impianto_tipo),
    impianto_erogazione = coalesce(p_data->>'impianto_erogazione', impianto_erogazione),
    impianto_altro = coalesce(p_data->>'impianto_altro', impianto_altro),
    condizionatore = coalesce((p_data->>'condizionatore')::boolean, condizionatore),
    tipo_bonifico = coalesce(p_data->>'tipo_bonifico', tipo_bonifico),
    foglio = coalesce(p_data->>'foglio', foglio),
    mappale = coalesce(p_data->>'mappale', mappale),
    sub = coalesce(p_data->>'sub', sub),
    dettaglio_serramenti = coalesce(p_data->'dettaglio_serramenti', dettaglio_serramenti),
    dettaglio_porta_blindata = coalesce(p_data->'dettaglio_porta_blindata', dettaglio_porta_blindata),
    dettaglio_chiusure_oscuranti = coalesce(p_data->'dettaglio_chiusure_oscuranti', dettaglio_chiusure_oscuranti),
    dettaglio_schermature_solari = coalesce(p_data->'dettaglio_schermature_solari', dettaglio_schermature_solari),
    stato = 'compilata_da_cliente'
  where access_token = p_token
    and stato = 'in_attesa_cliente';
end;
$$;

revoke all on function submit_pratica_by_token(text, jsonb) from public;
grant execute on function submit_pratica_by_token(text, jsonb) to anon, authenticated;

-- Simplify pratica status to a 2-value "contacted" flag.
-- Mapping of old values: in_attesa_cliente -> da_contattare; everything further along
-- (compilata_da_cliente, in_revisione, completata) -> contattato.

alter table pratiche drop constraint if exists pratiche_stato_check;

-- The restrict_partner_pratiche_update trigger reverts `stato` to its old value for any
-- update run outside an is_admin() session (which includes this migration) — disable it
-- for the bulk data migration below, then restore it immediately after.
alter table pratiche disable trigger pratiche_restrict_partner_update;

update pratiche set stato = 'da_contattare' where stato = 'in_attesa_cliente';
update pratiche set stato = 'contattato' where stato in ('compilata_da_cliente', 'in_revisione', 'completata');

alter table pratiche enable trigger pratiche_restrict_partner_update;

alter table pratiche alter column stato set default 'da_contattare';
alter table pratiche add constraint pratiche_stato_check check (stato in ('da_contattare', 'contattato'));

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
    dettaglio_caldaia = coalesce(p_data->'dettaglio_caldaia', dettaglio_caldaia),
    dettaglio_condizionatore = coalesce(p_data->'dettaglio_condizionatore', dettaglio_condizionatore),
    note_cliente = coalesce(p_data->>'note_cliente', note_cliente),
    stato = 'contattato'
  where access_token = p_token
    and stato = 'da_contattare';
end;
$$;

revoke all on function submit_pratica_by_token(text, jsonb) from public;
grant execute on function submit_pratica_by_token(text, jsonb) to anon, authenticated;

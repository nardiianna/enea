-- Partners can now add their own clients (migration 0009), so there's no
-- longer a reason to gate what they see behind an admin-only flag: whoever
-- adds a client, both admin and partner see the exact same list. Drop the
-- visibile_azienda column and the policies/trigger that referenced it.

drop policy if exists pratiche_partner_select on pratiche;
create policy pratiche_partner_select on pratiche
  for select using (azienda_partner_id = my_azienda_partner_id());

drop policy if exists pratiche_partner_update on pratiche;
create policy pratiche_partner_update on pratiche
  for update
  using (azienda_partner_id = my_azienda_partner_id())
  with check (azienda_partner_id = my_azienda_partner_id());

create or replace function restrict_partner_pratiche_update()
returns trigger language plpgsql as $$
begin
  if not is_admin() then
    new.azienda_partner_id := old.azienda_partner_id;
    new.access_token := old.access_token;
    new.stato := old.stato;
    new.tipo_lavoro := old.tipo_lavoro;
    new.aliquota := old.aliquota;
    new.abitazione_principale := old.abitazione_principale;
    new.abitazione_proprieta := old.abitazione_proprieta;
    new.familiare_convivente := old.familiare_convivente;
    new.diritto_godimento := old.diritto_godimento;
    new.tipo_abitazione := old.tipo_abitazione;
    new.metri_quadri := old.metri_quadri;
    new.anno_costruzione := old.anno_costruzione;
    new.unita_abitative := old.unita_abitative;
    new.caldaia := old.caldaia;
    new.caldaia_altro := old.caldaia_altro;
    new.combustibile := old.combustibile;
    new.combustibile_altro := old.combustibile_altro;
    new.impianto_tipo := old.impianto_tipo;
    new.impianto_erogazione := old.impianto_erogazione;
    new.impianto_altro := old.impianto_altro;
    new.condizionatore := old.condizionatore;
    new.tipo_bonifico := old.tipo_bonifico;
    new.foglio := old.foglio;
    new.mappale := old.mappale;
    new.sub := old.sub;
    new.dettaglio_serramenti := old.dettaglio_serramenti;
    new.dettaglio_porta_blindata := old.dettaglio_porta_blindata;
    new.dettaglio_chiusure_oscuranti := old.dettaglio_chiusure_oscuranti;
    new.dettaglio_schermature_solari := old.dettaglio_schermature_solari;
    new.dettaglio_caldaia := old.dettaglio_caldaia;
    new.dettaglio_condizionatore := old.dettaglio_condizionatore;
    new.note := old.note;
    new.note_cliente := old.note_cliente;
    new.inserita_enea := old.inserita_enea;
    new.problema := old.problema;
    new.pratica_finale_path := old.pratica_finale_path;
    new.created_by := old.created_by;
    new.created_at := old.created_at;
  end if;
  return new;
end;
$$;

alter table pratiche drop column if exists visibile_azienda;

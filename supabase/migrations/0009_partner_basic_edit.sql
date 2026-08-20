-- Partners can now add their own clients (basic anagrafica only) and upload
-- their documents, instead of being fully read-only.
--
-- 1. Partners can always see pratiche they created themselves, even before
--    an admin flips visibile_azienda (previously they'd insert a row and
--    immediately be unable to see it again).
-- 2. Partners can insert new pratiche for their own azienda.
-- 3. Partners can update pratiche in their own azienda, but a trigger locks
--    every column beyond basic anagrafica back to its previous value — the
--    "Diritti sull'immobile" section onward stays admin/Federico-only even
--    if someone bypasses the UI.
-- 4. Partners can manage files in the "fatture" bucket for their own
--    azienda's pratiche.

drop policy if exists pratiche_partner_select on pratiche;
create policy pratiche_partner_select on pratiche
  for select using (
    azienda_partner_id = my_azienda_partner_id()
    and (visibile_azienda = true or created_by = auth.uid())
  );

create policy pratiche_partner_insert on pratiche
  for insert with check (azienda_partner_id = my_azienda_partner_id());

create policy pratiche_partner_update on pratiche
  for update
  using (
    azienda_partner_id = my_azienda_partner_id()
    and (visibile_azienda = true or created_by = auth.uid())
  )
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
    new.visibile_azienda := old.visibile_azienda;
    new.problema := old.problema;
    new.pratica_finale_path := old.pratica_finale_path;
    new.created_by := old.created_by;
    new.created_at := old.created_at;
  end if;
  return new;
end;
$$;

drop trigger if exists pratiche_restrict_partner_update on pratiche;
create trigger pratiche_restrict_partner_update
  before update on pratiche
  for each row execute function restrict_partner_pratiche_update();

drop policy if exists "Partners manage own fatture" on storage.objects;
create policy "Partners manage own fatture" on storage.objects
  for all using (
    bucket_id = 'fatture'
    and exists (
      select 1 from pratiche p
      where p.id::text = (storage.foldername(name))[1]
        and p.azienda_partner_id = my_azienda_partner_id()
    )
  )
  with check (
    bucket_id = 'fatture'
    and exists (
      select 1 from pratiche p
      where p.id::text = (storage.foldername(name))[1]
        and p.azienda_partner_id = my_azienda_partner_id()
    )
  );

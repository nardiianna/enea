-- Two admin-only flags on each pratica:
-- - inserita_enea: whether the admin has actually filed the practice on the official ENEA portal
-- - visibile_azienda: whether the partner company can see this client yet (defaults to hidden)

alter table pratiche
  add column if not exists inserita_enea boolean not null default false,
  add column if not exists visibile_azienda boolean not null default false;

drop policy if exists pratiche_partner_select on pratiche;
create policy pratiche_partner_select on pratiche
  for select using (azienda_partner_id = my_azienda_partner_id() and visibile_azienda = true);

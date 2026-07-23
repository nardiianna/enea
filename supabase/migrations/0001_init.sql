-- Enea portal: core schema
-- Roles: admin (full access), partner (own azienda's pratiche only), cliente (token link, no auth account)

create table if not exists aziende_partner (
  id uuid primary key default gen_random_uuid(),
  nome text unique not null,
  created_at timestamptz not null default now()
);

insert into aziende_partner (nome) values
  ('Viss'), ('Edp'), ('Kasa'), ('Zacchello'), ('R&T'), ('Miozzo'), ('Sorgato'), ('Ruzzon')
on conflict (nome) do nothing;

-- One row per authenticated user (admin or partner), linked to auth.users
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'partner')),
  azienda_partner_id uuid references aziende_partner (id),
  created_at timestamptz not null default now(),
  constraint partner_must_have_azienda check (
    (role = 'partner' and azienda_partner_id is not null) or
    (role = 'admin' and azienda_partner_id is null)
  )
);

create table if not exists pratiche (
  id uuid primary key default gen_random_uuid(),
  azienda_partner_id uuid not null references aziende_partner (id),
  access_token text not null unique default replace(gen_random_uuid()::text, '-', ''),

  stato text not null default 'in_attesa_cliente'
    check (stato in ('in_attesa_cliente', 'compilata_da_cliente', 'in_revisione', 'completata')),

  tipo_lavoro text[] not null default '{}',
  -- values: 'serramenti' | 'porta_blindata' | 'chiusure_oscuranti' | 'schermature_solari'
  aliquota text check (aliquota in ('50', '36')),

  -- anagrafica
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

  -- diritti sull'immobile
  abitazione_principale boolean,
  abitazione_proprieta boolean,
  familiare_convivente boolean,
  diritto_godimento text
    check (diritto_godimento in ('usufruttuario', 'nudo_proprietario', 'uso_abitazione', 'proprietario_superficie')),

  -- dati immobile
  tipo_abitazione text
    check (tipo_abitazione in ('singola', 'bifamiliare', 'schiera', 'condominio_leq3', 'condominio_gt3')),
  metri_quadri int,
  anno_costruzione int,
  unita_abitative int,

  -- impianti
  caldaia text check (caldaia in ('normale', 'condensazione', 'pompa_di_calore', 'altro')),
  caldaia_altro text,
  combustibile text check (combustibile in ('gas_metano', 'gasolio', 'gpl', 'energia_elettrica', 'altro')),
  combustibile_altro text,
  impianto_tipo text check (impianto_tipo in ('autonomo', 'centralizzato')),
  impianto_erogazione text check (impianto_erogazione in ('radiatori', 'pavimento', 'altro')),
  impianto_altro text,
  condizionatore boolean,

  tipo_bonifico text check (tipo_bonifico in ('risparmio_energetico', 'ristrutturazione')),

  -- dati catastali
  foglio text,
  mappale text,
  sub text,

  -- dettagli condizionali per tipo lavoro (uno per ogni voce in tipo_lavoro)
  dettaglio_serramenti jsonb,
  dettaglio_porta_blindata jsonb,
  dettaglio_chiusure_oscuranti jsonb,
  dettaglio_schermature_solari jsonb,

  note text,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pratiche_azienda_partner_id_idx on pratiche (azienda_partner_id);

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists pratiche_set_updated_at on pratiche;
create trigger pratiche_set_updated_at
  before update on pratiche
  for each row execute function set_updated_at();

alter table aziende_partner enable row level security;
alter table profiles enable row level security;
alter table pratiche enable row level security;

create or replace function is_admin()
returns boolean language sql stable as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function my_azienda_partner_id()
returns uuid language sql stable as $$
  select azienda_partner_id from profiles where id = auth.uid() and role = 'partner';
$$;

-- aziende_partner: admins manage, partners can read their own, everyone authenticated can read the list (for admin forms)
create policy aziende_partner_select on aziende_partner
  for select using (auth.role() = 'authenticated');
create policy aziende_partner_admin_write on aziende_partner
  for all using (is_admin()) with check (is_admin());

-- profiles: admins manage everything, users can read their own profile
create policy profiles_self_select on profiles
  for select using (id = auth.uid() or is_admin());
create policy profiles_admin_write on profiles
  for all using (is_admin()) with check (is_admin());

-- pratiche: admins full access, partners read-only on their own azienda's pratiche
create policy pratiche_admin_all on pratiche
  for all using (is_admin()) with check (is_admin());
create policy pratiche_partner_select on pratiche
  for select using (azienda_partner_id = my_azienda_partner_id());

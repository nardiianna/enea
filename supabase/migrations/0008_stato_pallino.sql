-- Admin-only "problema" flag, plus the storage path of the final filed practice
-- ("pratica finale"). Both drive the colored status dot shown next to each
-- client in the admin lists (rosso = problema, giallo = compilata ma non
-- ancora inserita su ENEA, verde = pratica finale allegata, bianco = nessuna
-- segnalazione). The file itself lives in the existing private "fatture"
-- bucket under "<pratica_id>/pratica-finale/<filename>", already admin-only
-- via the "Admins manage fatture" storage policy from migration 0004.

alter table pratiche
  add column if not exists problema boolean not null default false,
  add column if not exists pratica_finale_path text;

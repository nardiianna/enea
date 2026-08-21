-- Optional free-text field for the client's own employer/company (not the partner company).

alter table pratiche
  add column if not exists azienda text;

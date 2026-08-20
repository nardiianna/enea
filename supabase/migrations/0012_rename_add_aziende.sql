-- Rename a handful of partner companies to their full trade names, and add
-- the new partner companies that have joined since the initial seed.

update aziende_partner set nome = 'Kasa Serramenti' where nome = 'Kasa';
update aziende_partner set nome = 'Falegnameria Ruzzon' where nome = 'Ruzzon';
update aziende_partner set nome = 'Sorgato Home' where nome = 'Sorgato';
update aziende_partner set nome = 'Di Nuovo Serramenti' where nome = 'Zacchello';

insert into aziende_partner (nome) values
  ('Profine'),
  ('Nuova Tecno Infissi'),
  ('Falegnameria Scalco'),
  ('Privati')
on conflict (nome) do nothing;

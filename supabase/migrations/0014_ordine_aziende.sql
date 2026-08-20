-- The "Aziende partner" grid was sorted alphabetically, which shuffled the
-- companies away from the fixed order the admin actually wants. Add an
-- explicit sort_order and set it to that order; new companies default to
-- the end of the list.

alter table aziende_partner add column if not exists sort_order int;

update aziende_partner set sort_order = fixed_order.ordinal from (
  values
    ('Edil Plastix', 1),
    ('Kasa Serramenti', 2),
    ('Miozzo', 3),
    ('R&T', 4),
    ('Falegnameria Ruzzon', 5),
    ('Sorgato Home', 6),
    ('Viss', 7),
    ('Di Nuovo Serramenti', 8),
    ('Profine', 9),
    ('Nuova Tecno Infissi', 10),
    ('Falegnameria Scalco', 11),
    ('Privati', 12)
) as fixed_order(nome, ordinal)
where aziende_partner.nome = fixed_order.nome;

update aziende_partner set sort_order = 999 where sort_order is null;

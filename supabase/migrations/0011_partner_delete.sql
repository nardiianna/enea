-- Both admins and partners can already create pratiche for a partner's
-- azienda; now both can also delete one if it was added by mistake.
-- Admins already have full access via pratiche_admin_all.

create policy pratiche_partner_delete on pratiche
  for delete using (azienda_partner_id = my_azienda_partner_id());

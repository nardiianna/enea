-- Partners can no longer delete clients themselves (only admins can, via pratiche_admin_all).
drop policy if exists pratiche_partner_delete on pratiche;

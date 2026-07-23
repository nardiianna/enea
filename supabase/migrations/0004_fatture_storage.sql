-- Private storage bucket for invoices ("fatture") attached to each pratica (client folder).
-- Objects are stored under path "<pratica_id>/<filename>". Admin-only access.

insert into storage.buckets (id, name, public)
values ('fatture', 'fatture', false)
on conflict (id) do nothing;

create policy "Admins manage fatture" on storage.objects
  for all using (bucket_id = 'fatture' and is_admin())
  with check (bucket_id = 'fatture' and is_admin());

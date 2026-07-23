-- is_admin()/my_azienda_partner_id() query "profiles", which itself has RLS policies that
-- call is_admin()/my_azienda_partner_id() -> infinite recursion ("stack depth limit exceeded").
-- Making them SECURITY DEFINER runs the internal query as the function owner, bypassing RLS
-- entirely inside the function body, which breaks the recursion.

create or replace function is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function my_azienda_partner_id()
returns uuid language sql stable security definer set search_path = public as $$
  select azienda_partner_id from profiles where id = auth.uid() and role = 'partner';
$$;

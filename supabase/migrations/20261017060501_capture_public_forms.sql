-- Match the existing AdminRoute email allowlist. Public callers may submit,
-- but only approved administrators may read contact details or change read status.
create policy "Approved admins read contact messages"
on public.contact_messages for select to authenticated
using (lower(auth.jwt() ->> 'email') in ('mariame@ryamchouu.com','tunde@ryamchouu.com','gamesandconnectgh@gmail.com'));

create policy "Approved admins update contact read status"
on public.contact_messages for update to authenticated
using (lower(auth.jwt() ->> 'email') in ('mariame@ryamchouu.com','tunde@ryamchouu.com','gamesandconnectgh@gmail.com'))
with check (lower(auth.jwt() ->> 'email') in ('mariame@ryamchouu.com','tunde@ryamchouu.com','gamesandconnectgh@gmail.com'));

revoke update on public.contact_messages from anon, authenticated;
grant update (is_read) on public.contact_messages to authenticated;

-- Accounts created via the public signup form must also appear in Admin > Users.
-- The trigger runs internally because public clients cannot insert profiles before
-- email confirmation. Its function is private and cannot be called via the API.
create schema if not exists private;
create function private.capture_signup_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.email is not null then
    insert into public.profiles(id,email,role,created_at)
    values (new.id,new.email,'user',new.created_at)
    on conflict (id) do update set email = excluded.email;
  end if;
  return new;
end;
$$;
revoke all on function private.capture_signup_profile() from public, anon, authenticated;
create trigger capture_signup_profile after insert or update of email on auth.users
for each row execute function private.capture_signup_profile();

-- Recover signup records already missing from Admin without altering existing roles.
insert into public.profiles(id,email,role,created_at)
select u.id,u.email,'user',u.created_at from auth.users u
where u.email is not null and not exists (select 1 from public.profiles p where p.id=u.id)
on conflict do nothing;

create policy "Approved admins read user profiles"
on public.profiles for select to authenticated
using (lower(auth.jwt() ->> 'email') in ('mariame@ryamchouu.com','tunde@ryamchouu.com','gamesandconnectgh@gmail.com'));

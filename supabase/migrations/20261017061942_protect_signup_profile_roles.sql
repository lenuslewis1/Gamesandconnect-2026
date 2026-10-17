-- Restrictive rules are ANDed with existing ownership policies. Ordinary users
-- may manage their own user profile, but cannot insert or change it to admin.
-- Existing approved administrators retain their current profile permissions.
create policy "Prevent self assigned administrator roles"
on public.profiles as restrictive for all to authenticated
using (
  coalesce(role, 'user') = 'user' or
  lower(auth.jwt() ->> 'email') in ('mariame@ryamchouu.com','tunde@ryamchouu.com','gamesandconnectgh@gmail.com')
)
with check (
  coalesce(role, 'user') = 'user' or
  lower(auth.jwt() ->> 'email') in ('mariame@ryamchouu.com','tunde@ryamchouu.com','gamesandconnectgh@gmail.com')
);

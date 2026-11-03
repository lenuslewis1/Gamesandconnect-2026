-- Preserve each supplied community record; deduplicate only the SMS contact list.
create table public.community_members (
  id uuid primary key default gen_random_uuid(),
  first_name text not null default '',
  last_name text not null default '',
  phone text not null,
  normalized_phone text generated always as (public.sms_ghana_phone(phone)) stored,
  email text not null default '',
  source_filename text not null,
  import_file_hash text not null check (import_file_hash ~ '^[a-f0-9]{64}$'),
  source_row integer not null check (source_row >= 2),
  source_record jsonb not null,
  created_at timestamptz not null default now(),
  unique (import_file_hash, source_row)
);
alter table public.community_members enable row level security;
revoke all on public.community_members from anon, authenticated;
grant select on public.community_members to authenticated;
grant all on public.community_members to service_role;
create policy "Approved admins read community members" on public.community_members for select to authenticated
using (lower(auth.jwt()->>'email') in ('mariame@ryamchouu.com','tunde@ryamchouu.com','gamesandconnectgh@gmail.com'));
create index community_members_created_idx on public.community_members(created_at desc, source_row);
create index community_members_phone_idx on public.community_members(normalized_phone);

create function private.capture_community_member() returns trigger
language plpgsql security definer set search_path = '' as $$
declare contact_phone text := public.sms_ghana_phone(new.phone);
begin
  if contact_phone is null then return new; end if;
  insert into public.website_contacts as c(contact_key,name,email,phone,sources)
  values ('phone:' || contact_phone,trim(new.first_name || ' ' || new.last_name),trim(new.email),contact_phone,array['community_members'])
  on conflict (contact_key) do update set
    name = coalesce(nullif(c.name,''),excluded.name),
    email = coalesce(nullif(c.email,''),excluded.email),
    sources = array(select distinct unnest(c.sources || excluded.sources));
  -- Existing names, email addresses, phone formatting, dates and SMS exclusions are preserved.
  return new;
end;
$$;
revoke all on function private.capture_community_member() from public, anon, authenticated;
create trigger capture_community_member after insert on public.community_members
for each row execute function private.capture_community_member();

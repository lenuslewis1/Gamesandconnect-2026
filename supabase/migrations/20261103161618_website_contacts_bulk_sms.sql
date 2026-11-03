-- Contacts stay private; website submissions can only reach them via internal triggers.
create schema if not exists private;
alter table public.contact_messages add column if not exists phone text not null default '' check (length(phone) <= 40);
grant insert (phone) on public.contact_messages to anon, authenticated;

create function public.sms_ghana_phone(value text) returns text
language sql immutable set search_path = '' as $$
  select case
    when digits ~ '^233[0-9]{9}$' then digits
    when digits ~ '^0[0-9]{9}$' then '233' || substr(digits,2)
    when digits ~ '^[0-9]{9}$' then '233' || digits
    else null end
  from (select regexp_replace(coalesce(value,''),'[^0-9]','','g') as digits) d;
$$;

create table public.website_contacts (
  id uuid primary key default gen_random_uuid(),
  contact_key text not null unique,
  name text not null default '',
  email text not null default '',
  phone text not null default '',
  normalized_phone text generated always as (public.sms_ghana_phone(phone)) stored,
  sources text[] not null default '{}',
  sms_opt_out boolean not null default false,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);
alter table public.website_contacts enable row level security;
revoke all on public.website_contacts from anon, authenticated;
grant select on public.website_contacts to authenticated;
grant update (sms_opt_out) on public.website_contacts to authenticated;
grant all on public.website_contacts to service_role;
create policy "Approved admins read website contacts" on public.website_contacts for select to authenticated
using (lower(auth.jwt()->>'email') in ('mariame@ryamchouu.com','tunde@ryamchouu.com','gamesandconnectgh@gmail.com'));
create policy "Approved admins update SMS preference" on public.website_contacts for update to authenticated
using (lower(auth.jwt()->>'email') in ('mariame@ryamchouu.com','tunde@ryamchouu.com','gamesandconnectgh@gmail.com'))
with check (lower(auth.jwt()->>'email') in ('mariame@ryamchouu.com','tunde@ryamchouu.com','gamesandconnectgh@gmail.com'));
create index website_contacts_last_seen_idx on public.website_contacts(last_seen_at desc, id);
create index website_contacts_sources_idx on public.website_contacts using gin(sources);

create function private.save_website_contact(record jsonb, source text) returns void
language plpgsql security definer set search_path = '' as $$
declare
  contact_name text := left(trim(coalesce(record->>'full_name',record->>'contact_name',record->>'name','')),200);
  contact_email text := left(lower(trim(coalesce(record->>'email',''))),254);
  contact_phone text := left(trim(coalesce(record->>'phone_number',record->>'phone','')),40);
  identity_key text;
  seen_at timestamptz := coalesce((record->>'created_at')::timestamptz,now());
begin
  identity_key := case
    when public.sms_ghana_phone(contact_phone) is not null then 'phone:' || public.sms_ghana_phone(contact_phone)
    when contact_phone <> '' then 'phone:' || regexp_replace(contact_phone,'[^0-9+]','','g')
    when contact_email <> '' then 'email:' || contact_email
    else null end;
  if identity_key is null then return; end if;
  insert into public.website_contacts as c(contact_key,name,email,phone,sources,first_seen_at,last_seen_at)
  values(identity_key,contact_name,contact_email,contact_phone,array[source],seen_at,seen_at)
  on conflict (contact_key) do update set
    name = case when excluded.last_seen_at >= c.last_seen_at and excluded.name <> '' then excluded.name else c.name end,
    email = case when excluded.last_seen_at >= c.last_seen_at and excluded.email <> '' then excluded.email else c.email end,
    phone = case when excluded.last_seen_at >= c.last_seen_at and excluded.phone <> '' then excluded.phone else c.phone end,
    sources = array(select distinct unnest(c.sources || excluded.sources)),
    first_seen_at = least(c.first_seen_at,excluded.first_seen_at),
    last_seen_at = greatest(c.last_seen_at,excluded.last_seen_at);
end;
$$;
revoke all on function private.save_website_contact(jsonb,text) from public, anon, authenticated;

create function private.capture_website_contact() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform private.save_website_contact(to_jsonb(new),tg_table_name);
  return new;
end;
$$;
revoke all on function private.capture_website_contact() from public, anon, authenticated;

-- JSON conversion tolerates older source schemas; backfill and future submissions use the same code.
do $$
declare source text; row_data jsonb;
begin
  foreach source in array array['contact_messages','corporate_enquiries','registrations','event_registrations','team_registrations','profiles'] loop
    if to_regclass(format('public.%I',source)) is not null then
      execute format('create trigger capture_website_contact after insert or update on public.%I for each row execute function private.capture_website_contact()',source);
      for row_data in execute format('select to_jsonb(t) from public.%I t',source) loop
        perform private.save_website_contact(row_data,source);
      end loop;
    end if;
  end loop;
end;
$$;

create table public.sms_campaigns (
  id uuid primary key,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  message text not null check (length(trim(message)) between 1 and 1000),
  recipient_ids uuid[] not null,
  recipient_count integer not null check (recipient_count between 1 and 500),
  accepted_count integer not null default 0,
  status text not null default 'sending' check (status in ('sending','accepted','partial','failed','unknown')),
  provider_campaign_id text,
  error text,
  completed_at timestamptz
);
alter table public.sms_campaigns enable row level security;
revoke all on public.sms_campaigns from anon, authenticated;
grant select on public.sms_campaigns to authenticated;
grant all on public.sms_campaigns to service_role;
create policy "Approved admins read SMS history" on public.sms_campaigns for select to authenticated
using (lower(auth.jwt()->>'email') in ('mariame@ryamchouu.com','tunde@ryamchouu.com','gamesandconnectgh@gmail.com'));
create index sms_campaigns_created_idx on public.sms_campaigns(created_at desc);

create table public.corporate_enquiries (
  id uuid primary key,
  created_at timestamptz not null default now(),
  company text not null check (length(trim(company)) between 1 and 120),
  contact_name text not null check (length(trim(contact_name)) between 1 and 100),
  email text not null check (length(email) <= 160 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  phone text not null check (length(trim(phone)) between 5 and 40),
  team_size integer not null check (team_size between 2 and 10000),
  preferred_date date,
  experience text not null check (experience in ('Team games and challenges','Outdoor team outing','Corporate retreat','Staff celebration','Help us choose')),
  location text not null default '' check (length(location) <= 160),
  budget text not null default '' check (length(budget) <= 100),
  requirements text not null default '' check (length(requirements) <= 1500)
);
alter table public.corporate_enquiries enable row level security;
revoke all on public.corporate_enquiries from anon, authenticated;
grant insert (id,company,contact_name,email,phone,team_size,preferred_date,experience,location,budget,requirements) on public.corporate_enquiries to anon, authenticated;
grant select on public.corporate_enquiries to authenticated;
create policy "Visitors submit enquiries" on public.corporate_enquiries for insert to anon, authenticated with check (preferred_date is null or preferred_date >= current_date);
create policy "Administrators read enquiries" on public.corporate_enquiries for select to authenticated using (
  lower(auth.jwt() ->> 'email') in ('mariame@ryamchouu.com','tunde@ryamchouu.com','gamesandconnectgh@gmail.com')
);

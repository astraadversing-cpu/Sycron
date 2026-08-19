create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  phone text not null default '',
  role text not null default 'User',
  region text not null default '',
  plan text not null default 'FREE',
  nodes_count integer not null default 0,
  confirmed_reports_count integer not null default 0,
  two_factor_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.entities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  collection text not null check (collection in ('regions', 'nodes', 'connections', 'alerts', 'news', 'channels', 'participants', 'auditLogs', 'reports', 'invoices', 'notifications')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists entities_owner_collection_idx on public.entities(owner_id, collection);

alter table public.profiles enable row level security;
alter table public.entities enable row level security;

create policy "Users can read their profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can create their profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can manage their entities" on public.entities for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
-- ============================================================
-- SVS Portal — Supabase Schema
-- Ausführen im Supabase SQL Editor
-- ============================================================

-- Rollen (enum-ähnlich als Text mit Check)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text not null,
  role text not null check (role in (
    'admin',
    'vorsitzender_1',
    'vorsitzender_2',
    'jugendleiter',
    'schatzmeister',
    'jugendleiter_2',
    'leiter_maenner',
    'leiter_frauen',
    'sponsoren',
    'technik',
    'oeffentlichkeit',
    'ehrenamt',
    'vorstand',
    'readonly'
  )),
  phone text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Jeder Eingeloggte darf sein eigenes Profil lesen; Admins alles
create policy "own profile readable"
  on public.profiles for select
  using (auth.uid() = id);

create policy "admins read all profiles"
  on public.profiles for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "admins write profiles"
  on public.profiles for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Datei-Metadaten (eigentliche Files liegen in Storage Bucket 'files')
create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  storage_path text unique not null,
  original_name text not null,
  size_bytes bigint not null,
  mime_type text,
  uploaded_by uuid references public.profiles(id),
  folder text not null default 'allgemein',
  visibility text not null default 'vorstand' check (visibility in ('alle','vorstand','admin')),
  created_at timestamptz default now()
);

alter table public.files enable row level security;

create policy "list files by visibility"
  on public.files for select
  using (
    visibility = 'alle'
    or (visibility = 'vorstand' and exists (select 1 from public.profiles p where p.id = auth.uid()))
    or (visibility = 'admin'    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  );

create policy "upload files authenticated"
  on public.files for insert
  with check (auth.uid() is not null);

create policy "delete own or admin"
  on public.files for delete
  using (uploaded_by = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Storage Bucket
insert into storage.buckets (id, name, public)
  values ('files', 'files', false)
  on conflict (id) do nothing;

create policy "authenticated read"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'files');

create policy "authenticated upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'files');

create policy "authenticated delete own"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'files' and owner = auth.uid());

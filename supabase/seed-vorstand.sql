-- ============================================================
-- Vorstands-Mitglieder werden NICHT direkt als auth.users angelegt.
-- Stattdessen nutzt die Admin-Seite den Invite-Button, der via
-- Supabase Admin API einen User erstellt + Willkommensmail sendet.
--
-- Diese Tabelle enthält die "geplanten" Vorstandsmitglieder,
-- aus der die Admin-Seite Einladungen generiert.
-- ============================================================

create table if not exists public.vorstand_roster (
  id serial primary key,
  funktion text not null,
  full_name text not null,
  email text not null unique,
  phone text,
  role text not null,
  invited boolean default false
);

alter table public.vorstand_roster enable row level security;

create policy "admin all vorstand_roster"
  on public.vorstand_roster for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

insert into public.vorstand_roster (funktion, full_name, email, phone, role) values
('1. Vorsitzender',            'Jochen Keutel',       'jochen.keutel@schmoecke.de',       '0171 4076418', 'admin'),
('2. Vorsitzender',            'Patrick Biermann',    'patrick.biermann@schmoecke.de',    '0176 73783425','vorsitzender_2'),
('Jugendleiter',               'Henri Schulmeister',  'henri.schulmeister@schmoecke.de',  '0151 40418033','jugendleiter'),
('Schatzmeister',              'Jan Möllerhenn',      'jan.moellerhenn@schmoecke.de',     '0160 2862026', 'schatzmeister'),
('2. Jugendleiter',            'Susanne Glettenberg', 'susanne.glettenberg@schmoecke.de', '0171 8666833', 'jugendleiter_2'),
('Leiter Frauen-/Mädchenfußball','Heiko Melzer',      'heiko.melzer@schmoecke.de',        '0172 3428993', 'leiter_frauen'),
('Sponsorenbeauftragter',      'Ramino Tran',         'ramino.tran@schmoecke.de',         '0176 22372297','sponsoren'),
('Leiter Technik',             'Felix Hartwig',       'felix.hartwig@schmoecke.de',       '01522 1713284','technik'),
('Ehrenamtsbeauftragter',      'Sven Thiel',          'sven.thiel@schmoecke.de',          '0178 4547600', 'ehrenamt')
on conflict (email) do nothing;

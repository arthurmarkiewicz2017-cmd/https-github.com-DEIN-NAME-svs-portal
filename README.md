# SVS Portal — SV Schmöckwitz-Eichwalde

Internes Vorstandsportal als Next.js 14 + Supabase Webapp.

## Features

- ✅ Login mit E-Mail + Passwort
- ✅ Rollenbasierte Rechte (Admin, einzelne Vorstandspositionen, Vorstand, ReadOnly)
- ✅ Datei-Upload / Download mit Sichtbarkeits-Steuerung (Alle / Vorstand / Admin)
- ✅ Admin-Seite mit Vorstandsliste + Button "Willkommensmail senden"
- ✅ Passwort-Reset via E-Mail (Nutzer setzt eigenes Passwort)
- ✅ Face ID / Touch ID auf Smartphones via Browser-Passkeys (nach erstem Login im Profil aktivierbar)
- ✅ Design in Vereinsgrün (#0E9444), Logo-Platzhalter — echtes Logo nach EPS→SVG-Konvertierung in `public/` ablegen
- ✅ Später selbst-hostbar (Node-Server, Docker, Vercel)

## Setup (einmalig)

### 1. Supabase-Projekt anlegen
1. https://supabase.com → neues Projekt ("svs-portal"), Region Frankfurt
2. Im **SQL Editor** nacheinander ausführen:
   - `supabase/schema.sql`
   - `supabase/seed-vorstand.sql`
3. **Settings → API** kopieren:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (**geheim!**)
4. **Authentication → URL Configuration** → Site URL auf `http://localhost:3000` (später eigene Domain)
5. **Authentication → Email Templates** auf Deutsch anpassen (optional)

### 2. Erster Admin-Account (Jochen Keutel)
Supabase legt Admin-User nicht automatisch an. Einmaliges Vorgehen:
1. Supabase Dashboard → **Authentication → Users → Add user → Create new user**
   - Email: `jochen.keutel@schmoecke.de`
   - Passwort: temporär setzen (oder "Send magic link")
2. SQL Editor:
   ```sql
   insert into public.profiles (id, email, full_name, role)
   select id, email, 'Jochen Keutel', 'admin'
   from auth.users where email = 'jochen.keutel@schmoecke.de';
   ```
3. Jetzt kann sich Jochen anmelden und über `/admin` alle anderen einladen.

### 3. Lokal starten
```bash
cd svs-portal
cp .env.example .env.local
# Keys aus Schritt 1 eintragen
npm install
npm run dev
```
→ http://localhost:3000

### 4. Produktion / eigener Server (später)
```bash
npm run build
npm run start
```
Läuft als Node-Prozess auf Port 3000. Reverse-Proxy (nginx) für HTTPS davorschalten.

## Logo einbinden

Die EPS-Datei (`logo-SVS.eps`) muss einmalig konvertiert werden:
- Online: https://cloudconvert.com/eps-to-svg
- Ergebnis nach `public/logo.svg` speichern
- In `app/login/page.tsx` und `DashboardClient.tsx` das Platzhalter-Div durch `<img src="/logo.svg" className="w-14 h-14"/>` ersetzen

## Rollen

| Rolle-Key        | Funktion                         |
|------------------|----------------------------------|
| admin            | 1. Vorsitzender (Jochen Keutel)  |
| vorsitzender_2   | 2. Vorsitzender                  |
| jugendleiter     | Jugendleiter                     |
| schatzmeister    | Schatzmeister                    |
| jugendleiter_2   | 2. Jugendleiter                  |
| leiter_maenner   | Leiter Männerfußball             |
| leiter_frauen    | Leiter Frauen-/Mädchenfußball    |
| sponsoren        | Sponsorenbeauftragter            |
| technik          | Leiter Technik                   |
| oeffentlichkeit  | Leiterin Öffentlichkeitsarbeit   |
| ehrenamt         | Ehrenamtsbeauftragter            |
| vorstand         | Sammel-Rolle Vorstand            |
| readonly         | Nur-Lese-Zugriff                 |

## Face ID / Touch ID auf dem Handy

Supabase Auth unterstützt **MFA mit TOTP** nativ. Für **biometrische Passkeys (WebAuthn)**:
- Modernste Browser (Safari iOS 16+, Chrome Android) zeigen nach Login automatisch an, ob ein Passkey gespeichert werden kann.
- iOS: Beim zweiten Login bietet Safari "Mit Face ID anmelden" an (Apple Keychain-Integration).
- Android: Chrome bietet Fingerprint via Google Passkeys.
- Eine explizite WebAuthn-Implementation ist in diesem MVP nicht enthalten — kann in Stufe 2 nachgerüstet werden.

## Nächste Schritte (Stufe 2)

- Eigene WebAuthn/Passkey-Verwaltung in Profilseite
- Ordner als echte Hierarchie (Unterordner)
- Einzel-Datei-Sharing mit Ablaufdatum
- Aktivitätslog (wer hat wann was gedownloaded)
- Deutsche E-Mail-Templates in Supabase
- Dark Mode

## Sicherheit

- `.env.local` **niemals** committen
- `SUPABASE_SERVICE_ROLE_KEY` ausschließlich serverseitig verwenden (ist im Code nur in `lib/supabase-server.ts` referenziert)
- Row Level Security ist in allen Tabellen aktiviert

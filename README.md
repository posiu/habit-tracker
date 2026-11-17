# Habit Tracker

Osobisty tracker nawyków i celów: codzienne wpisy (nawyki, nastrój, notatka), serie, mapa aktywności z ostatniego roku oraz cele z automatycznie liczonym postępem.

Aplikacja jest **w trakcie przepisywania z Ruby on Rails na Next.js + Supabase**, tak by całość hostować na Vercel i Supabase bez dodatkowych usług. Nowa aplikacja żyje w [`web/`](web), a pierwotny kod Rails jest zachowany w [`legacy-rails/`](legacy-rails) jako referencja.

## Stan

| Obszar | Stan |
|---|---|
| Rejestracja, logowanie, wylogowanie (Supabase Auth) | gotowe |
| Kategorie (kolor, ikona, opis) | gotowe |
| Nawyki (tak/nie, wartość, czas, licznik), archiwizacja | gotowe |
| Dzienne wpisy: nawyki, cele, nastrój 1–5, notatka | gotowe |
| Pulpit: postęp dnia, serie i rekordy, heatmapa roku | gotowe |
| Cele (dni z działaniem, dni bez, wartość, termin, własny) z postępem | gotowe |
| Raporty tygodniowe, miesięczne, kwartalne | do zrobienia |
| Ustawienia profilu (imię, strefa czasowa, język, przypomnienia) | do zrobienia |
| Deploy na Vercel + Supabase, usunięcie `legacy-rails/` | do zrobienia |

## Stack

- **Next.js 16** (App Router, React 19, Cache Components), TypeScript, Tailwind CSS 4
- **Supabase**: Postgres, Auth, Row Level Security
- **Zod** do walidacji, **Vitest** (testy jednostkowe i bazy), **Playwright** (e2e)
- Hosting docelowy: **Vercel** + **Supabase**

## Struktura repozytorium

```
web/                 aplikacja Next.js
  src/app/           strony i akcje serwerowe ((auth), (app): daily, habits, goals, categories)
  src/lib/domain/    czysta logika domenowa (walidacja, serie, postęp celów) z testami
  src/lib/supabase/  klienty Supabase (przeglądarka, serwer, proxy sesji)
  supabase/          konfiguracja lokalnego stosu i migracje SQL
  e2e/               testy Playwright
legacy-rails/        pierwotna aplikacja Rails 6.1 (archiwum, nie rozwijana)
```

## Uruchomienie lokalne

Wymagania: Node.js 20+, Docker (lokalny stos Supabase), Google Chrome (testy e2e).

```bash
cd web
npm install
npx supabase start          # Postgres, Auth, API i migracje w Dockerze
```

Skopiuj `web/.env.example` do `web/.env.local` i uzupełnij dwie zmienne wartościami z `npx supabase status`:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:57321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<Publishable key z supabase status>
```

```bash
npm run dev                 # http://localhost:3000
```

Porty lokalnego Supabase są przesunięte na 573xx (konfiguracja w `web/supabase/config.toml`), żeby nie kolidowały z innymi projektami. Konfirmacja e-mail jest lokalnie wyłączona, a wysłane maile widać w Mailpit (http://127.0.0.1:57324).

## Testy

Wszystkie komendy w katalogu `web/`:

| Komenda | Co sprawdza | Wymaga |
|---|---|---|
| `npm run lint` | ESLint | |
| `npm test` | logika domenowa (jednostkowe) | |
| `npm run test:db` | RLS, funkcje `save_day` i `save_goal` na prawdziwej bazie | lokalny Supabase |
| `npm run test:e2e` | pełne scenariusze w Chrome | lokalny Supabase i `npm run build` |

Testy e2e zakładają konta `*@rls-test.local`. Testy bazy sprzątają po sobie, e2e nie, więc w lokalnej bazie mogą zostać konta testowe. Usuwa je:

```bash
docker exec supabase_db_habit-tracker psql -U postgres -c "delete from auth.users where email like '%@rls-test.local'"
```

## Decyzje projektowe

- **Autoryzacja w bazie.** Zamiast Pundit każdy użytkownik widzi wyłącznie własne wiersze dzięki politykom RLS. Polityki sprawdzają też własność powiązanych rekordów (nawyk i kategoria muszą należeć do użytkownika), bo klucz obcy sam omija RLS.
- **Zapis dnia i celu jest atomowy.** Funkcje Postgresa `save_day` i `save_goal` (SECURITY INVOKER, więc RLS obowiązuje) zapisują cały dzień lub cel w jednej transakcji.
- **Postęp liczony z wpisów na bieżąco.** Serie, postęp celów i heatmapa nie korzystają z pól pomocniczych ani zadań w tle. Heatmapa to funkcja SQL `heatmap()`.
- **„Dziś” zależy od strefy czasowej użytkownika** (`profiles.time_zone`, domyślnie `Europe/Warsaw`).
- **Cache Components.** Dostęp do sesji wymaga `connection()` i `<Suspense>`, bo biblioteka Supabase korzysta z `Date.now()`.

Migracje SQL (`web/supabase/migrations`) są jedynym źródłem prawdy o schemacie.

## Deploy (plan)

1. Utworzyć projekt Supabase i zastosować migracje (`npx supabase link`, `npx supabase db push`).
2. W Supabase Auth włączyć potwierdzanie e-mail i ustawić adresy przekierowań na domenę Vercel.
3. W Vercel zaimportować repozytorium z **Root Directory = `web`** i ustawić zmienne `NEXT_PUBLIC_SUPABASE_URL` oraz `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
4. Po weryfikacji usunąć `legacy-rails/`.

## Legacy

[`legacy-rails/`](legacy-rails) zawiera pierwotną aplikację (Rails 6.1, Devise, Pundit, Sidekiq, PostgreSQL) razem z dokumentacją etapów. Nie jest rozwijana i służy tylko jako referencja podczas przepisywania.

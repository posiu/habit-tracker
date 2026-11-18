# Specyfikacja produktu

Podejście spec-driven: najpierw ustalamy wymagania, potem projekt (UI/UX), potem kod i testy.

| Plik | Co zawiera |
|---|---|
| [requirements.md](requirements.md) | Wymagania z identyfikatorami, kryteriami akceptacji i stanem względem kodu |
| [open-questions.md](open-questions.md) | Pytania, na które jeszcze nie ma decyzji (kolejne rundy wywiadu) |

Wiedza o produkcie (brief, decyzje, wywiad, analizy, log) żyje w bazie super-brain: `~/Documents/super-brain/3-Projects/habit-tracker/`. Tutaj jest tylko to, co musi być wersjonowane razem z kodem.

## Zasady pracy

1. Zmiana zachowania aplikacji zaczyna się od zmiany wymagania w `requirements.md` (PR do przeglądu), nie od kodu.
2. Każde wymaganie ma identyfikator (np. `HAB-4`) i kryteria akceptacji. Test automatyczny w kodzie odwołuje się do identyfikatora w nazwie albo komentarzu.
3. Kolumna „Stan” opisuje kod, nie plany: ✅ zgodne, 🟡 częściowo, ❌ brak lub niezgodne, ⏳ poza zakresem v1.
4. Niejasność trafia do `open-questions.md`, a nie jest zgadywana w kodzie.

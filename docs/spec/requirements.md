# Wymagania

Źródło: wywiad z właścicielem (2026-11-17), brief i kod z `main`. Stan kodu na commit `2a4767a`.

## Użytkownicy i założenia

- **Właściciel** (Michał): zakłada konta bliskim, korzysta z aplikacji na co dzień.
- **Użytkownik**: zaproszona bliska osoba. Dane każdego użytkownika są w pełni prywatne.
- Urządzenia: telefon i komputer równorzędnie. Telefon to szybkie odhaczanie w ciągu dnia, komputer to przegląd i raporty.
- Język interfejsu: polski. Hosting wyłącznie Vercel + Supabase.

## 1. Konta i dostęp

| ID | Wymaganie | Kryteria akceptacji | Stan |
|---|---|---|---|
| AUTH-1 | Rejestracja tylko na zaproszenie | Osoba bez zaproszenia nie może założyć konta (brak publicznej rejestracji albo odrzucenie). Zaproszona osoba ustawia hasło i wchodzi do aplikacji. | ❌ rejestracja jest otwarta |
| AUTH-2 | Logowanie i wylogowanie e-mailem i hasłem | Poprawne dane logują, błędne dają ogólny komunikat, wylogowanie kończy sesję. | ✅ |
| AUTH-3 | Reset hasła przez e-mail | Użytkownik prosi o link, ustawia nowe hasło, stare przestaje działać. | ❌ (do potwierdzenia, pyt. Q2) |
| AUTH-4 | Prywatność danych | Użytkownik nie widzi, nie zmienia i nie usuwa cudzych danych (także przez powiązania typu nawyk → kategoria). | ✅ polityki RLS + testy |

## 2. Nawyki

| ID | Wymaganie | Kryteria akceptacji | Stan |
|---|---|---|---|
| HAB-1 | Tworzenie, edycja, archiwizacja, przywracanie i usuwanie nawyku | Archiwizacja ustawia datę końca na dziś i zachowuje historię. Usunięcie wymaga potwierdzenia i kasuje wpisy. | ✅ |
| HAB-2 | Typy nawyku: tak/nie, wartość liczbowa, czas (minuty), licznik | Pole wpisu na ekranie dnia odpowiada typowi. Wartość musi być większa od zera. | ✅ |
| HAB-3 | Harmonogram: codziennie albo wybrane dni tygodnia | Nawyk w dniu spoza harmonogramu nie jest „do zrobienia”, nie przerywa serii i nie wchodzi do mianownika procentów. | ❌ brak harmonogramu |
| HAB-4 | Nawyk liczbowy jest ukończony po osiągnięciu celu; bez celu wystarcza wartość większa od zera | Cel 2 l: wpis 1,5 l to jeszcze nieukończone, 2 l ukończone. Zmiana celu nie przepisuje historii (zob. Q5). | ❌ teraz ukończony przy każdej wartości > 0 |
| HAB-5 | Seria: kolejne zaplanowane dni ukończone; żyje do końca dzisiejszego dnia; pokazujemy też rekord | Zob. reguły w `domain/stats`. Dni spoza harmonogramu są pomijane. | 🟡 działa dla „codziennie” |
| HAB-6 | Przypomnienia | Poza zakresem v1: pola przypomnień znikają z formularza nawyku. | ❌ formularz ma pola przypomnień |

## 3. Wpisy dzienne

| ID | Wymaganie | Kryteria akceptacji | Stan |
|---|---|---|---|
| DAY-1 | Pełny ekran dnia: nawyki, cele, nastrój 1–5, notatka | Zapis jest atomowy (wszystko albo nic), po zapisie widać potwierdzenie, po przeładowaniu dane są takie same. | ✅ |
| DAY-2 | Szybkie odhaczanie na pulpicie | Z pulpitu jednym dotknięciem: odhacz nawyk tak/nie, +1 do licznika, wpisz wartość. Bez wchodzenia na ekran dnia. | ❌ |
| DAY-3 | Edycja dni z przeszłości; dni z przyszłości zablokowane | Przyszła data przekierowuje na dziś. Limit cofania do ustalenia (Q6). | ✅ bez limitu |
| DAY-4 | „Dziś” zależy od strefy czasowej użytkownika | Po północy w strefie użytkownika zmienia się dzień, niezależnie od UTC. | ✅ domyślnie Europe/Warsaw, 🟡 brak zmiany w ustawieniach |

## 4. Cele

| ID | Wymaganie | Kryteria akceptacji | Stan |
|---|---|---|---|
| GOAL-1 | Typy celów: dni z działaniem, dni bez, wartość docelowa, termin, własny | Postęp i status liczone z wpisów, wartości ujemne odejmują. | ✅ |
| GOAL-2 | Cel może się liczyć automatycznie z nawyku | Cel powiązany z nawykiem X zlicza ukończone dni albo sumę wartości X bez osobnych wpisów. Zmiana wpisu nawyku zmienia postęp celu. Szczegóły: Q3. | ❌ |
| GOAL-3 | Zamykanie, wznawianie i usuwanie celu | Zamknięty cel znika z aktywnych i da się go wznowić. | ✅ |

## 5. Pulpit i raporty

| ID | Wymaganie | Kryteria akceptacji | Stan |
|---|---|---|---|
| DASH-1 | Pulpit: postęp dnia, serie i rekordy, cele, heatmapa roku | Dane zgodne z wpisami, heatmapa liczy aktywność wg progów 0/1–2/3–5/6–10/11+. | ✅ |
| REP-1 | Podsumowanie tygodnia i miesiąca | Odsetek ukończonych nawyków, najlepsze serie, średni nastrój, cele w toku, dla wybranego okresu. | ❌ |
| REP-2 | Wykresy w czasie | Trend nawyków, nastroju i wartości celów. | ❌ |
| REP-3 | Eksport danych do CSV | Pobranie wszystkich własnych wpisów w formacie CSV. | ❌ |

## 6. Profil i ustawienia

| ID | Wymaganie | Kryteria akceptacji | Stan |
|---|---|---|---|
| SET-1 | Ustawienia profilu: imię, strefa czasowa | Zmiana strefy od razu zmienia, co jest „dziś”. | ❌ |
| SET-2 | Zarządzanie danymi: eksport, usunięcie konta | Do ustalenia (Q4). | ❌ |

## 7. Wymagania niefunkcjonalne

| ID | Wymaganie |
|---|---|
| NFR-1 | Interfejs responsywny, równie dobry na telefonie i komputerze (projekt UI/UX jest osobnym etapem). |
| NFR-2 | Dostępność: etykiety pól, kontrast i obsługa klawiatury. Poziom docelowy do potwierdzenia (Q9). |
| NFR-3 | Bezpieczeństwo: autoryzacja w bazie (RLS), brak sekretów w kodzie i repozytorium. |
| NFR-4 | Każde wymaganie funkcjonalne ma test automatyczny (jednostkowy, bazy albo e2e). |
| NFR-5 | Koszt: wyłącznie istniejące plany Vercel i Supabase, bez dodatkowych usług. |
| NFR-6 | Stabilność pierwszego ładowania: formularze działają od razu po wejściu na stronę, bez przeładowania (zob. ISSUE-1 w analizie luk). |

## 8. Poza zakresem v1

Przypomnienia e-mail i push, udostępnianie postępów, wspólne cele i nawyki, API JSON dla aplikacji iOS. Powrót któregokolwiek wymaga zmiany tego dokumentu.

# Wymagania

Źródło: wywiad z właścicielem (2026-11-17), brief i kod z `main`. Stan kodu na commit `2a4767a`.

## Użytkownicy i założenia

- **Właściciel** (Michał): administrator. Zaprasza bliskich, na ich prośbę usuwa konta, korzysta z aplikacji na co dzień.
- **Użytkownik**: zaproszona bliska osoba. Dane każdego użytkownika są w pełni prywatne.
- Urządzenia: telefon i komputer równorzędnie. Telefon to szybkie odhaczanie w ciągu dnia, komputer to przegląd i raporty.
- Język interfejsu: polski. Hosting wyłącznie Vercel + Supabase.
- Wdrożenie: dopiero po projekcie UI/UX i kluczowych funkcjach (harmonogramy, zaproszenia, szybkie odhaczanie). Na start adres `*.vercel.app`.

## 1. Konta i dostęp

| ID | Wymaganie | Kryteria akceptacji | Stan |
|---|---|---|---|
| AUTH-1 | Rejestracja tylko na zaproszenie: link w e-mailu | ✅ zaproszenie e-mailem (polski szablon, link ustawia hasło); /signup wyłączony poza ALLOW_PUBLIC_SIGNUP; w produkcji wyłączyć też rejestrację w Supabase |
| AUTH-2 | Logowanie i wylogowanie e-mailem i hasłem | Poprawne dane logują, błędne dają ogólny komunikat, wylogowanie kończy sesję. | ✅ |
| AUTH-3 | Reset hasła przez e-mail | ✅ reset hasła linkiem z e-maila (/reset → /haslo) |
| AUTH-4 | Prywatność danych | Użytkownik nie widzi, nie zmienia i nie usuwa cudzych danych (także przez powiązania typu nawyk → kategoria). | ✅ polityki RLS + testy |

| ADM-1 | Administrator (właściciel): zaproszenia i usuwanie kont | ✅ panel Ustawienia → Zaproszenia: lista, zaproszenie, usunięcie konta; admin = ADMIN_EMAILS, klucz serwisowy tylko po stronie serwera |

## 2. Nawyki

| ID | Wymaganie | Kryteria akceptacji | Stan |
|---|---|---|---|
| HAB-1 | Tworzenie, edycja, archiwizacja, przywracanie i usuwanie nawyku | Archiwizacja ustawia datę końca na dziś i zachowuje historię. Usunięcie wymaga potwierdzenia i kasuje wpisy. | ✅ |
| HAB-2 | Typy nawyku: tak/nie, wartość liczbowa, czas (minuty), licznik | Pole wpisu na ekranie dnia odpowiada typowi. Wartość musi być większa od zera. | ✅ |
| HAB-3 | Harmonogram: codziennie albo wybrane dni tygodnia | 🟡 harmonogram z historią (habit_schedules), pulpit i serie respektują dni; wpis w dniu spoza harmonogramu jest bonusem; brak procentów w raportach (REP) |
| HAB-4 | Nawyk liczbowy jest ukończony po osiągnięciu celu; bez celu wystarcza wartość większa od zera | ✅ ukończenie = wartość ≥ cel (bez celu: > 0); `completed` zapisywane przy wpisie, więc zmiana celu nie zmienia historii (edycja starego dnia używa bieżącego celu) |
| HAB-5 | Seria: kolejne zaplanowane dni ukończone; żyje do końca dzisiejszego dnia; pokazujemy też rekord | ✅ serie uwzględniają harmonogram (dni spoza są pomijane) |
| HAB-6 | Przypomnienia | ✅ pola przypomnień usunięte z formularza i bazy |
| HAB-7 | Plan wykonania (Atomic Habits): pola „kiedy” i „gdzie” oraz opcjonalne powiązanie z innym nawykiem („po tym, jak zrobię…”) | Pola widoczne na karcie i w szczegółach nawyku, niewymagane. Powiązany nawyk to ten sam użytkownik, bez cykli. | 🟡 pola i powiązanie są (migracja 20261118000001/2), kafelek pokazuje „kiedy i gdzie”, brak walidacji cykli |
| HAB-8 | Wersja dwuminutowa: minimum, które też liczy się jako wykonanie | Nawyk ma opcjonalny opis minimum. Szybki zapis „minimum” oznacza nawyk jako ukończony i jest odróżnialny w historii. | 🟡 tekst wersji 2-minutowej zapisywany; brak szybkiego zapisu „minimum” |
| HAB-9 | Tożsamość: nawyk przypisany do opisu „kim się staję” | Podsumowanie pokazuje liczbę „głosów” (ukończeń) na każdą tożsamość. Wiele nawyków może wspierać jedną tożsamość. | 🟡 tożsamość jako tekst nawyku; brak podsumowania głosów |
| HAB-10 | „Nie przegap dwa razy”: podpowiedź na pulpicie | Nawyk pominięty wczoraj jest wyróżniony na pulpicie. Reguła serii z HAB-5 bez zmian, to tylko podpowiedź. | ❌ |

## 3. Wpisy dzienne

| ID | Wymaganie | Kryteria akceptacji | Stan |
|---|---|---|---|
| DAY-1 | Pełny ekran dnia: nawyki, cele, nastrój 1–5, notatka | Zapis jest atomowy (wszystko albo nic), po zapisie widać potwierdzenie, po przeładowaniu dane są takie same. | ✅ |
| DAY-2 | Szybkie odhaczanie na pulpicie | Z pulpitu jednym dotknięciem: odhacz nawyk tak/nie, +1 do licznika, wpisz wartość. Bez wchodzenia na ekran dnia. | ❌ |
| DAY-3 | Edycja dni z przeszłości; dni z przyszłości zablokowane | Przyszła data przekierowuje na dziś. Bez limitu cofania. | ✅ |
| DAY-4 | „Dziś” zależy od strefy czasowej użytkownika | Po północy w strefie użytkownika zmienia się dzień, niezależnie od UTC. | ✅ domyślnie Europe/Warsaw, 🟡 brak zmiany w ustawieniach |

## 4. Cele

| ID | Wymaganie | Kryteria akceptacji | Stan |
|---|---|---|---|
| GOAL-1 | Typy celów: dni z działaniem, dni bez, wartość docelowa, termin, własny | Postęp i status liczone z wpisów, wartości ujemne odejmują. | ✅ |
| GOAL-2 | Cel może się liczyć automatycznie z nawyku | ✅ typy „Dni z nawyku” i „Seria z nawyku”; liczy się od startu celu (Q13), seria = najlepsza od startu (Q14); cele ręczne bez zmian |
| GOAL-3 | Zamykanie, wznawianie i usuwanie celu | Zamknięty cel znika z aktywnych i da się go wznowić. | ✅ |

| CAT-1 | Kategorie służą do filtrowania i raportów | Listę nawyków i celów można zawęzić do kategorii, a raporty pokazują podsumowanie także per kategoria. | 🟡 kategorie są tylko etykietą |

## 5. Pulpit i raporty

| ID | Wymaganie | Kryteria akceptacji | Stan |
|---|---|---|---|
| DASH-1 | Pulpit: postęp dnia, serie i rekordy, cele, heatmapa roku | Dane zgodne z wpisami, heatmapa liczy aktywność wg progów 0/1–2/3–5/6–10/11+. | ✅ |
| REP-1 | Podsumowanie tygodnia i miesiąca (bez raportu kwartalnego) | 🟡 widok miesiąca (siatka, %, seria) i roku (średni nastrój, dni aktywne); brak tygodnia i najlepszych serii |
| REP-2 | Wykresy w czasie | Trend nawyków, nastroju i wartości celów. | ❌ |
| REP-3 | Eksport danych do CSV | Pobranie wszystkich własnych wpisów w formacie CSV. | ❌ |

## 6. Profil i ustawienia

| ID | Wymaganie | Kryteria akceptacji | Stan |
|---|---|---|---|
| SET-1 | Ustawienia profilu: imię, strefa czasowa | 🟡 strefa czasowa edytowalna w Ustawieniach; brak edycji profilu |
| SET-2 | Zarządzanie danymi | Użytkownik sam eksportuje dane do CSV (REP-3). Konto usuwa właściciel na prośbę (ADM-1). | ❌ |

## 7. Wymagania niefunkcjonalne

| ID | Wymaganie |
|---|---|
| NFR-1 | Interfejs responsywny, równie dobry na telefonie i komputerze. Aplikacja instalowalna jako PWA (manifest, ikona na ekranie głównym), bez trybu offline. Projekt UI/UX jest osobnym etapem. |
| NFR-2 | Dostępność: etykiety pól, kontrast i obsługa klawiatury. Poziom docelowy: WCAG 2.2 AA. |
| NFR-3 | Bezpieczeństwo: autoryzacja w bazie (RLS), brak sekretów w kodzie i repozytorium. |
| NFR-4 | Każde wymaganie funkcjonalne ma test automatyczny (jednostkowy, bazy albo e2e). |
| NFR-5 | Koszt: wyłącznie istniejące plany Vercel i Supabase, bez dodatkowych usług. |
| NFR-6 | Stabilność pierwszego ładowania: formularze działają od razu po wejściu na stronę, bez przeładowania (zob. ISSUE-1 w analizie luk). |

## Rozstrzygnięcia (2026-11-18)

- **GOAL-2 (Q13):** cel liczony z nawyku zlicza dni tylko od daty startu celu.
- **GOAL-2 (Q14):** cel „X dni z rzędu” patrzy na najlepszą serię od startu celu.
- **HAB-3 (Q15):** wpis w dniu spoza harmonogramu jest dozwolony jako bonus, nie przerywa serii i jej nie wydłuża.
- **HAB-3/HAB-4 (Q16):** historię zmian mają tylko cel i harmonogram; nazwa i kategoria działają wstecz.
- **AUTH-1 (Q17):** zaproszenie i reset hasła w prostym polskim szablonie e-mail.
- **AUTH-1 (Q18):** po pierwszym wejściu pusty pulpit z podpowiedziami, bez kreatora.
- **Legacy:** `legacy-rails/` usuwamy od razu, osobnym PR (historia git zachowuje całość).

## 8. Poza zakresem v1

Przypomnienia e-mail i push, udostępnianie postępów, wspólne cele i nawyki, API JSON dla aplikacji iOS. Powrót któregokolwiek wymaga zmiany tego dokumentu.

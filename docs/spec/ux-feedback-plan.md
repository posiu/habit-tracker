# Plan poprawek po testach lokalnych (2026-11-20)

Źródło: uwagi Michała po pierwszym ręcznym teście. Podział na małe PR-y wg zależności. Każdy PR: testy, screenshot na szerokości telefonu i desktopu, wpis w logu super-brain.

## Partie

| # | PR | Zakres | Zależy od |
|---|---|---|---|
| 1 | Wykresy i drobne poprawki | Wykres tygodnia i wykres celu: mniejsze czcionki osi, cieńsze linie, mniejsze punkty i słupki, maks. szerokość na desktopie. Przycisk „Edytuj” na szczegółach nawyku wygląda na nieaktywny (kolor). Zapis dnia: czytelne potwierdzenie (komunikat widoczny, przewinięcie do niego lub przejście na Dziś). Widok miesiąca bez nawyków: zachęta „Dodaj pierwszy nawyk” z linkiem. Placeholdery w polach Cel i Jednostka (nawyk), Nazwa/Jednostka/Wartość docelowa (cel), kategoria. Błąd dni tygodnia: do odtworzenia (hipoteza: dni przed datą startu harmonogramu lub przyszłe są rysowane jak „poza harmonogramem”), potem naprawa i test. | nic |
| 2 | Układ pod web i powrót | Wspólny nagłówek strony z przyciskiem „Wróć” (Ustawienia → Kategorie, Cele, szczegóły, formularze). Formularze nawyku, celu i kategorii szersze na desktopie (dwie kolumny od `md`), nadal wygodne na telefonie. | 1 (wspólne placeholdery i style) |
| 3 | Przepływy: nawyki i cele | Na Dziś zawsze „+ Nowy nawyk”. Po utworzeniu celu przejście na listę celów z widocznym „Nowy cel”; wejście do celów także z Dziś (sekcja Cele z linkiem „Wszystkie cele”). Powiązanie nawyku z celem (patrz pytanie 2). | 2 |
| 4 | Kolory nawyków | Kolumna `color` w `habits`, wybór koloru w formularzu (paleta), domyślnie jeden kolor dopasowany do motywu, kafelki Dziś, szczegóły i siatka miesiąca używają koloru nawyku. Migracja addytywna. | 2 |
| 5 | Ekran wykonania nawyku | Nowa strona wykonania jednego nawyku (wartość, czas, notatka) bez mieszania z innymi nawykami dnia; „Odhacz”/„Uzupełnij” z Dziś prowadzą tam (patrz pytanie 1). | 2 |
| 6 | Widok dnia po nowemu | Przeprojektowanie `/daily/[data]`: karty nawyków z jasno opisanym sposobem wykonania (Odhacz / wpisz czas / liczba), bez wrażenia pola dodatkowego pierwszego nawyku; służy głównie do uzupełniania przeszłych dni. | 5 |

Kolejność: 1 → 2 → (3, 4, 5 niezależnie, po jednym) → 6. 1 i 2 są najtańsze i usuwają większość irytacji.

## Decyzje Michała (2026-11-20)

1. Odhacz: tam gdzie wystarczy jedno działanie (nawyk tak/nie), potwierdzenie od razu na Dziś; tam gdzie trzeba coś uzupełnić (czas, liczba), przejście na osobny ekran wykonania.
2. Powiązanie nawyku z celem: wybór z listy istniejących celów.
3. „Cele” jako zakładka w dolnej nawigacji; jeśli nie zmieści się na telefonie, wejście z zakładki Nawyki.

## Status

- PR 1: zrobiony (fix/ux-batch-1). Przyczyna „błędu dni tygodnia”: nie dane, tylko widok: dni tygodnia przed datą startu nowego nawyku były rysowane jako „niewykonane”, a przyszłe jako puste obrysy. Teraz dni przed startem mają osobny stan „przed startem nawyku”.
- PR 2: zrobiony (fix/ux-batch-2): wspólny nagłówek `PageHeader`/`BackLink` z „‹ Etykieta” na Ustawieniach → Kategorie/Cele/Konta, formularzach i szczegółach; formularze nawyku, celu i kategorii szersze na desktopie (nawyk w dwóch kolumnach), przycisk Zapisz nie rozciąga się na całą szerokość.
- PR 3: zrobiony (fix/ux-batch-3): „+ Nowy nawyk” oraz „Wszystkie cele” i „+ Nowy cel” na Dziś; Cele jako zakładka Nawyki | Cele pod pozycją „Nawyki” w dolnej nawigacji (5 pozycji nie mieści się na telefonie), usunięte z Ustawień; w formularzu nawyku sekcja „Cele z tego nawyku” (lista istniejących celów typu dni/seria z nawyku, zaznaczenie przepina cel, odznaczenie odpina).

**PR4 (kolory nawyków): zrobione.** Kolumna `habits.color` (klucz palety h1–h6, null = domyślny), migracja addytywna `20261120000003_habit_color.sql`. Paleta w formularzu, kolor na kafelkach Dziś, w szczegółach nawyku i w siatce miesiąca. Domyślnie jeden neutralny kolor zgodny z motywem (zamiast dotychczasowego rotowania kolorów).

**PR5 (ekran wykonania nawyku): zrobione.** Nawyk tak/nie potwierdza się jednym dotknięciem na Dziś (bez zmian). Nawyki z wartością (liczba, czas, licznik) otwierają osobny ekran `/habits/[id]/log?date=` z jednym polem tego nawyku, bez innych nawyków. Zapis rusza tylko wpis tego nawyku (nie nastrój i notatki dnia), pusta wartość usuwa wpis, data wsteczna wraca do widoku dnia. Ekran obsługuje też tak/nie dla uzupełniania wstecz (pod PR6).

**PR6 (widok dnia): zrobione.** `/daily/[data]`: nawyki jako karty (kolor nawyku, nazwa, opis sposobu wykonania: „Zaznacz, jeśli zrobiony”, „Wpisz czas w minutach”, cel), dwie kolumny na desktopie, podpowiedź przy dniach wstecz. Zapis bez zmian (jeden przycisk „Zapisz dzień”), etykiety pól zachowane. Nagłówek z datą nie łamie się na telefonie.

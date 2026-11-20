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

## Pytania do Michała (decyzje przed partiami 3 i 5)

1. Czy „Odhacz” dla nawyku tak/nie ma dalej zapisywać jednym tapnięciem na Dziś (szybko, bez przejścia), a do ekranu wykonania prowadzi tylko „Uzupełnij” (czas, liczba) i klik w nazwę nawyku? Czy zawsze przechodzić na osobny ekran?
2. Powiązanie nawyku z celem: (a) w formularzu nawyku sekcja „Cele z tego nawyku” z przyciskiem „Dodaj cel z tego nawyku” (otwiera formularz celu z wybranym nawykiem), czy (b) lista istniejących celów do wskazania? Dziś cel z nawyku wskazuje nawyk, nie odwrotnie.
3. Czy „Cele” mają dostać własną pozycję w dolnej nawigacji (kosztem np. Analizy albo jako piąta zakładka)?

# Otwarte pytania

Pytania, na które nie ma jeszcze decyzji. Odpowiedź zamykamy zmianą w `requirements.md` i usunięciem pytania tutaj.

| # | Pytanie | Dotyczy | Moja propozycja do potwierdzenia |
|---|---|---|---|
| Q1 | Jak działają zaproszenia: Ty dodajesz konta w panelu Supabase, czy aplikacja wysyła link zaproszenia e-mailem? | AUTH-1 | Zaproszenie e-mailem z Supabase Auth, rejestracja publiczna wyłączona. |
| Q2 | Czy potrzebny jest reset hasła w aplikacji? | AUTH-3 | Tak, bo zaproszeni użytkownicy zapomną hasła. |
| Q3 | Jak dokładnie cel liczy się z nawyku? Które typy celów mogą być powiązane (suma wartości, liczba ukończonych dni, seria)? Czy cele ręczne zostają? | GOAL-2 | Cel wartościowy może zliczać sumę nawyku liczbowego, cel „dni z działaniem” liczbę ukończonych dni nawyku. Typy ręczne zostają. |
| Q4 | Czy potrzebne są eksport danych i usunięcie konta (RODO dla bliskich)? | SET-2 | Eksport CSV jest i tak w raportach. Usunięcie konta na życzenie przez właściciela. |
| Q5 | Co ze zmianą celu albo harmonogramu nawyku: obowiązuje wstecz, czy tylko od teraz? | HAB-3, HAB-4 | Tylko od teraz, historia zachowuje stan z dnia wpisu (wymaga historii zmian). |
| Q6 | Czy dni z przeszłości można edytować bez limitu? | DAY-3 | Bez limitu. |
| Q7 | Czy potrzebne są „dni wolne” (choroba, urlop), które nie przerywają serii? | HAB-5 | Nie w v1. |
| Q8 | Czy aplikacja ma być instalowalna na telefonie (PWA, ikona na ekranie głównym)? | NFR-1 | Tak, to tani sposób na szybkie odhaczanie. |
| Q9 | Jaki poziom dostępności jako cel (np. WCAG 2.2 AA)? | NFR-2 | AA. |
| Q10 | Czy kategorie są potrzebne i do czego służą (filtry, raporty), czy można je usunąć? | HAB-1 | Zostają, ale używane w raportach i filtrach. |
| Q11 | Czy raport kwartalny (z pierwotnego roadmapu) jest potrzebny? | REP-1 | Nie, tydzień i miesiąc wystarczą. |
| Q12 | Kiedy i na jakiej domenie deploy? Czy włączać potwierdzanie e-mail? | Deploy | Przy zaproszeniach potwierdzanie jest wbudowane w link zaproszenia. |

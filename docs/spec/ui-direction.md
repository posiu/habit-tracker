# Kierunek UI/UX (szkic, 2026-11-18)

Status: kierunek wybrany przez Michała na podstawie inspiracji, projekt ekranów w następnym kroku.

## Decyzje

- **Styl bazowy:** ciemny, kafelkowy jak Jrnl (czarne tło, kafelki nawyków każdy w swoim kolorze, mini-heatmapa na kafelku, duży przycisk check-in).
- **Urządzenie:** telefon najpierw (PWA, dolna nawigacja z przyciskiem „+”). Desktop: ta sama treść z panelem bocznym.
- **Atomic Habits w v1:** plan „kiedy i gdzie” z powiązaniem nawyków (HAB-7), wersja dwuminutowa (HAB-8), tożsamość (HAB-9), „nie przegap dwa razy” (HAB-10).

## Elementy z inspiracji (wymagane)

| Element | Źródło | Zastosowanie |
|---|---|---|
| Kafelki nawyków z check-inem jednym dotknięciem, licznik „✓ × 2” | Jrnl | Ekran nawyków i dnia; zastępuje formularz dnia |
| Nastrój wybierany suwakiem-łukiem | Jrnl | Zapis nastroju dnia |
| Ściana roku (kwadrat na dzień) | Jrnl | Heatmapa roku |
| Siatka miesiąca nawyki × dni, klik zaznacza dzień, % i seria na końcu wiersza | Aligned (Etsy) | Widok desktopowy i miesięczny |
| Ekran szczegółów nawyku: tydzień, cel serii, edycja z datą startu i końca | Spark (Dribbble) | Arkusz szczegółów nawyku |

## Zasady

- Jedna akcja na jedno dotknięcie; zapis bez przeładowania i bez „zapisz dzień”.
- Pusty stan z zachętą do pierwszego nawyku (Q18).
- Kontrast WCAG 2.2 AA także na ciemnym tle; kolor nigdy jedynym nośnikiem informacji.

## Do zrobienia

Paleta i tokeny, makiety ekranów (pulpit, dzień, szczegóły nawyku, formularz nawyku, raporty), potem implementacja po stabilizacji ISSUE-1.

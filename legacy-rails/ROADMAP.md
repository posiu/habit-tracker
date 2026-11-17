# Project Roadmap - Habit Tracker Application

## Overview

Plan realizacji projektu w 6 etapach, każdy możliwy do ukończenia w 1-2 tygodnie. Etapy są przyrostowe i umożliwiają działającą aplikację po każdym etapie.

---

## Stage 1: Fundamenty i Infrastructure Setup
**Duration:** 1-2 weeks  
**Priority:** MVP Critical

### Cel etapu
Przygotowanie infrastruktury technicznej: inicjalizacja projektu Rails, konfiguracja bazy danych, podstawowe modele i struktura architektury zgodna z dokumentacją.

### Zadania techniczne

#### 1.1 Projekt Rails i podstawowa konfiguracja
- [ ] Generowanie nowego projektu Rails z PostgreSQL
- [ ] Konfiguracja `database.yml` (dev, test, production)
- [ ] Inicjalizacja Git repository
- [ ] Konfiguracja `.gitignore`
- [ ] Utworzenie `README.md` z opisem projektu
- [ ] Konfiguracja podstawowych plików środowiskowych (.env)

#### 1.2 Dependency Management
- [ ] Tworzenie `Gemfile` z wszystkimi wymaganymi gemami
- [ ] Instalacja gems (`bundle install`)
- [ ] Konfiguracja initializers dla kluczowych gemów

#### 1.3 Baza danych - migracje
- [ ] Migracja `create_users` (Devise + custom fields)
- [ ] Migracja `create_categories`
- [ ] Migracja `create_habits`
- [ ] Migracja `create_goals`
- [ ] Migracja `create_goal_metrics`
- [ ] Migracja `create_daily_entries`
- [ ] Migracja `create_habit_entries`
- [ ] Migracja `create_goal_entries`
- [ ] Dodanie wszystkich wymaganych indeksów (zgodnie z DOMAIN_MODEL.md)
- [ ] Dodanie constraints (unique, check)
- [ ] Uruchomienie migracji na bazie dev

#### 1.4 Modele ActiveRecord
- [ ] Model `User` (z Devise) + custom fields
- [ ] Model `Category`
- [ ] Model `Habit` (associations, validations, scopes, enums)
- [ ] Model `Goal` (associations, validations, scopes, enums)
- [ ] Model `GoalMetric`
- [ ] Model `DailyEntry`
- [ ] Model `HabitEntry`
- [ ] Model `GoalEntry`
- [ ] Koncerny (optional): `Trackable`, `Streakable`

#### 1.5 Podstawowa struktura architektury
- [ ] Utworzenie katalogów: `app/services/`, `app/forms/`, `app/queries/`, `app/presenters/`, `app/jobs/`
- [ ] Base classes: `Services::BaseService`, `ApplicationController`, `Api::BaseController`
- [ ] Konfiguracja Pundit (policies structure)
- [ ] Konfiguracja struktury dla API (`app/controllers/api/v1/`)

#### 1.6 Konfiguracja Frontend
- [ ] Konfiguracja Tailwind CSS
- [ ] Konfiguracja Hotwire (Turbo, Stimulus)
- [ ] Podstawowy layout (`app/views/layouts/application.html.erb`)
- [ ] Navigation component/partial

#### 1.7 Test Environment Setup
- [ ] Konfiguracja RSpec (`rails generate rspec:install`)
- [ ] Konfiguracja FactoryBot
- [ ] Konfiguracja Database Cleaner
- [ ] Podstawowe factory files dla wszystkich modeli
- [ ] Helper methods w `spec/support/`

#### 1.8 Code Quality Tools
- [ ] Konfiguracja RuboCop (`.rubocop.yml`)
- [ ] Konfiguracja Brakeman
- [ ] Pre-commit hooks (opcjonalnie)

### Definition of Done (DoD)

✅ **Infrastructure:**
- Projekt Rails uruchamia się bez błędów
- Wszystkie migracje działają poprawnie
- Baza danych testowa tworzy się automatycznie

✅ **Models:**
- Wszystkie 8 modeli utworzone i powiązane
- Asocjacje działają poprawnie (testy ręczne)
- Podstawowe validacje działają
- Scopes są zdefiniowane

✅ **Database:**
- Wszystkie tabele utworzone zgodnie z DOMAIN_MODEL.md
- Wszystkie indeksy dodane
- Constraints działają (unique, foreign keys, check)

✅ **Code Quality:**
- RuboCop przechodzi bez błędów (lub skonfigurowane wyjątki)
- Brakemy brak alertów krytycznych
- Kod committowany do Git z sensownymi commit messages

✅ **Documentation:**
- README.md zawiera instrukcje uruchomienia
- Setup instructions działają dla nowego developera
- Domain model jest aktualizowany jeśli były zmiany

✅ **Tests:**
- Testy jednostkowe dla wszystkich modeli (minimalne - associations, validations)
- FactoryBot factories działają dla wszystkich modeli
- CI/CD pipeline setup (opcjonalnie, GitHub Actions)

---

## Stage 2: Autentykacja i Zarządzanie Użytkownikami
**Duration:** 1 week  
**Priority:** MVP Critical

### Cel etapu
Implementacja systemu autentykacji i autoryzacji: rejestracja, logowanie, zarządzanie profilem użytkownika oraz podstawowa autoryzacja oparta na Pundit.

### Zadania techniczne

#### 2.1 Devise Configuration
- [ ] Generowanie Devise (User model)
- [ ] Konfiguracja `devise.rb` initializer
- [ ] Routing dla authentication (sign up, sign in, sign out)
- [ ] Customizacja widoków Devise (opcjonalnie, lub użyć domyślnych)
- [ ] Email confirmation (opcjonalnie, dla MVP może być wyłączone)
- [ ] Password reset functionality

#### 2.2 User Management
- [ ] Controller `UsersController` (show, edit, update)
- [ ] Widoki: profile page, edit profile
- [ ] Formularz edycji profilu (timezone, preferences)
- [ ] Walidacja danych użytkownika
- [ ] Avatar upload (opcjonalnie - ActiveStorage)

#### 2.3 Autoryzacja (Pundit)
- [ ] Instalacja i konfiguracja Pundit
- [ ] `ApplicationPolicy` base class
- [ ] `UserPolicy` (users can only edit their own profile)
- [ ] Integration w controllers (`authorize` calls)
- [ ] Error handling dla unauthorized access

#### 2.4 Frontend - Authentication
- [ ] Navigation bar z login/logout
- [ ] Responsive authentication forms
- [ ] Flash messages dla success/error
- [ ] Redirect po logowaniu do dashboard (placeholder)
- [ ] "Remember me" functionality

#### 2.5 Session Management
- [ ] Customizacja redirect paths po login/logout
- [ ] Handling unauthorized access (redirect z message)
- [ ] Session timeout configuration

#### 2.6 Tests
- [ ] Feature tests: sign up, sign in, sign out
- [ ] Feature tests: edit profile
- [ ] Unit tests: UserPolicy
- [ ] Integration tests: unauthorized access handling

### Definition of Done (DoD)

✅ **Authentication:**
- Użytkownik może się zarejestrować
- Użytkownik może się zalogować i wylogować
- Reset hasła działa (email wysyłany, link działa)
- "Remember me" działa

✅ **Authorization:**
- Pundit zintegrowany i działa
- User może edytować tylko swój profil
- Nieautoryzowany dostęp jest blokowany z odpowiednim komunikatem

✅ **User Management:**
- Profil użytkownika można wyświetlić i edytować
- Timezone i preferencje są zapisywane
- Walidacje działają poprawnie

✅ **Frontend:**
- Authentication UI jest responsywny i użytkowy
- Flash messages działają
- Navigation zawiera odpowiednie linki (login/logout/profile)

✅ **Tests:**
- Feature tests pokrywają wszystkie authentication flows
- Policy tests pokrywają authorization rules
- Coverage: 80%+ dla authentication/user management code

✅ **Security:**
- Hasła są hashowane (Devise bcrypt)
- CSRF protection działa
- Session fixation protection enabled
- No SQL injection vulnerabilities (Brakeman clean)

---

## Stage 3: CRUD Nawyków i Celów + Kategorie
**Duration:** 1-2 weeks  
**Priority:** MVP Critical

### Cel etapu
Implementacja pełnego CRUD dla nawyków, celów i kategorii. Użytkownik może tworzyć, edytować, usuwać i przeglądać swoje nawyki, cele i kategorie.

### Zadania techniczne

#### 3.1 Categories Management
- [ ] Controller `CategoriesController` (CRUD)
- [ ] Form Object: `CategoryForm`
- [ ] Service: `Categories::CreateService`, `UpdateService`, `DeleteService`
- [ ] Policy: `CategoryPolicy`
- [ ] Widoki: index, new, edit, show
- [ ] Drag & drop sorting (opcjonalnie, może być proste `position` field)

#### 3.2 Habits Management
- [ ] Controller `HabitsController` (CRUD + archive/unarchive)
- [ ] Form Object: `HabitForm` (walidacje dla różnych typów)
- [ ] Services: `Habits::CreateService`, `UpdateService`, `DeleteService`, `ArchiveService`
- [ ] Query Object: `HabitQuery` (active, by_category, etc.)
- [ ] Policy: `HabitPolicy`
- [ ] Widoki: index (lista aktywnych), show, new, edit
- [ ] Filtrowanie po kategoriach
- [ ] Soft delete lub hard delete (zależnie od decyzji)

#### 3.3 Goals Management
- [ ] Controller `GoalsController` (CRUD + completion)
- [ ] Form Object: `GoalForm` + `GoalMetricForm`
- [ ] Services: `Goals::CreateService`, `UpdateService`, `DeleteService`
- [ ] Query Object: `GoalQuery`
- [ ] Policy: `GoalPolicy`
- [ ] Widoki: index, show, new, edit
- [ ] Formularz z różnymi typami wskaźników sukcesu
- [ ] Walidacje dla różnych typów celów

#### 3.4 Goal Metrics
- [ ] Nested form dla `GoalMetric` przy tworzeniu `Goal`
- [ ] Walidacje metryk (tylko jedna metryka na typ celu)
- [ ] Aktualizacja metryk przy edycji celu

#### 3.5 Frontend - Forms & Lists
- [ ] Responsive forms dla habits/goals
- [ ] Dynamic form fields (zależnie od typu habit/goal)
- [ ] Form validation (client-side + server-side)
- [ ] Flash messages dla success/error
- [ ] Confirmation dialogs dla delete actions
- [ ] Category selector (dropdown)

#### 3.6 Turbo Integration
- [ ] Turbo Frames dla formularzy (edit inline)
- [ ] Turbo Streams dla create/update/delete actions
- [ ] Loading states podczas AJAX requests

#### 3.7 Tests
- [ ] Feature tests: CRUD dla Categories
- [ ] Feature tests: CRUD dla Habits (wszystkie typy)
- [ ] Feature tests: CRUD dla Goals (wszystkie typy)
- [ ] Service tests: wszystkie Services
- [ ] Form tests: walidacje
- [ ] Policy tests: authorization

### Definition of Done (DoD)

✅ **Functionality:**
- Użytkownik może tworzyć, edytować, usuwać kategorie
- Użytkownik może tworzyć nawyki wszystkich typów (boolean, numeric, time, count)
- Użytkownik może tworzyć cele ze wszystkimi typami wskaźników sukcesu
- Użytkownik może przypisywać nawyki/cele do kategorii
- Użytkownik może archiwizować nawyki (opcjonalnie)

✅ **Forms & Validation:**
- Formularze są responsywne i użytkowe
- Walidacje działają poprawnie (client + server)
- Dynamiczne pola działają (zależnie od typu)
- Błędy walidacji są wyświetlane czytelnie

✅ **Authorization:**
- Użytkownik widzi tylko swoje nawyki/cele/kategorie
- Użytkownik może edytować tylko swoje zasoby
- Policies działają poprawnie

✅ **UI/UX:**
- Turbo działa (bez full page reloads)
- Flash messages działają
- Loading states podczas async actions
- Confirmation dialogs dla delete

✅ **Tests:**
- Feature tests pokrywają wszystkie CRUD operations
- Service tests mają 90%+ coverage
- Form tests walidują wszystkie przypadki
- Policy tests pokrywają wszystkie authorization scenarios

✅ **Code Quality:**
- Services są zorganizowane zgodnie z architekturą
- Query Objects używane w controllers
- Form Objects używane zamiast bezpośrednich parametrów
- Kod zgodny z RuboCop

---

## Stage 4: Dashboard, Dzienne Wpisy i Heatmapa
**Duration:** 2 weeks  
**Priority:** MVP Critical

### Cel etapu
Implementacja dashboardu użytkownika z heatmapą w stylu GitHub, funkcjonalności dziennych wpisów oraz podstawowe obliczenia (streaki, procent realizacji).

### Zadania techniczne

#### 4.1 Daily Entries System
- [ ] Controller `DailyEntriesController` (show, create, update)
- [ ] Form Object: `DailyEntryForm`
- [ ] Service: `Entries::CreateDailyEntryService`
- [ ] Query Object: `DailyEntryQuery` (for_date, for_date_range)
- [ ] Policy: `DailyEntryPolicy`
- [ ] Widok: show (pojedynczy dzień z formularzami wpisów)

#### 4.2 Habit Entries
- [ ] Controller `HabitEntriesController` (nested w daily_entry) lub Turbo Streams
- [ ] Form Object: `HabitEntryForm`
- [ ] Service: `Entries::CreateHabitEntryService`, `UpdateService`
- [ ] Widoki: formularze inline w daily_entry view
- [ ] Walidacje wartości (zależnie od typu habit)
- [ ] Quick entry buttons (dla boolean habits)

#### 4.3 Goal Entries
- [ ] Controller `GoalEntriesController` (nested)
- [ ] Form Object: `GoalEntryForm`
- [ ] Service: `Entries::CreateGoalEntryService`, `UpdateService`
- [ ] Widoki: formularze inline w daily_entry view
- [ ] Walidacje wartości

#### 4.4 Dashboard
- [ ] Controller `DashboardController` (index)
- [ ] Query Object: `DashboardQuery` (heatmap_data, stats, recent_activity)
- [ ] Presenter: `DashboardPresenter`
- [ ] Widok: index (dashboard główny)
- [ ] Karty z podstawowymi statystykami (total habits, active streak, etc.)

#### 4.5 Heatmap (GitHub Style)
- [ ] Service: `Analytics::CalculateHeatmapDataService`
- [ ] Query do pobrania danych dla zakresu dat (1 rok)
- [ ] JavaScript/Stimulus controller do renderowania heatmapy
- [ ] CSS styling dla heatmapy (gradient colors)
- [ ] Tooltips z datami i wartościami
- [ ] Integration w dashboard view

#### 4.6 Streak Calculations
- [ ] Service: `Habits::CalculateStreakService`
- [ ] Background Job: `StreakCalculationJob`
- [ ] Caching strategia dla streak values
- [ ] Update streak przy tworzeniu habit_entry
- [ ] Wyświetlanie streak w habit show/index

#### 4.7 Goal Progress Calculations
- [ ] Service: `Goals::CalculateProgressService`
- [ ] Service: `Goals::CheckCompletionService`
- [ ] Background Job: `GoalMetricUpdateJob`
- [ ] Update current_days_doing/without przy tworzeniu goal_entry
- [ ] Wyświetlanie progress bar dla celów
- [ ] Auto-completion gdy cel osiągnięty

#### 4.8 Frontend - Dashboard
- [ ] Responsive dashboard layout
- [ ] Heatmap component (Stimulus + CSS)
- [ ] Stat cards (total habits, active goals, current streaks)
- [ ] Recent activity feed
- [ ] Quick entry form (na dashboard)

#### 4.9 Turbo Streams dla Entry Creation
- [ ] Turbo Streams dla create habit_entry (update heatmap, stats)
- [ ] Turbo Streams dla create goal_entry (update progress)
- [ ] Real-time updates bez page reload

#### 4.10 Tests
- [ ] Feature tests: create daily entry
- [ ] Feature tests: create habit_entry i goal_entry
- [ ] Feature tests: dashboard wyświetla dane
- [ ] Service tests: streak calculations (edge cases)
- [ ] Service tests: progress calculations
- [ ] Integration tests: heatmap data generation

### Definition of Done (DoD)

✅ **Daily Entries:**
- Użytkownik może utworzyć wpis dla danego dnia
- Użytkownik może dodać wartości dla swoich nawyków (dla danego dnia)
- Użytkownik może dodać wartości dla swoich celów (dla danego dnia)
- Walidacje działają (jedna wartość na habit/goal per dzień)
- Quick entry dla boolean habits działa

✅ **Dashboard:**
- Dashboard wyświetla się poprawnie
- Stat cards pokazują aktualne dane
- Recent activity feed działa
- Dashboard jest responsywny

✅ **Heatmap:**
- Heatmap wyświetla dane dla ostatniego roku
- Kolory odzwierciedlają aktywność (jak GitHub)
- Tooltips pokazują daty i wartości
- Heatmap aktualizuje się przy dodawaniu wpisów (Turbo Streams)

✅ **Streak Calculations:**
- Streaki są obliczane poprawnie
- Streak wyświetla się przy nawykach
- Background job aktualizuje streaki (nightly)
- Edge cases obsłużone (brak wpisów, przerwy)

✅ **Goal Progress:**
- Postęp celów jest obliczany poprawnie
- Progress bars wyświetlają aktualny postęp
- Auto-completion działa gdy cel osiągnięty
- Background job aktualizuje metryki (nightly)

✅ **Performance:**
- Dashboard ładuje się < 2 sekundy
- Heatmap data jest cache'owana
- N+1 queries zidentyfikowane i naprawione (Bullet gem)

✅ **Tests:**
- Feature tests pokrywają wszystkie entry flows
- Service tests dla obliczeń mają 100% coverage
- Integration tests dla dashboardu
- Edge cases testowane (empty data, single entry, etc.)

✅ **UI/UX:**
- Turbo Streams działają (bez page reloads)
- Loading states podczas async actions
- Error handling z czytelnymi komunikatami
- Dashboard jest intuicyjny i użytkowy

---

## Stage 5: Raporty, Analityka i Powiadomienia
**Duration:** 1-2 weeks  
**Priority:** MVP Important / Nice to Have

### Cel etapu
Implementacja systemu raportów (tygodniowe, miesięczne, kwartalne), rozszerzona analityka oraz system powiadomień (email reminders, deadline alerts).

### Zadania techniczne

#### 5.1 Reports Generation
- [ ] Controller `ReportsController` (index, show, generate)
- [ ] Service: `Reports::GenerateWeeklyReportService`
- [ ] Service: `Reports::GenerateMonthlyReportService`
- [ ] Service: `Reports::GenerateQuarterlyReportService`
- [ ] Query Object: `ReportQuery` (weekly_data, monthly_data, quarterly_data)
- [ ] Presenter: `ReportPresenter` (formatowanie danych)
- [ ] Widoki: report index, report show (with charts)

#### 5.2 Report Content
- [ ] Statystyki dla okresu (completed habits, goal progress)
- [ ] Wykresy trendów (line charts dla habit completions)
- [ ] Porównania z poprzednimi okresami
- [ ] Insights i recommendations (opcjonalnie)

#### 5.3 Report Export
- [ ] Export do PDF (gem `wicked_pdf` lub `prawn`)
- [ ] Export do CSV
- [ ] Service: `Reports::ExportReportService`
- [ ] Download buttons w report view

#### 5.4 Email Reports
- [ ] Mailer: `ReportMailer` (weekly_report, monthly_report)
- [ ] Background Job: `ReportGenerationJob` (scheduled)
- [ ] Email templates (HTML)
- [ ] User preferences: email frequency setting

#### 5.5 Extended Analytics
- [ ] Service: `Analytics::CalculateStatsService` (rozszerzone statystyki)
- [ ] Service: `Analytics::GenerateInsightsService` (patterns, trends)
- [ ] Dashboard: extended stats section
- [ ] Wykresy (Chart.js lub podobny): habit completion trends, goal progress

#### 5.6 Notifications System
- [ ] Model `Notification` (opcjonalnie, lub użyć ActionMailer bezpośrednio)
- [ ] Service: `Notifications::SendReminderService`
- [ ] Service: `Notifications::CheckDeadlinesService`
- [ ] Background Job: `ReminderJob` (scheduled via sidekiq-cron)
- [ ] Background Job: `DeadlineCheckJob` (daily)

#### 5.7 Reminder Configuration
- [ ] User settings: reminder preferences (enabled/disabled, time)
- [ ] Habit settings: reminder_enabled, reminder_days
- [ ] Email templates dla reminders

#### 5.8 Sidekiq Cron Configuration
- [ ] Konfiguracja `config/schedule.rb`
- [ ] Job: Daily reminders (9 AM)
- [ ] Job: Deadline checks (daily)
- [ ] Job: Streak calculations (nightly)
- [ ] Job: Weekly reports (Monday morning)
- [ ] Job: Monthly reports (1st of month)

#### 5.9 Frontend - Reports
- [ ] Reports index page (lista raportów)
- [ ] Report show page (z wykresami)
- [ ] Date range picker dla custom reports
- [ ] Export buttons (PDF, CSV)

#### 5.10 Tests
- [ ] Feature tests: generate reports
- [ ] Feature tests: export reports
- [ ] Service tests: report generation (all types)
- [ ] Job tests: reminder jobs
- [ ] Mailer tests: report emails

### Definition of Done (DoD)

✅ **Reports:**
- Użytkownik może wygenerować raport tygodniowy, miesięczny, kwartalny
- Raporty zawierają wszystkie wymagane statystyki
- Raporty są czytelne i użyteczne
- Export do PDF i CSV działa

✅ **Email Reports:**
- Weekly/monthly reports wysyłane automatycznie
- Email templates są responsywne i czytelne
- User preferences działają (frequency setting)

✅ **Analytics:**
- Rozszerzone statystyki wyświetlają się na dashboard
- Wykresy pokazują trendy
- Insights są wartościowe (jeśli zaimplementowane)

✅ **Notifications:**
- Daily reminders wysyłane o ustalonej godzinie
- Deadline alerts wysyłane dla zbliżających się terminów
- Reminder preferences działają (user może włączyć/wyłączyć)
- Habit-specific reminders działają

✅ **Background Jobs:**
- Wszystkie scheduled jobs działają poprawnie
- Jobs są idempotentne (można uruchomić wielokrotnie)
- Error handling w jobs (retry logic)
- Sidekiq dashboard dostępny (z autoryzacją)

✅ **Performance:**
- Raporty generują się < 5 sekund (lub async)
- Email sending jest async (nie blokuje request)
- N+1 queries naprawione

✅ **Tests:**
- Feature tests pokrywają report generation
- Service tests dla wszystkich report services
- Job tests dla scheduled jobs
- Mailer tests dla wszystkich email templates
- Coverage: 85%+ dla reports/notifications code

✅ **Documentation:**
- Report formats są udokumentowane
- Notification schedules są jasne
- User guide dla raportów (opcjonalnie)

---

## Stage 6: API dla Mobile (iOS) i Finalizacja
**Duration:** 1-2 weeks  
**Priority:** Nice to Have (Future)

### Cel etapu
Implementacja RESTful API wersji 1.0 dla przyszłej aplikacji iOS, finalizacja projektu (testy, dokumentacja, deployment preparation).

### Zadania techniczne

#### 6.1 API Authentication
- [ ] JWT token implementation (`jwt` gem)
- [ ] Controller `Api::V1::AuthenticationController` (login, logout)
- [ ] Concern `Api::Authenticatable` (token validation)
- [ ] Base controller `Api::V1::BaseController`
- [ ] Token refresh mechanism (opcjonalnie)

#### 6.2 API Controllers
- [ ] `Api::V1::HabitsController` (CRUD + JSON responses)
- [ ] `Api::V1::GoalsController` (CRUD)
- [ ] `Api::V1::DailyEntriesController` (CRUD)
- [ ] `Api::V1::CategoriesController` (CRUD)
- [ ] `Api::V1::DashboardController` (stats, heatmap data)
- [ ] `Api::V1::ReportsController` (list, generate)

#### 6.3 API Serialization
- [ ] Jbuilder templates dla wszystkich zasobów (`app/views/api/v1/`)
- [ ] Consistent JSON response format
- [ ] Error response format standard
- [ ] Pagination (Kaminari integration)

#### 6.4 API Concerns & Helpers
- [ ] Concern `ApiResponsable` (render_success, render_error)
- [ ] Concern `ApiErrorHandler` (consistent error handling)
- [ ] Helper methods dla serialization

#### 6.5 API Routes
- [ ] Namespace `/api/v1` w routes
- [ ] RESTful routes dla wszystkich zasobów
- [ ] Custom routes (stats, heatmap data)
- [ ] API documentation endpoint (opcjonalnie)

#### 6.6 API Documentation
- [ ] RSwag setup (Swagger/OpenAPI)
- [ ] API endpoint documentation
- [ ] Authentication flow documentation
- [ ] Request/response examples
- [ ] Error codes documentation

#### 6.7 CORS Configuration
- [ ] `rack-cors` gem configuration
- [ ] Development: allow all origins
- [ ] Production: restrict to iOS app domains
- [ ] Preflight requests handling

#### 6.8 API Versioning
- [ ] Versioning strategy implemented
- [ ] Future-proof structure (ready for v2)
- [ ] Version headers handling

#### 6.9 API Tests
- [ ] Request specs dla wszystkich API endpoints
- [ ] Authentication tests (valid/invalid tokens)
- [ ] Authorization tests (users can only access own data)
- [ ] Error handling tests
- [ ] Pagination tests

#### 6.10 Shared Services
- [ ] Weryfikacja że Services działają zarówno dla web jak i API
- [ ] Query Objects używane w API controllers
- [ ] Form Objects używane w API (validation)

#### 6.11 Rate Limiting
- [ ] `rack-attack` gem configuration
- [ ] Rate limits dla API endpoints
- [ ] IP-based throttling
- [ ] Token-based throttling (opcjonalnie)

#### 6.12 Finalization Tasks
- [ ] Comprehensive test suite (coverage > 85%)
- [ ] Documentation update (README, API docs)
- [ ] Code review (RuboCop, Brakeman)
- [ ] Performance optimization (N+1, slow queries)
- [ ] Security audit (Brakeman, bundler-audit)
- [ ] Production configuration preparation
- [ ] Deployment instructions

### Definition of Done (DoD)

✅ **API Authentication:**
- JWT tokens działają poprawnie
- Login endpoint zwraca token
- Token validation działa w wszystkich endpoints
- Token expiry działa

✅ **API Endpoints:**
- Wszystkie CRUD operations działają (Habits, Goals, Entries, Categories)
- Dashboard endpoint zwraca dane
- Reports endpoint działa
- JSON responses są spójne i czytelne

✅ **API Documentation:**
- Swagger/OpenAPI docs dostępne
- Wszystkie endpoints udokumentowane
- Request/response examples dostępne
- Authentication flow udokumentowany

✅ **CORS & Security:**
- CORS skonfigurowany poprawnie
- Rate limiting działa
- API endpoints są zabezpieczone (authentication required)
- Authorization działa (users tylko swoje dane)

✅ **Tests:**
- Request specs pokrywają wszystkie API endpoints
- Authentication tests passing
- Authorization tests passing
- Error handling tests passing
- Coverage: 85%+ dla API code

✅ **Code Quality:**
- Wszystki kod przechodzi RuboCop
- Brakeman bez krytycznych alertów
- Bundler-audit bez vulnerabilities
- Test coverage > 85% dla całej aplikacji

✅ **Documentation:**
- README.md kompletny (setup, deployment)
- API documentation kompletna
- Architecture documentation aktualizowana
- Domain model dokumentacja aktualizowana

✅ **Deployment Ready:**
- Production configuration przygotowana
- Environment variables udokumentowane
- Database migrations reviewed
- Background jobs configuration reviewed
- Deployment instructions w README

✅ **Performance:**
- API response times < 500ms (95th percentile)
- N+1 queries naprawione
- Slow queries zidentyfikowane i zoptymalizowane
- Caching strategy zaimplementowana

---

## Summary: Stage Priorities

### MVP Critical (Must Have for v1.0):
1. **Stage 1:** Fundamenty i Infrastructure Setup
2. **Stage 2:** Autentykacja i Zarządzanie Użytkownikami
3. **Stage 3:** CRUD Nawyków i Celów + Kategorie
4. **Stage 4:** Dashboard, Dzienne Wpisy i Heatmapa

### MVP Important (Should Have):
5. **Stage 5:** Raporty, Analityka i Powiadomienia (częściowo - podstawowe raporty)

### Nice to Have / Future:
6. **Stage 6:** API dla Mobile (można zrobić później, po release v1.0)
- Zaawansowane raporty (Stage 5 - full)
- Social features
- Integrations z zewnętrznymi API

---

## Timeline Estimate

**Total Duration:** 7-10 weeks

- Stage 1: 1-2 weeks
- Stage 2: 1 week
- Stage 3: 1-2 weeks
- Stage 4: 2 weeks
- Stage 5: 1-2 weeks
- Stage 6: 1-2 weeks

**MVP Release (Stages 1-4):** ~5-7 weeks

---

## Risk Mitigation

### Potential Risks:
1. **Complexity of streak calculations** → Prototype early, test edge cases
2. **Performance of heatmap queries** → Add proper indexes, use caching
3. **Background jobs reliability** → Use Sidekiq, proper error handling
4. **API versioning complexity** → Start simple, document well

### Mitigation Strategies:
- Prototype risky features early (Stage 1-2)
- Regular testing at each stage
- Performance testing before moving to next stage
- Code reviews before DoD completion
- Keep architecture flexible for future changes


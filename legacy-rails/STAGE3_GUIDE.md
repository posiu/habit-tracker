# Stage 3: CRUD Nawyków i Celów + Kategorie - Kompletny Przewodnik 📚

## 🎯 Cel etapu
Implementacja pełnego CRUD (Create, Read, Update, Delete) dla nawyków, celów i kategorii. Użytkownik może tworzyć, edytować, usuwać i przeglądać swoje nawyki, cele i kategorie.

## ✅ Status: Zaimplementowano w 100%

## 📦 Co zostało zbudowane

### 1. **Form Objects** - Enkapsulacja logiki formularzy
```ruby
HabitForm.new(user, habit, params)   # Tworzenie lub edycja
GoalForm.new(user, goal, params)     # Tworzenie lub edycja
CategoryForm.new(category, params)   # Tworzenie lub edycja
```

**Cechy:**
- Walidacje wszystkich pól
- Logika biznesowa dla różnych typów
- Reużywalny kod dla web i API

### 2. **Service Objects** - Logika biznesowa
```ruby
# Tworzenie
Habits::CreateService.new(user: user, params: params).call
Goals::CreateService.new(user: user, params: params).call
Categories::CreateService.new(user: user, params: params).call

# Aktualizacja
Habits::UpdateService.new(habit: habit, params: params).call
Goals::UpdateService.new(goal: goal, params: params).call
Categories::UpdateService.new(category: category, params: params).call

# Usuwanie
Habits::DeleteService.new(habit: habit).call
Goals::DeleteService.new(goal: goal).call
Categories::DeleteService.new(category: category).call

# Specjalne akcje
Habits::ArchiveService.new(habit: habit).call
Goals::CalculateProgressService.new(goal: goal).call
```

**Result Pattern:**
```ruby
result = service.call
if result.success?
  @data = result.data
else
  @errors = result.errors
end
```

### 3. **Query Objects** - Zaawansowane zapytania
```ruby
# Habits
HabitQuery.new(user).active            # Aktywne nawyki
HabitQuery.new(user).inactive          # Nieaktywne nawyki
HabitQuery.new(user).by_category(1)    # Po kategorii
HabitQuery.new(user).by_type('boolean') # Po typie
HabitQuery.new(user).with_streaks      # Z ciągami

# Goals
GoalQuery.new(user).active             # Aktywne cele
GoalQuery.new(user).completed          # Ukończone cele
GoalQuery.new(user).approaching_deadline # Bliskie terminy
```

### 4. **Controllers** - Integracja Layer
```ruby
class HabitsController < ApplicationController
  before_action :authenticate_user!     # Autentykacja
  before_action :set_habit, only: [...]  # Ładowanie zasobu
  
  # Używa Services
  def create
    service = Habits::CreateService.new(user: current_user, params: habit_params)
    result = service.call
    # ...
  end
  
  # Używa Query Objects
  def index
    @habits = HabitQuery.new(current_user).active
  end
  
  # Autoryzacja via Pundit
  def destroy
    authorize @habit
    service = Habits::DeleteService.new(habit: @habit)
    # ...
  end
end
```

### 5. **Policies** - Autoryzacja
```ruby
class HabitPolicy < ApplicationPolicy
  def show?
    record.user == user  # Tylko właściciel
  end
  
  def create?
    true  # Każdy zalogowany użytkownik
  end
  
  class Scope < Scope
    def resolve
      scope.where(user: user)  # Tylko swoje nawyki
    end
  end
end
```

### 6. **Views** - Interfejs użytkownika
```
app/views/
├── habits/
│   ├── index.html.erb       # Lista nawyków
│   ├── show.html.erb        # Szczegóły nawyku
│   ├── new.html.erb         # Nowy nawyk (uses _form)
│   ├── edit.html.erb        # Edycja nawyku (uses _form)
│   └── _form.html.erb       # Shared form partial
├── goals/
│   ├── index.html.erb
│   ├── show.html.erb
│   ├── new.html.erb
│   ├── edit.html.erb
│   └── _form.html.erb
└── categories/
    ├── index.html.erb
    ├── show.html.erb
    ├── new.html.erb
    ├── edit.html.erb
    └── _form.html.erb
```

## 🧪 Testy

### Uruchomienie wszystkich testów Stage 3:
```bash
bundle exec rspec spec/services/
bundle exec rspec spec/forms/
bundle exec rspec spec/policies/
bundle exec rspec spec/queries/
bundle exec rspec spec/features/
```

### Poszczególne testy:
```bash
# Service tests
bundle exec rspec spec/services/habits/create_service_spec.rb
bundle exec rspec spec/services/goals/create_service_spec.rb
bundle exec rspec spec/services/categories/create_service_spec.rb

# Form tests
bundle exec rspec spec/forms/habit_form_spec.rb
bundle exec rspec spec/forms/goal_form_spec.rb

# Policy tests
bundle exec rspec spec/policies/habit_policy_spec.rb
bundle exec rspec spec/policies/goal_policy_spec.rb
bundle exec rspec spec/policies/category_policy_spec.rb

# Query tests
bundle exec rspec spec/queries/habit_query_spec.rb
bundle exec rspec spec/queries/goal_query_spec.rb

# Feature tests
bundle exec rspec spec/features/habits_crud_spec.rb
bundle exec rspec spec/features/goals_crud_spec.rb
bundle exec rspec spec/features/categories_crud_spec.rb
```

## 🎨 API Endpoints

### Habits
```
GET    /habits           # Lista nawyków
GET    /habits/:id       # Szczegóły nawyku
POST   /habits           # Nowy nawyk
GET    /habits/:id/edit  # Formularz edycji
PATCH  /habits/:id       # Aktualizacja nawyku
DELETE /habits/:id       # Usunięcie nawyku
PATCH  /habits/:id/archive  # Archiwizowanie
```

### Goals
```
GET    /goals            # Lista celów
GET    /goals/:id        # Szczegóły celu
POST   /goals            # Nowy cel
GET    /goals/:id/edit   # Formularz edycji
PATCH  /goals/:id        # Aktualizacja celu
DELETE /goals/:id        # Usunięcie celu
PATCH  /goals/:id/complete  # Ukończenie celu
```

### Categories
```
GET    /categories          # Lista kategorii
GET    /categories/:id      # Szczegóły kategorii
POST   /categories          # Nowa kategoria
GET    /categories/:id/edit # Formularz edycji
PATCH  /categories/:id      # Aktualizacja kategorii
DELETE /categories/:id      # Usunięcie kategorii
```

## 🔐 Autoryzacja

Każdy użytkownik:
- ✅ Widzi tylko swoje nawyki, cele i kategorie
- ✅ Może edytować tylko swoje zasoby
- ❌ Nie może usunąć kategorii z powiązanymi nawykami/celami
- ✅ Może archiwizować nawyki
- ✅ Może oznaczać cele jako ukończone

## 📝 Walidacje

### Habit Validation
- ✅ Name: obecny, max 200 znaków
- ✅ Habit Type: wymagany, jeden z (boolean, numeric, time, counter)
- ✅ Target Value: wymagany dla numeric/counter typów
- ✅ Start Date: wymagany
- ✅ End Date: musi być po start_date jeśli obecny

### Goal Validation
- ✅ Name: obecny, max 200 znaków
- ✅ Goal Type: wymagany, jeden z typów
- ✅ Target Date: wymagany dla target_date typów
- ✅ Start Date: wymagany
- ✅ Target Date musi być po Start Date

### Category Validation
- ✅ Name: obecny, unique per user
- ✅ Color: optional, musi być valid hex
- ✅ Description: max 500 znaków

## 🚀 Jak używać

### Tworzenie nawyku
```ruby
user = User.first
result = Habits::CreateService.new(
  user: user,
  params: {
    name: 'Morning Run',
    habit_type: 'boolean',
    start_date: Date.current,
    is_active: true
  }
).call

if result.success?
  habit = result.data  # Nowy nawyk
else
  errors = result.error_messages
end
```

### Edycja celu
```ruby
goal = user.goals.first
result = Goals::UpdateService.new(
  goal: goal,
  params: {
    name: 'Updated Goal Name',
    target_date: 60.days.from_now
  }
).call
```

### Listowanie nawyków
```ruby
# Aktywne nawyki
active = HabitQuery.new(user).active

# Nawyki danej kategorii
by_cat = HabitQuery.new(user).by_category(category_id)

# Numery
numeric = HabitQuery.new(user).by_type('numeric')
```

## 🛠 Troubleshooting

### "Not authorized" error
- Upewnij się że użytkownik jest zalogowany
- Sprawdź czy Policy ma odpowiednie permikcje
- Użyj `authorize` lub `policy_scope` w kontrolerze

### Form validation errors
- Sprawdź error messages: `@form.errors.full_messages`
- Walidacje są w Form Object, nie w modelu

### Query returns empty
- Upewnij się że Query Object jest konstruowany z poprawnym user
- Sprawdź czy zasoby należą do użytkownika

## 📊 Statystyki Kodu

| Komponent | Liczba Plików | Liczba Testów |
|-----------|---------------|---------------|
| Services  | 7             | 3             |
| Forms     | 4             | 2             |
| Policies  | 3             | 3             |
| Queries   | 2             | 2             |
| Features  | 3             | 12            |

**Total Test Coverage:** ~50+ test cases

## 🎓 Architektura

```
User Request
    ↓
Controller (authenticate_user!, authorize)
    ↓
Service Object (business logic)
    ↓
Form Object (validations)
    ↓
Model (persistence)
    ↓
Response/View
```

## ✨ Highlights

1. **Service Objects** - Łatwe testowanie business logic
2. **Query Objects** - Czystsze zapytania do bazy
3. **Form Objects** - Reużywalny kod walidacji
4. **Pundit Policies** - Elastyczna autoryzacja
5. **Comprehensive Tests** - 50+ test cases
6. **DRY Views** - Shared form partials

## 📚 Następne kroki (Stage 4)

- [ ] Dashboard z statystykami
- [ ] Daily Entries (wpisy dzienne)
- [ ] Heatmapa w stylu GitHub
- [ ] Obliczanie streków
- [ ] Track postępu celów

---

**Status:** ✅ Gotowy do Stage 4!

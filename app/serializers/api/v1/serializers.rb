module Api
  module V1
    # Plain-Ruby JSON representations of the API resources.
    module Serializers
      module_function

      def user(user)
        {
          id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name,
          time_zone: user.time_zone, locale: user.locale,
          email_notifications_enabled: user.email_notifications_enabled,
          reminder_time: user.reminder_time&.strftime('%H:%M'),
          report_frequency: user.report_frequency
        }
      end

      def category(category)
        {
          id: category.id, name: category.name, description: category.description,
          color: category.color, icon: category.icon, position: category.position,
          is_active: category.is_active
        }
      end

      def habit(habit, with_streak: false)
        json = {
          id: habit.id, name: habit.name, description: habit.description, category_id: habit.category_id,
          habit_type: habit.habit_type, unit: habit.unit, target_value: habit.target_value&.to_f,
          start_date: habit.start_date, end_date: habit.end_date, is_active: habit.is_active,
          reminder_enabled: habit.reminder_enabled, reminder_days: habit.reminder_days
        }
        json[:current_streak] = habit.current_streak if with_streak
        json
      end

      def goal(goal)
        metric = goal.goal_metric
        {
          id: goal.id, name: goal.name, description: goal.description, category_id: goal.category_id,
          goal_type: goal.goal_type, unit: goal.unit, start_date: goal.start_date,
          target_date: goal.target_date, is_active: goal.is_active, completed_at: goal.completed_at,
          progress: goal.progress_data,
          metric: metric && {
            target_value: metric.target_value&.to_f, current_value: metric.current_value&.to_f,
            days_doing_target: metric.days_doing_target, current_days_doing: metric.current_days_doing,
            days_without_target: metric.days_without_target, current_days_without: metric.current_days_without
          }
        }
      end

      def habit_entry(entry)
        {
          id: entry.id, daily_entry_id: entry.daily_entry_id, habit_id: entry.habit_id,
          completed: entry.completed, value: entry.value, notes: entry.notes
        }
      end

      def goal_entry(entry)
        {
          id: entry.id, daily_entry_id: entry.daily_entry_id, goal_id: entry.goal_id,
          value: entry.value&.to_f, boolean_value: entry.boolean_value,
          is_increment: entry.is_increment, notes: entry.notes
        }
      end

      def daily_entry(entry, with_entries: false)
        json = { id: entry.id, entry_date: entry.entry_date, mood: entry.mood, notes: entry.notes }
        if with_entries
          json[:habit_entries] = entry.habit_entries.map { |e| habit_entry(e) }
          json[:goal_entries] = entry.goal_entries.map { |e| goal_entry(e) }
        end
        json
      end
    end
  end
end

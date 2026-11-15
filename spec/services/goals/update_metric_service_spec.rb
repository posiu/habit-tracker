require 'rails_helper'

RSpec.describe Goals::UpdateMetricService do
  let(:user) { create(:user) }

  def log(goal, date, attrs)
    entry = create(:daily_entry, user: user, entry_date: date)
    create(:goal_entry, goal: goal, daily_entry: entry, **attrs)
  end

  describe 'target_value goals' do
    let(:goal) { create(:goal, user: user, goal_type: 'target_value') }

    before { goal.goal_metric.update!(target_value: 100) }

    it 'sums increments and subtracts decrements' do
      log(goal, Date.current, value: 40)
      log(goal, Date.current - 1, value: 10, is_increment: false)

      expect(goal.goal_metric.reload.current_value).to eq(30)
      expect(goal.progress_percentage).to eq(30.0)
    end

    it 'updates when an entry is removed' do
      entry = log(goal, Date.current, value: 40)
      entry.destroy

      expect(goal.goal_metric.reload.current_value).to eq(0)
    end

    it 'completes the goal automatically when the target is reached' do
      log(goal, Date.current, value: 60)
      expect(goal.reload).not_to be_completed

      log(goal, Date.current - 1, value: 40)
      expect(goal.reload).to be_completed
      expect(goal).not_to be_is_active
    end
  end

  describe 'days_doing goals' do
    let(:goal) { create(:goal, user: user, goal_type: 'days_doing') }

    before { goal.goal_metric.update!(days_doing_target: 2) }

    it 'counts the days marked as done and completes at the target' do
      log(goal, Date.current, boolean_value: true, value: nil)
      expect(goal.goal_metric.reload.current_days_doing).to eq(1)
      expect(goal.reload).not_to be_completed

      log(goal, Date.current - 1, boolean_value: true, value: nil)
      expect(goal.goal_metric.reload.current_days_doing).to eq(2)
      expect(goal.reload).to be_completed
    end

    it 'ignores days marked as not done' do
      log(goal, Date.current, boolean_value: false, value: nil)
      expect(goal.goal_metric.reload.current_days_doing).to eq(0)
    end
  end

  it 'does not break destroying a goal that has entries' do
    goal = create(:goal, user: user, goal_type: 'target_value')
    log(goal, Date.current, value: 5)

    expect { goal.destroy! }.to change(GoalMetric, :count).by(-1)
    expect(GoalEntry.count).to eq(0)
  end
end

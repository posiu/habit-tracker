require 'rails_helper'

RSpec.describe ReminderMailer, type: :mailer do
  let(:user) { create(:user) }

  describe '#daily_reminder' do
    it 'lists the given habits' do
      habit = create(:habit, user: user, name: 'Medytacja')
      mail = described_class.daily_reminder(user, [habit.id], Date.current)

      expect(mail.to).to eq([user.email])
      expect(mail.subject).to include('1 to do today')
      expect(mail.html_part.body.encoded).to include('Medytacja')
      expect(mail.text_part.body.encoded).to include('Medytacja')
    end

    it 'never leaks habits that belong to another user' do
      other = create(:habit, user: create(:user), name: 'Secret')
      mail = described_class.daily_reminder(user, [other.id], Date.current)

      expect(mail.html_part.body.encoded).not_to include('Secret')
    end
  end

  describe '#deadline_alert' do
    it 'shows how many days are left' do
      goal = create(:goal, user: user, name: 'Maraton', target_date: Date.current + 2)
      mail = described_class.deadline_alert(user, [goal.id], Date.current)

      expect(mail.html_part.body.encoded).to include('Maraton', 'due in 2 days')
    end
  end
end

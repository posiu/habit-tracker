require 'rails_helper'

RSpec.describe HabitMailer, type: :mailer do
  let(:user) { create(:user, email: 'test@example.com') }
  let(:habit) { create(:habit, user: user, name: 'Test Habit') }
  let(:mail) { described_class.with(user: user, habit: habit, streak: 7).streak_milestone }

  it 'renders the subject' do
    expect(mail.subject).to eq('Gratulacje! Osiągnięto streak 7 dni w nawyku: Test Habit')
  end

  it 'sends to the correct user' do
    expect(mail.to).to eq([user.email])
  end

  it 'includes streak info in the body' do
    expect(mail.body.encoded).to include('Osiągnięto streak 7 dni')
    expect(mail.body.encoded).to include('Test Habit')
  end
end

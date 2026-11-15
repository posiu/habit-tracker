require 'rails_helper'

RSpec.describe User, type: :model do
  it { is_expected.to have_many(:habits).dependent(:destroy) }
  it { is_expected.to have_many(:goals).dependent(:destroy) }
  it { is_expected.to have_many(:categories).dependent(:destroy) }
  it { is_expected.to have_many(:daily_entries).dependent(:destroy) }

  it 'is not an admin by default' do
    expect(create(:user)).not_to be_admin
  end

  describe '#display_name' do
    it 'falls back to the email when no name is set' do
      user = build(:user, first_name: nil, last_name: nil, email: 'a@example.com')
      expect(user.display_name).to eq('a@example.com')
    end

    it 'uses the full name when present' do
      user = build(:user, first_name: 'Anna', last_name: 'Nowak')
      expect(user.display_name).to eq('Anna Nowak')
    end
  end

  describe '.with_notifications_enabled' do
    it 'returns only users with e-mail notifications enabled' do
      on = create(:user, email_notifications_enabled: true)
      create(:user, email_notifications_enabled: false)
      expect(described_class.with_notifications_enabled).to contain_exactly(on)
    end
  end
end

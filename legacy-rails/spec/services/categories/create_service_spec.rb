require 'rails_helper'

RSpec.describe Categories::CreateService do
  let(:user) { create(:user) }
  
  let(:valid_params) do
    {
      name: 'Health',
      description: 'Health related habits',
      color: '#FF0000',
      is_active: true
    }
  end

  let(:invalid_params) do
    {
      name: '',
      color: 'invalid_color'
    }
  end

  describe '#call' do
    context 'with valid params' do
      it 'creates a new category' do
        service = described_class.new(user: user, params: valid_params)
        result = service.call

        expect(result.success?).to be true
        expect(result.data).to be_a(Category)
        expect(user.categories.count).to eq 1
        expect(user.categories.first.name).to eq 'Health'
      end
    end

    context 'with invalid params' do
      it 'returns failure' do
        service = described_class.new(user: user, params: invalid_params)
        result = service.call

        expect(result.success?).to be false
      end
    end

    context 'with duplicate name' do
      let(:duplicate_params) do
        valid_params.merge(name: 'Duplicate')
      end

      it 'prevents duplicate category names for same user' do
        create(:category, user: user, name: 'Duplicate')
        service = described_class.new(user: user, params: duplicate_params)
        result = service.call

        expect(result.success?).to be false
      end
    end
  end
end

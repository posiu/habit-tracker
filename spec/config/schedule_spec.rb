require 'rails_helper'

RSpec.describe 'config/schedule.yml' do
  let(:schedule) { YAML.safe_load(Rails.root.join('config/schedule.yml').read) }

  it 'only references existing job classes' do
    schedule.each_value do |entry|
      expect(entry['class'].safe_constantize).to be < ApplicationJob
    end
  end

  it 'uses valid cron expressions' do
    schedule.each do |name, entry|
      expect { Fugit::Cron.parse(entry['cron']) || raise("bad cron in #{name}") }.not_to raise_error
    end
  end

  it 'passes a valid frequency to the report job' do
    schedule.each_value do |entry|
      next unless entry['class'] == 'ReportGenerationJob'

      expect(User::REPORT_FREQUENCIES - ['none']).to include(*entry['args'])
    end
  end
end

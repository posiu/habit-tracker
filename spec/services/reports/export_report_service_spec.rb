require 'rails_helper'

RSpec.describe Reports::ExportReportService do
  let(:user) { create(:user) }
  let(:report) do
    create(:habit, user: user, name: 'Czytanie książek ąęż')
    create(:habit, user: user, name: '=HYPERLINK("http://evil.example")')
    Reports::GenerateWeeklyReportService.new(user).call.data
  end

  def export(format)
    described_class.new(report_type: 'weekly', data: report, format: format).call
  end

  describe 'csv' do
    subject(:result) { export('csv') }

    it 'returns a csv attachment description' do
      expect(result).to be_success
      expect(result.data[:content_type]).to eq('text/csv')
      expect(result.data[:filename]).to eq("weekly-report-#{Date.current.iso8601}.csv")
    end

    it 'contains the summary, habits and daily breakdown sections' do
      content = result.data[:content]
      expect(content).to include('Summary', 'Habits', 'Daily breakdown')
      expect(content).to include('Czytanie książek ąęż')
    end

    it 'is valid UTF-8 CSV with a BOM' do
      content = result.data[:content]
      expect(content).to start_with("﻿")
      expect { CSV.parse(content.delete_prefix("﻿")) }.not_to raise_error
    end

    it 'neutralises spreadsheet formulas coming from user text' do
      expect(result.data[:content]).to include(%('=HYPERLINK))
    end
  end

  describe 'pdf' do
    subject(:result) { export('pdf') }

    it 'renders a pdf, including non-latin1 characters' do
      expect(result).to be_success
      expect(result.data[:content_type]).to eq('application/pdf')
      expect(result.data[:content].b).to start_with('%PDF-')
    end
  end

  it 'rejects unsupported formats' do
    result = export('xml')
    expect(result).to be_failure
    expect(result.error_messages.first).to match(/Unsupported/)
  end

  it 'exports monthly and quarterly data too' do
    [Reports::GenerateMonthlyReportService, Reports::GenerateQuarterlyReportService].each do |klass|
      data = klass.new(user).call.data
      %w[csv pdf].each do |fmt|
        expect(described_class.new(report_type: 'x', data: data, format: fmt).call).to be_success
      end
    end
  end
end

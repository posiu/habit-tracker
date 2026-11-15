require 'csv'
require 'prawn'

module Reports
  # Turns the data hash produced by the Reports::Generate*ReportService classes
  # into a downloadable CSV or PDF document.
  #
  #   result = Reports::ExportReportService.new(report_type: 'weekly', data: data, format: 'csv').call
  #   result.data # => { content: "...", filename: "weekly-report-2026-11-16.csv", content_type: "text/csv" }
  class ExportReportService < BaseService
    FORMATS = %w[csv pdf].freeze
    FONT_PATH = Rails.root.join('vendor/fonts/DejaVuSans.ttf').to_s
    FORMULA_PREFIXES = ['=', '+', '-', '@', "\t", "\r"].freeze

    def initialize(report_type:, data:, format:)
      @report_type = report_type.to_s
      @data = data || {}
      @format = format.to_s
    end

    def call
      return failure("Unsupported export format: #{format}") unless FORMATS.include?(format)

      success(
        content: send("build_#{format}"),
        filename: "#{report_type}-report-#{Date.current.iso8601}.#{format}",
        content_type: format == 'csv' ? 'text/csv' : 'application/pdf'
      )
    end

    private

    attr_reader :report_type, :data, :format

    # A section is [title, header_row, body_rows].
    def sections
      data.each_with_object([]) do |(key, value), list|
        next if key.to_s == 'period'

        section = build_section(key, value)
        list << section if section
      end
    end

    def build_section(key, value)
      title = key.to_s.humanize
      case value
      when Hash
        [title, %w[Metric Value], value.map { |k, v| [k.to_s.humanize, scalar(v)] }]
      when Array
        return nil if value.empty? || !value.first.is_a?(Hash)

        header = value.first.keys
        [title, header.map { |h| h.to_s.humanize }, value.map { |row| header.map { |h| scalar(row[h]) } }]
      end
    end

    def scalar(value)
      case value
      when Date, Time, ActiveSupport::TimeWithZone then value.to_date.iso8601
      when Hash, Array then value.to_json
      else value
      end
    end

    # --- CSV -------------------------------------------------------------

    def build_csv
      body = CSV.generate do |csv|
        csv << ["#{report_type.humanize} report", data[:period]]
        csv << []
        sections.each do |title, header, rows|
          csv << [title]
          csv << header
          rows.each { |row| csv << row.map { |cell| csv_safe(cell) } }
          csv << []
        end
      end
      "﻿#{body}" # BOM so Excel reads the file as UTF-8
    end

    # Prevent spreadsheet formula injection through user supplied text
    # (habit and goal names).
    def csv_safe(cell)
      return cell unless cell.is_a?(String) && cell.start_with?(*FORMULA_PREFIXES)

      "'#{cell}"
    end

    # --- PDF -------------------------------------------------------------

    def build_pdf
      pdf = Prawn::Document.new(page_size: 'A4', margin: 40)
      pdf.font(FONT_PATH)

      pdf.text "#{report_type.humanize} report", size: 20
      pdf.text data[:period].to_s, size: 11, color: '666666'
      pdf.move_down 16

      sections.each { |title, header, rows| render_pdf_section(pdf, title, header, rows) }

      pdf.number_pages 'Page <page> of <total>', at: [pdf.bounds.right - 100, 0], width: 100, align: :right, size: 8
      pdf.render
    end

    def render_pdf_section(pdf, title, header, rows)
      pdf.start_new_page if pdf.cursor < 80
      pdf.text title, size: 14
      pdf.move_down 6

      column_width = pdf.bounds.width / header.size.to_f
      draw_pdf_row(pdf, header, column_width, size: 9, color: '444444')
      pdf.stroke_horizontal_rule
      pdf.move_down 3
      rows.each do |row|
        pdf.start_new_page if pdf.cursor < 30
        draw_pdf_row(pdf, row, column_width, size: 9)
      end
      pdf.move_down 14
    end

    def draw_pdf_row(pdf, cells, column_width, size:, color: '000000')
      top = pdf.cursor
      cells.each_with_index do |cell, i|
        pdf.fill_color color
        pdf.text_box cell.to_s, at: [i * column_width, top], width: column_width - 6,
                                height: size + 4, size: size, overflow: :truncate
      end
      pdf.fill_color '000000'
      pdf.move_down size + 6
    end
  end
end

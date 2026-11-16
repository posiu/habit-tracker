module Api
  # Uniform JSON envelopes:
  #   success: { "data": ..., "meta": { ... } }
  #   error:   { "error": { "code": "...", "message": "...", "details": { ... } } }
  module Responsable
    extend ActiveSupport::Concern

    private

    def render_data(data, status: :ok, meta: nil)
      body = { data: data }
      body[:meta] = meta if meta
      render json: body, status: status
    end

    def render_error(code, message, status:, details: nil)
      error = { code: code, message: message }
      error[:details] = details if details.present?
      render json: { error: error }, status: status
    end

    def render_validation_error(errors)
      details = errors.respond_to?(:to_hash) ? errors.to_hash : { base: Array(errors) }
      render_error('validation_failed', 'Validation failed', status: :unprocessable_entity, details: details)
    end

    # Renders a BaseService::Result failure.
    def render_service_failure(result)
      errors = result.errors
      if errors.respond_to?(:to_hash) && !errors.is_a?(Array)
        render_validation_error(errors)
      else
        render_error('unprocessable', result.error_messages.to_sentence, status: :unprocessable_entity)
      end
    end

    def render_paginated(scope, meta_extra: {}, &serializer)
      per_page = params[:per_page].to_i
      per_page = 25 unless per_page.positive?
      per_page = [per_page, 100].min
      page = scope.page(params[:page]).per(per_page)

      render_data(
        page.map(&serializer),
        meta: { page: page.current_page, per_page: per_page, total_pages: page.total_pages,
                total_count: page.total_count }.merge(meta_extra)
      )
    end
  end
end

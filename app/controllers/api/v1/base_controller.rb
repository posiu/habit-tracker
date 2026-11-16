module Api
  module V1
    class BaseController < Api::BaseController
      API_VERSION = 'v1'.freeze

      before_action { response.set_header('X-API-Version', API_VERSION) }

      private

      # PATCH semantics on top of form objects that expect the full attribute
      # set: start from the record's current attributes and overlay the request.
      def merged_attributes(form, overrides)
        form.attributes.symbolize_keys.merge(overrides.to_h.symbolize_keys)
      end
    end
  end
end

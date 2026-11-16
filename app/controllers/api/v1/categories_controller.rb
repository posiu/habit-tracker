module Api
  module V1
    class CategoriesController < BaseController
      before_action :set_category, only: %i[show update destroy]

      def index
        render_paginated(current_user.categories.ordered) { |c| Serializers.category(c) }
      end

      def show
        render_data(Serializers.category(@category))
      end

      def create
        result = Categories::CreateService.new(user: current_user, params: category_params.to_h).call
        return render_service_failure(result) unless result.success?

        render_data(Serializers.category(result.data), status: :created)
      end

      def update
        attrs = merged_attributes(CategoryForm.new(@category), category_params)
        result = Categories::UpdateService.new(category: @category, params: attrs).call
        return render_service_failure(result) unless result.success?

        render_data(Serializers.category(result.data))
      end

      def destroy
        result = Categories::DeleteService.new(category: @category).call
        return render_error('conflict', result.error_messages.to_sentence, status: :conflict) unless result.success?

        head :no_content
      end

      private

      def set_category
        @category = current_user.categories.find(params[:id])
      end

      def category_params
        params.require(:category).permit(:name, :description, :color, :icon, :position, :is_active)
      end
    end
  end
end

# Makes a form object answer to the name of the model it wraps, so that
# `form_with(model: form)` generates `habit_path` / `habits_path` and nests
# params under `habit` (instead of `habit_form`).
module FormModelName
  extend ActiveSupport::Concern

  class_methods do
    def model_name
      ActiveModel::Name.new(self, nil, name.delete_suffix('Form'))
    end
  end
end

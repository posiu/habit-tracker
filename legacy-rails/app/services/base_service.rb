class BaseService
  # Service result object to standardize return values
  Result = Struct.new(:success?, :data, :errors) do
    def failure?
      !success?
    end

    def success_data
      success? ? data : nil
    end

    def error_messages
      return [] if success?
      
      case errors
      when ActiveModel::Errors
        errors.full_messages
      when Array
        errors
      when String
        [errors]
      else
        [errors.to_s]
      end
    end
  end

  # Class method to call service
  def self.call(**args)
    new(**args).call
  end

  # Instance method that should be implemented by subclasses
  def call
    raise NotImplementedError, "#{self.class} must implement #call method"
  end

  private

  # Helper methods for creating results
  def success(data = nil)
    Result.new(true, data, nil)
  end

  def failure(errors = nil)
    Result.new(false, nil, errors)
  end
end
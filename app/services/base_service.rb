module Services
  class BaseService
    attr_reader :errors

    def initialize(*args)
      @errors = []
    end

    def call
      raise NotImplementedError, "#{self.class} must implement #call"
    end

    def success?
      @errors.empty?
    end

    protected

    def add_error(message)
      @errors << message
    end

    def add_errors(error_messages)
      @errors.concat(Array(error_messages))
    end
  end
end


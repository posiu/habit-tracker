# GET /up - used by load balancers and uptime monitors.
# Returns 200 when the app can reach the database, 503 otherwise.
class HealthController < ActionController::Base
  def show
    ActiveRecord::Base.connection.execute('SELECT 1')
    render json: { status: 'ok' }
  rescue StandardError
    render json: { status: 'error' }, status: :service_unavailable
  end
end

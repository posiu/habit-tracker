module Auth
  # Issues and verifies the JWTs used by the JSON API (HS256, signed with the
  # application secret). A token is bound to the user's current `jwt_jti`, so
  # rotating it (logout, password change) revokes all outstanding tokens.
  class TokenService
    ALGORITHM = 'HS256'.freeze
    LIFETIME = 24.hours

    class InvalidToken < StandardError; end

    def self.encode(user, now: Time.current)
      user.rotate_jwt_jti! if user.jwt_jti.blank?
      expires_at = now + LIFETIME
      payload = { sub: user.id, jti: user.jwt_jti, iat: now.to_i, exp: expires_at.to_i }
      [JWT.encode(payload, secret, ALGORITHM), expires_at]
    end

    # Returns the user the token belongs to or raises InvalidToken.
    def self.authenticate(token)
      payload, = JWT.decode(token.to_s, secret, true, algorithm: ALGORITHM)
      user = User.find_by(id: payload['sub'])
      raise InvalidToken, 'Token has been revoked' unless user && user.jwt_jti.present? && ActiveSupport::SecurityUtils.secure_compare(user.jwt_jti, payload['jti'].to_s)

      user
    rescue JWT::ExpiredSignature
      raise InvalidToken, 'Token has expired'
    rescue JWT::DecodeError
      raise InvalidToken, 'Token is invalid'
    end

    def self.secret
      Rails.application.secret_key_base
    end
    private_class_method :secret
  end
end

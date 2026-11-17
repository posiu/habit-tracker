class Category < ApplicationRecord
  # Associations
  belongs_to :user
  has_many :habits, dependent: :nullify
  has_many :goals, dependent: :nullify

  # Validations
  validates :name, presence: true, length: { maximum: 100 }
  validates :name, uniqueness: { scope: :user_id }
  validates :color, format: { with: /\A#[0-9A-Fa-f]{6}\z/, message: 'must be a valid hex color' }, allow_blank: true
  validates :icon, length: { maximum: 50 }

  # Scopes
  scope :active, -> { where(is_active: true) }
  scope :inactive, -> { where(is_active: false) }
  scope :ordered, -> { order(:position, :created_at) }
  scope :with_habits, -> { joins(:habits).distinct }
  scope :with_goals, -> { joins(:goals).distinct }

  # Callbacks
  before_validation :set_defaults

  private

  def set_defaults
    self.position ||= (user&.categories&.maximum(:position) || 0) + 1
    self.is_active = true if is_active.nil?
  end
end

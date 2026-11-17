class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  # Associations
  has_many :categories, dependent: :destroy
  has_many :habits, dependent: :destroy
  has_many :goals, dependent: :destroy
  has_many :daily_entries, dependent: :destroy

  # Validations
  validates :first_name, length: { maximum: 100 }
  validates :last_name, length: { maximum: 100 }
  validates :time_zone, length: { maximum: 50 }
  validates :locale, length: { maximum: 10 }

  # Scopes
  scope :with_notifications_enabled, -> { where(email_notifications_enabled: true) }
  scope :created_recently, -> { where('created_at >= ?', 1.week.ago) }

  def full_name
    "#{first_name} #{last_name}".strip
  end

  def display_name
    full_name.present? ? full_name : email
  end
end

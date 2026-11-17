class CategoryForm
  include ActiveModel::Model
  include ActiveModel::Attributes
  include ActiveModel::Validations

  attribute :name, :string
  attribute :description, :string
  attribute :color, :string
  attribute :icon, :string
  attribute :position, :integer
  attribute :is_active, :boolean, default: true

  validates :name, presence: true, length: { maximum: 100 }
  validates :description, length: { maximum: 500 }
  validates :color, format: { with: /\A#[0-9A-Fa-f]{6}\z/, message: "must be a valid hex color" }, allow_blank: true, allow_nil: true
  validates :icon, length: { maximum: 50 }, allow_blank: true, allow_nil: true
  validates :position, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true

  def initialize(category = nil, attributes = {})
    @category = category || Category.new
    super(attributes.presence || category_attributes)
  end

  def save(user: nil)
    return false unless valid?

    # If user is not provided, use the category's existing user
    user ||= @category.user
    
    @category.assign_attributes(
      name: name,
      description: description,
      color: color,
      icon: icon,
      position: position || next_position(user),
      is_active: is_active,
      user: user
    )

    @category.save
  end

  def category
    @category
  end

  def persisted?
    @category.persisted?
  end

  def to_key
    @category.to_key
  end

  def to_param
    @category.to_param
  end

  private

  def category_attributes
    return {} unless @category

    {
      name: @category.name,
      description: @category.description,
      color: @category.color,
      icon: @category.icon,
      position: @category.position,
      is_active: @category.is_active
    }
  end

  def next_position(user)
    return 1 unless user
    (user.categories.maximum(:position) || 0) + 1
  end
end

# Import datetime to record when each order is created
from datetime import datetime

# Import the database instance from the Flask app
from app import db



# MenuItem Table
# This table stores all items available in the canteen menu.
# Each item includes details such as price, description, and availability.

class MenuItem(db.Model):
    # Name of the database table
    __tablename__ = "menu_items"
   
    # Primary key: unique identifier for each menu item
    id = db.Column(db.Integer, primary_key=True)

    # Name of the food item
    name = db.Column(db.String(100), nullable=False)

    # Price of the item
    price = db.Column(db.Float, nullable=False)

    # Quantity available in stock (default is 0 if not specified)
    quantity = db.Column(db.Integer, default=0)

    # Short description of the menu item
    description = db.Column(db.String(250), nullable=False)

    # Calorie count for nutritional information
    calories = db.Column(db.Integer, nullable=False)

    # Flags to indicate special status or availability
    is_popular = db.Column(db.Boolean, default=False)
    is_available = db.Column(db.Boolean, default=True)

    # Emoji representation of the food item (for UI display)
    emoji = db.Column(db.String(8))


    # Converts the object into a dictionary format (useful for JSON responses)
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "price": self.price,
            "quantity": self.quantity,
            "description": self.description,
            "calories": self.calories,
            "is_popular": self.is_popular,
            "is_available": self.is_available,
            "emoji": self.emoji,
        }



# Order Table

# This table stores customer orders, including total cost and timestamp.

class Order(db.Model):
    __tablename__ = "orders"

    # Unique order ID
    id = db.Column(db.Integer, primary_key=True)

    # Total cost of the order
    total = db.Column(db.Float, default=0)

    # Timestamp when the order was created (defaults to current time)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship: one order can have many order items
    items = db.relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan"
    )


    # Converts order object into dictionary format for API responses
    def to_dict(self):
        return {
            "id": self.id,
            "total": round(self.total, 2),
            "created_at": self.created_at.isoformat(),
            "items": [i.to_dict() for i in self.items],
        }



# OrderItem Table

# This table links menu items to orders.
# It stores what items were ordered, how many, and at what price.

class OrderItem(db.Model):
    __tablename__ = "order_items"

    # Unique ID for each order item record
    id = db.Column(db.Integer, primary_key=True)

    # Links this item to a specific order
    order_id = db.Column(db.Integer, db.ForeignKey("orders.id"), nullable=False)

    # Links to the menu item being ordered
    menu_item_id = db.Column(db.Integer, db.ForeignKey("menu_items.id"), nullable=False)

    # Quantity of this item in the order
    quantity = db.Column(db.Integer, nullable=False, default=1)

    # Price of a single unit at time of ordering
    unit_price = db.Column(db.Float, nullable=False)

    # Relationship back to Order and MenuItem tables
    order = db.relationship("Order", back_populates="items")
    menu_item = db.relationship("MenuItem")


    # Converts order item into dictionary format for JSON/API use
    def to_dict(self):
        return {
            "id": self.id,
            "menu_item_id": self.menu_item_id,
            "name": self.menu_item.name,
            "emoji": self.menu_item.emoji,
            "quantity": self.quantity,
            "unit_price": self.unit_price,
            "subtotal": round(self.unit_price * self.quantity, 2),
        }

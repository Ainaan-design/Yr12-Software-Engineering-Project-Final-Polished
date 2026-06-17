from app import db
from flask import Blueprint, jsonify, request
from app.models import MenuItem, Order, OrderItem

# This file defines a Flask Blueprint called "api" which groups all
# backend routes related to the canteen system (menu + orders).
# It allows the application to separate API logic from other parts of the app.
api_bp = Blueprint("api", __name__)

# Returns all menu items that are currently available for purchase
# This ensures unavailable items are not shown to users
@api_bp.route("/menu")
def get_menu():
    items = MenuItem.query.filter_by(is_available=True).all()
    return jsonify([i.to_dict() for i in items])

# Returns only "popular" menu items (featured items for UI highlights)
# Filters by both availability and popularity flags
@api_bp.route("/menu/popular")
def get_popular():
    items = MenuItem.query.filter_by(is_available=True, is_popular=True).all()
    return jsonify([i.to_dict() for i in items])

#Orders
# Provides access to past orders stored in the database.

# Returns all orders sorted by most recent first
# Useful for admin/staff view or order history tracking
@api_bp.route("/orders", methods=["GET"])
def get_orders():
    orders = Order.query.order_by(Order.created_at.desc()).all()
    return jsonify([o.to_dict() for o in orders])

@api_bp.route("/orders", methods=["POST"])
def place_order():
    """
    Expects JSON body:
    {
      "items": [
        { "menu_item_id": 1, "quantity": 2 },
        { "menu_item_id": 3, "quantity": 1 }
      ]
    }
    """
    data = request.get_json()
    if not data or not data.get("items"):
        return jsonify({"error": "No items provided"}), 400

    order = Order()
    db.session.add(order)

    total = 0.0
    for entry in data["items"]:
        item = MenuItem.query.get(entry["menu_item_id"])
        if not item or not item.is_available:
            db.session.rollback()
            return jsonify({"error": f"Item {entry['menu_item_id']} not available"}), 400

        qty = int(entry["quantity"])
        order_item = OrderItem(
            order=order,
            menu_item_id=item.id,
            quantity=qty,
            unit_price=item.price,
        )
        db.session.add(order_item)
        total += item.price * qty

    order.total = round(total, 2)
    db.session.commit()

    return jsonify(order.to_dict()), 201

# Retrieves one specific order by ID.
# Used for viewing order details or confirmation pages.
@api_bp.route("/orders/<int:order_id>", methods=["GET"])
def get_order(order_id):
    order = Order.query.get_or_404(order_id)
    return jsonify(order.to_dict)


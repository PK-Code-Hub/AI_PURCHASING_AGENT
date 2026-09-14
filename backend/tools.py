import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from backend.mock_db import db

class AgentToolRegistry:
    """
    Typed Operational Tools available to the AI Purchasing Agent to investigate,
    decide, execute, and validate purchasing workflows across retail fulfillment nodes.
    """

    @staticmethod
    def get_inventory_status(sku_id: str, node_id: str) -> Dict[str, Any]:
        """Queries current physical inventory, in-transit orders, and velocity."""
        key = (sku_id, node_id)
        if key not in db.inventory:
            return {"error": f"No inventory record found for SKU {sku_id} at Node {node_id}"}
        
        inv = db.inventory[key]
        sku = db.skus.get(sku_id, {})
        node = db.nodes.get(node_id, {})
        
        # Calculate days of supply
        effective_stock = inv["stock_on_hand"] - inv["reserved_qty"]
        daily_rate = inv["current_velocity"] if inv["current_velocity"] > 0 else inv["avg_daily_demand"]
        days_of_supply = round(effective_stock / daily_rate, 2) if daily_rate > 0 else 999.0
        
        # Stockout risk score (0 - 100)
        risk = 0.0
        if days_of_supply < 1.5:
            risk = 95.0
        elif days_of_supply < 3.0:
            risk = 70.0
        elif days_of_supply < 5.0:
            risk = 35.0
        else:
            risk = 5.0

        return {
            "sku_id": sku_id,
            "sku_name": sku.get("name", sku_id),
            "category": sku.get("category", "General"),
            "node_id": node_id,
            "node_name": node.get("name", node_id),
            "stock_on_hand": inv["stock_on_hand"],
            "in_transit_qty": inv["in_transit_qty"],
            "reserved_qty": inv["reserved_qty"],
            "effective_available_stock": effective_stock,
            "avg_daily_demand": inv["avg_daily_demand"],
            "current_velocity": inv["current_velocity"],
            "demand_trend": inv["demand_trend"],
            "min_safety_stock": sku.get("min_safety_stock", 100),
            "days_of_supply": days_of_supply,
            "stockout_risk_score": risk
        }

    @staticmethod
    def get_demand_forecast(sku_id: str, node_id: str) -> Dict[str, Any]:
        """Fetches 7-day demand projections and anomaly signals."""
        key = (sku_id, node_id)
        inv = db.inventory.get(key, {})
        avg_demand = inv.get("avg_daily_demand", 50.0)
        current_vel = inv.get("current_velocity", avg_demand)
        trend = inv.get("demand_trend", "STABLE")

        surge_factor = current_vel / avg_demand if avg_demand > 0 else 1.0
        is_anomaly = surge_factor >= 2.0

        forecast_daily = []
        for day in range(1, 8):
            projected = round(current_vel * (1.0 + (day * 0.02 if is_anomaly else 0.0)), 1)
            forecast_daily.append({"day": day, "projected_units": projected})

        total_7day_demand = sum(f["projected_units"] for f in forecast_daily)

        return {
            "sku_id": sku_id,
            "node_id": node_id,
            "baseline_daily_demand": avg_demand,
            "current_velocity": current_vel,
            "surge_ratio": round(surge_factor, 2),
            "is_demand_anomaly": is_anomaly,
            "trend_signal": trend,
            "projected_7day_demand": round(total_7day_demand, 1),
            "daily_forecast_curve": forecast_daily
        }

    @staticmethod
    def get_open_purchase_orders(sku_id: Optional[str] = None, node_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Returns all active pipeline purchase orders filtered by SKU and Node."""
        results = []
        for po in db.purchase_orders.values():
            if po["status"] in ["CANCELLED", "COMPLETED", "REJECTED"]:
                continue
            if sku_id and po["sku_id"] != sku_id:
                continue
            if node_id and po["node_id"] != node_id:
                continue
            results.append(po)
        return results

    @staticmethod
    def get_supplier_catalog(sku_id: str) -> List[Dict[str, Any]]:
        """Queries all qualified suppliers, prices, lead times, MOQ, and SLAs."""
        offers = []
        for supp_id, supp in db.suppliers.items():
            if sku_id in supp["catalog"]:
                cat = supp["catalog"][sku_id]
                offers.append({
                    "supplier_id": supp_id,
                    "supplier_name": supp["name"],
                    "sku_id": sku_id,
                    "unit_price": cat["unit_price"],
                    "lead_time_days": cat["lead_time_days"],
                    "moq": cat["moq"],
                    "max_order_qty": cat["max_order_qty"],
                    "reliability_score": supp["reliability_score"],
                    "quality_score": cat["quality_score"],
                    "is_primary": cat.get("is_primary", False)
                })
        # Sort primary first, then reliability
        offers.sort(key=lambda x: (not x["is_primary"], -x["reliability_score"]))
        return offers

    @staticmethod
    def check_storage_capacity(node_id: str, incoming_units: int) -> Dict[str, Any]:
        """Validates if fulfillment node has cubic/unit capacity for incoming stock."""
        node = db.nodes.get(node_id)
        if not node:
            return {"error": f"Node {node_id} not found"}
        
        current_used = node["used_capacity_units"]
        total_cap = node["total_capacity_units"]
        headroom = total_cap - current_used
        
        projected_used = current_used + incoming_units
        projected_utilization_pct = round((projected_used / total_cap) * 100, 2)
        has_capacity = incoming_units <= headroom

        return {
            "node_id": node_id,
            "node_name": node["name"],
            "total_capacity_units": total_cap,
            "current_used_units": current_used,
            "available_headroom_units": headroom,
            "incoming_units_requested": incoming_units,
            "projected_total_used": projected_used,
            "projected_utilization_pct": projected_utilization_pct,
            "capacity_exceeded": not has_capacity,
            "max_allowable_units": headroom
        }

    @staticmethod
    def check_category_budget(category_name: str, order_cost: float) -> Dict[str, Any]:
        """Validates if procurement category has remaining working capital."""
        budget = db.budgets.get(category_name)
        if not budget:
            # Fallback if category not found
            return {"category": category_name, "available_budget": 999999.0, "is_budget_sufficient": True}
        
        available = budget["available_budget"]
        is_sufficient = order_cost <= available
        remaining_after = available - order_cost

        return {
            "category": category_name,
            "monthly_budget": budget["monthly_budget"],
            "spent_amount": budget["spent_amount"],
            "committed_amount": budget["committed_amount"],
            "available_budget": available,
            "order_cost_requested": round(order_cost, 2),
            "remaining_budget_after_order": round(remaining_after, 2),
            "is_budget_sufficient": is_sufficient,
            "budget_deficit": round(max(0.0, order_cost - available), 2)
        }

    @staticmethod
    def create_purchase_order(
        sku_id: str,
        supplier_id: str,
        node_id: str,
        quantity: int,
        notes: str = ""
    ) -> Dict[str, Any]:
        """Dispatches a new Purchase Order to ERP and registers in ledger."""
        sku = db.skus.get(sku_id)
        supplier = db.suppliers.get(supplier_id)
        node = db.nodes.get(node_id)
        
        if not sku or not supplier or not node:
            return {"error": "Invalid SKU, Supplier, or Node ID"}
        
        offer = supplier["catalog"].get(sku_id)
        if not offer:
            return {"error": f"Supplier {supplier_id} does not supply SKU {sku_id}"}
        
        unit_price = offer["unit_price"]
        lead_time = offer["lead_time_days"]
        total_cost = round(quantity * unit_price, 2)
        
        po_id = f"PO-{str(uuid.uuid4())[:6].upper()}"
        delivery_date = (datetime.now() + timedelta(days=lead_time)).strftime("%Y-%m-%d")
        
        po_record = {
            "id": po_id,
            "sku_id": sku_id,
            "sku_name": sku["name"],
            "supplier_id": supplier_id,
            "supplier_name": supplier["name"],
            "node_id": node_id,
            "node_name": node["name"],
            "quantity": quantity,
            "unit_price": unit_price,
            "total_cost": total_cost,
            "status": "SUBMITTED",
            "lead_time_days": lead_time,
            "created_at": datetime.now().isoformat(),
            "expected_delivery_date": delivery_date,
            "notes": notes,
            "validation_status": "PENDING"
        }
        
        # Update database records
        db.purchase_orders[po_id] = po_record
        
        # Deduct budget committed
        cat = sku["category"]
        if cat in db.budgets:
            db.budgets[cat]["available_budget"] -= total_cost
            db.budgets[cat]["committed_amount"] += total_cost
        
        # Update node used capacity
        db.nodes[node_id]["used_capacity_units"] += quantity
        db.nodes[node_id]["available_capacity_units"] -= quantity
        
        # Update inventory in-transit
        key = (sku_id, node_id)
        if key in db.inventory:
            db.inventory[key]["in_transit_qty"] += quantity

        return {
            "success": True,
            "purchase_order": po_record,
            "message": f"Purchase Order {po_id} created for {quantity} units at ${total_cost:.2f}"
        }

    @staticmethod
    def modify_purchase_order(po_id: str, new_quantity: int, reason: str) -> Dict[str, Any]:
        """Modifies quantity of an existing open purchase order."""
        if po_id not in db.purchase_orders:
            return {"error": f"PO {po_id} not found"}
        
        po = db.purchase_orders[po_id]
        old_qty = po["quantity"]
        diff_qty = new_quantity - old_qty
        
        po["quantity"] = new_quantity
        po["total_cost"] = round(new_quantity * po["unit_price"], 2)
        po["notes"] = f"Modified from {old_qty} to {new_quantity}. Reason: {reason}"
        
        # Adjust node capacity and inventory in-transit
        node_id = po["node_id"]
        sku_id = po["sku_id"]
        
        if node_id in db.nodes:
            db.nodes[node_id]["used_capacity_units"] += diff_qty
            db.nodes[node_id]["available_capacity_units"] -= diff_qty
            
        key = (sku_id, node_id)
        if key in db.inventory:
            db.inventory[key]["in_transit_qty"] += diff_qty

        return {
            "success": True,
            "purchase_order": po,
            "message": f"PO {po_id} modified to {new_quantity} units ({'+' if diff_qty >= 0 else ''}{diff_qty})"
        }

    @staticmethod
    def simulate_supplier_response(po_id: str, force_shortfall: Optional[int] = None) -> Dict[str, Any]:
        """Simulates supplier confirmation, rejection, or partial fulfillment response."""
        if po_id not in db.purchase_orders:
            return {"error": f"PO {po_id} not found"}
        
        po = db.purchase_orders[po_id]
        supplier_id = po["supplier_id"]
        requested_qty = po["quantity"]

        # If supplier is Alpha Bakery and quantity was 500, simulate partial fulfillment
        if force_shortfall is not None:
            accepted_qty = force_shortfall
        elif supplier_id == "SUP-ALPHA-BAKERY" and requested_qty >= 400:
            accepted_qty = 250 # Supplier shortfall
        else:
            accepted_qty = requested_qty

        if accepted_qty < requested_qty:
            po["status"] = "PARTIALLY_FULFILLED"
            po["validation_status"] = "FAILED"
            po["notes"] = f"Supplier capacity alert: Can only deliver {accepted_qty}/{requested_qty} units."
            shortfall = requested_qty - accepted_qty
            return {
                "po_id": po_id,
                "status": "PARTIAL_FULFILLMENT",
                "requested_quantity": requested_qty,
                "accepted_quantity": accepted_qty,
                "shortfall_quantity": shortfall,
                "reason": "Production line mechanical downtime at bakery facility.",
                "action_required": "Source remaining units from secondary supplier or escalate."
            }
        else:
            po["status"] = "CONFIRMED"
            po["validation_status"] = "PASSED"
            return {
                "po_id": po_id,
                "status": "ACCEPTED_IN_FULL",
                "confirmed_quantity": accepted_qty,
                "estimated_dispatch": po["expected_delivery_date"]
            }

    @staticmethod
    def escalate_to_human_buyer(reason: str, options: List[str], risk_score: float) -> Dict[str, Any]:
        """Generates a human-in-the-loop escalation ticket with risk diffs."""
        ticket_id = f"ESC-{str(uuid.uuid4())[:6].upper()}"
        return {
            "escalation_id": ticket_id,
            "status": "AWAITING_BUYER_REVIEW",
            "reason": reason,
            "recommended_options": options,
            "risk_score": risk_score,
            "timestamp": datetime.now().isoformat()
        }

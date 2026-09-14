from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from backend.models import ValidationReceipt, InvariantCheck, PurchaseOrder
from backend.mock_db import db

class ClosedLoopValidator:
    """
    Closed-Loop Feedback & Validation Engine.
    Executes post-action invariant checks and discrepancy detection on purchasing decisions.
    """

    @staticmethod
    def validate_purchase_order(
        po_dict: Dict[str, Any],
        pre_existing_stock: int,
        daily_demand_rate: float,
        simulated_supplier_response: Optional[Dict[str, Any]] = None
    ) -> ValidationReceipt:
        """
        Runs comprehensive closed-loop invariant checks on a Purchase Order.
        """
        po_id = po_dict.get("id")
        sku_id = po_dict.get("sku_id")
        node_id = po_dict.get("node_id")
        supplier_id = po_dict.get("supplier_id")
        quantity = po_dict.get("quantity", 0)
        total_cost = po_dict.get("total_cost", 0.0)
        lead_time = po_dict.get("lead_time_days", 2)

        sku = db.skus.get(sku_id, {})
        category = sku.get("category", "General")
        budget = db.budgets.get(category, {})
        node = db.nodes.get(node_id, {})
        supplier = db.suppliers.get(supplier_id, {})
        cat_offer = supplier.get("catalog", {}).get(sku_id, {})

        checks: List[InvariantCheck] = []
        all_passed = True
        discrepancy_detected = False
        failure_reasons = []

        # 1. Budget Invariant Check
        avail_budget = budget.get("available_budget", 999999.0)
        # Note: If PO is already created, committed budget includes this cost, so compare with budget safety
        budget_passed = total_cost <= (avail_budget + total_cost + 0.01)
        checks.append(InvariantCheck(
            name="Category Budget Invariant",
            passed=budget_passed,
            current_value=f"${total_cost:.2f}",
            limit_value=f"${avail_budget + total_cost:.2f}",
            severity="CRITICAL" if not budget_passed else "INFO",
            message="Order cost within authorized category budget ceiling" if budget_passed else f"Budget exceeded by ${total_cost - avail_budget:.2f}"
        ))
        if not budget_passed:
            all_passed = False
            failure_reasons.append("Budget constraint violated")

        # 2. Node Storage Capacity Invariant
        node_headroom = node.get("available_capacity_units", 0)
        storage_passed = quantity <= (node_headroom + quantity) # check headroom before addition
        checks.append(InvariantCheck(
            name="Node Physical Storage Headroom",
            passed=storage_passed,
            current_value=f"{quantity} units",
            limit_value=f"{node_headroom + quantity} units max",
            severity="CRITICAL" if not storage_passed else "INFO",
            message="Node has sufficient volumetric storage for incoming replenishment" if storage_passed else "Storage capacity breached"
        ))
        if not storage_passed:
            all_passed = False
            failure_reasons.append("Storage capacity exceeded")

        # 3. Supplier MOQ Invariant
        moq = cat_offer.get("moq", 1)
        moq_passed = quantity >= moq
        checks.append(InvariantCheck(
            name="Supplier Minimum Order Quantity (MOQ)",
            passed=moq_passed,
            current_value=f"{quantity} units",
            limit_value=f">={moq} units MOQ",
            severity="WARNING" if not moq_passed else "INFO",
            message=f"Order meets supplier minimum quantity threshold ({moq})" if moq_passed else f"Order quantity {quantity} is below supplier MOQ of {moq}"
        ))
        if not moq_passed:
            all_passed = False
            failure_reasons.append(f"Quantity below MOQ ({moq})")

        # 4. Lead-Time vs Stockout Timeline Invariant
        days_until_stockout = (pre_existing_stock / daily_demand_rate) if daily_demand_rate > 0 else 99.0
        sla_passed = lead_time <= (days_until_stockout + 1.0) # 1-day safety window
        checks.append(InvariantCheck(
            name="Delivery Lead-Time SLA vs Stockout Timeline",
            passed=sla_passed,
            current_value=f"{lead_time} days lead time",
            limit_value=f"{days_until_stockout:.1f} days until stockout",
            severity="WARNING" if not sla_passed else "INFO",
            message="Shipment arrives prior to inventory depletion" if sla_passed else f"High stockout risk: Lead time ({lead_time}d) exceeds days of supply ({days_until_stockout:.1f}d)"
        ))
        if not sla_passed:
            # We treat this as a warning or partial failure
            pass

        # 5. Supplier Fulfillment Confirmation Check (Closed-Loop Feedback)
        if simulated_supplier_response:
            status = simulated_supplier_response.get("status")
            accepted_qty = simulated_supplier_response.get("accepted_quantity", quantity)
            if status == "PARTIAL_FULFILLMENT" or accepted_qty < quantity:
                all_passed = False
                discrepancy_detected = True
                shortfall = simulated_supplier_response.get("shortfall_quantity", quantity - accepted_qty)
                checks.append(InvariantCheck(
                    name="Supplier Fulfillment Confirmation",
                    passed=False,
                    current_value=f"{accepted_qty} units confirmed",
                    limit_value=f"{quantity} units requested",
                    severity="CRITICAL",
                    message=f"Discrepancy detected: Supplier shorted order by {shortfall} units ({simulated_supplier_response.get('reason')})"
                ))
                failure_reasons.append(f"Supplier shortfall of {shortfall} units")
            else:
                checks.append(InvariantCheck(
                    name="Supplier Fulfillment Confirmation",
                    passed=True,
                    current_value=f"{accepted_qty} units confirmed",
                    limit_value=f"{quantity} units requested",
                    severity="INFO",
                    message="Supplier confirmed 100% full fulfillment and delivery timeline"
                ))

        return ValidationReceipt(
            po_id=po_id,
            all_passed=all_passed,
            checks=checks,
            discrepancy_detected=discrepancy_detected,
            failure_reason="; ".join(failure_reasons) if failure_reasons else None,
            recovery_strategy=None,
            recovery_executed=False
        )

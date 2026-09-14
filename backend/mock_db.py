import copy
from typing import Dict, List, Optional
from datetime import datetime, timedelta

class MockDatabase:
    def __init__(self):
        self.reset()

    def reset(self):
        """Resets the mock database to a clean, canonical quick-commerce retail state."""
        self.nodes = {
            "NODE-NORTH": {
                "id": "NODE-NORTH",
                "name": "North Metro Dark Store (FC-01)",
                "location": "North Sector, Zone A",
                "total_capacity_units": 5000,
                "used_capacity_units": 4550, # 450 units remaining headroom
                "available_capacity_units": 450
            },
            "NODE-SOUTH": {
                "id": "NODE-SOUTH",
                "name": "South Regional Fulfillment Center (FC-02)",
                "location": "South Industrial Park",
                "total_capacity_units": 8000,
                "used_capacity_units": 5200, # 2800 units remaining headroom
                "available_capacity_units": 2800
            },
            "NODE-WEST": {
                "id": "NODE-WEST",
                "name": "West Suburb Micro-Hub (FC-03)",
                "location": "West Expressway Corridor",
                "total_capacity_units": 3500,
                "used_capacity_units": 2200, # 1300 units remaining headroom
                "available_capacity_units": 1300
            }
        }

        self.skus = {
            "SKU-OAT-1L": {
                "id": "SKU-OAT-1L",
                "name": "Organic Oat Milk 1L Barista Edition",
                "category": "Dairy & Plant Alternatives",
                "unit_cost": 3.00,
                "retail_price": 5.49,
                "volume_per_unit_m3": 0.0015,
                "shelf_life_days": 90,
                "min_safety_stock": 120
            },
            "SKU-BREAD-500G": {
                "id": "SKU-BREAD-500G",
                "name": "Artisan Sourdough Loaf 500g",
                "category": "Bakery & Fresh Foods",
                "unit_cost": 2.20,
                "retail_price": 4.25,
                "volume_per_unit_m3": 0.0025,
                "shelf_life_days": 5,
                "min_safety_stock": 140
            },
            "SKU-ENERGY-500ML": {
                "id": "SKU-ENERGY-500ML",
                "name": "Electrolyte Hydration Surge 500ml",
                "category": "Beverages & Energy",
                "unit_cost": 1.80,
                "retail_price": 3.99,
                "volume_per_unit_m3": 0.0008,
                "shelf_life_days": 180,
                "min_safety_stock": 150
            },
            "SKU-WATER-24PK": {
                "id": "SKU-WATER-24PK",
                "name": "Natural Artesian Mineral Water (24x500ml Pack)",
                "category": "Beverages & Bulk Liquids",
                "unit_cost": 8.00,
                "retail_price": 14.99,
                "volume_per_unit_m3": 0.035, # Bulky item
                "shelf_life_days": 365,
                "min_safety_stock": 100
            },
            "SKU-AVOCADO-BAG": {
                "id": "SKU-AVOCADO-BAG",
                "name": "Fresh Hass Avocados (Pack of 4)",
                "category": "Fresh Produce",
                "unit_cost": 3.50,
                "retail_price": 6.99,
                "volume_per_unit_m3": 0.003,
                "shelf_life_days": 7,
                "min_safety_stock": 80
            }
        }

        self.inventory = {
            # SKU-OAT-1L at NODE-NORTH (Scenario 1)
            ("SKU-OAT-1L", "NODE-NORTH"): {
                "sku_id": "SKU-OAT-1L",
                "node_id": "NODE-NORTH",
                "stock_on_hand": 220,
                "in_transit_qty": 150, # PO-8101
                "reserved_qty": 20,
                "avg_daily_demand": 60.0,
                "current_velocity": 62.0,
                "demand_trend": "STABLE"
            },
            # SKU-BREAD-500G at NODE-SOUTH (Scenario 2)
            ("SKU-BREAD-500G", "NODE-SOUTH"): {
                "sku_id": "SKU-BREAD-500G",
                "node_id": "NODE-SOUTH",
                "stock_on_hand": 90,
                "in_transit_qty": 500, # PO-5021 with Alpha Bakeries (will be partially shorted)
                "reserved_qty": 10,
                "avg_daily_demand": 70.0,
                "current_velocity": 75.0,
                "demand_trend": "STABLE"
            },
            # SKU-ENERGY-500ML at NODE-NORTH (Scenario 3)
            ("SKU-ENERGY-500ML", "NODE-NORTH"): {
                "sku_id": "SKU-ENERGY-500ML",
                "node_id": "NODE-NORTH",
                "stock_on_hand": 180,
                "in_transit_qty": 300, # Arrives in 5 days, but velocity spiked to 160/day
                "reserved_qty": 30,
                "avg_daily_demand": 45.0,
                "current_velocity": 160.0, # 3.55x Surge
                "demand_trend": "SURGE"
            },
            # SKU-WATER-24PK at NODE-NORTH (Scenario 4)
            ("SKU-WATER-24PK", "NODE-NORTH"): {
                "sku_id": "SKU-WATER-24PK",
                "node_id": "NODE-NORTH",
                "stock_on_hand": 110,
                "in_transit_qty": 0,
                "reserved_qty": 15,
                "avg_daily_demand": 50.0,
                "current_velocity": 52.0,
                "demand_trend": "STABLE"
            },
            ("SKU-WATER-24PK", "NODE-WEST"): {
                "sku_id": "SKU-WATER-24PK",
                "node_id": "NODE-WEST",
                "stock_on_hand": 85,
                "in_transit_qty": 0,
                "reserved_qty": 10,
                "avg_daily_demand": 35.0,
                "current_velocity": 36.0,
                "demand_trend": "STABLE"
            }
        }

        self.suppliers = {
            "SUP-OAT-PRIME": {
                "id": "SUP-OAT-PRIME",
                "name": "Nordic Oat Logistics & Milling",
                "reliability_score": 0.98,
                "catalog": {
                    "SKU-OAT-1L": {
                        "unit_price": 3.00,
                        "lead_time_days": 3,
                        "moq": 200,
                        "max_order_qty": 2000,
                        "quality_score": 0.99,
                        "is_primary": True
                    }
                }
            },
            "SUP-ALPHA-BAKERY": {
                "id": "SUP-ALPHA-BAKERY",
                "name": "Alpha Artisan Breads Co.",
                "reliability_score": 0.88,
                "catalog": {
                    "SKU-BREAD-500G": {
                        "unit_price": 2.20,
                        "lead_time_days": 2,
                        "moq": 100,
                        "max_order_qty": 1000,
                        "quality_score": 0.96,
                        "is_primary": True
                    }
                }
            },
            "SUP-BETA-BAKERY": {
                "id": "SUP-BETA-BAKERY",
                "name": "Beta Fast-Bake Daily Ltd.",
                "reliability_score": 0.97,
                "catalog": {
                    "SKU-BREAD-500G": {
                        "unit_price": 2.40, # $0.20 premium
                        "lead_time_days": 1, # Faster lead time
                        "moq": 150,
                        "max_order_qty": 800,
                        "quality_score": 0.94,
                        "is_primary": False
                    }
                }
            },
            "SUP-BEV-STANDARD": {
                "id": "SUP-BEV-STANDARD",
                "name": "Global Beverage Distributors",
                "reliability_score": 0.92,
                "catalog": {
                    "SKU-ENERGY-500ML": {
                        "unit_price": 1.80,
                        "lead_time_days": 5, # Standard transit
                        "moq": 200,
                        "max_order_qty": 5000,
                        "quality_score": 0.98,
                        "is_primary": True
                    },
                    "SKU-WATER-24PK": {
                        "unit_price": 8.00,
                        "lead_time_days": 4,
                        "moq": 500, # Strict MOQ of 500 packs
                        "max_order_qty": 3000,
                        "quality_score": 0.97,
                        "is_primary": True
                    }
                }
            },
            "SUP-EXPRESS-BEV": {
                "id": "SUP-EXPRESS-BEV",
                "name": "SpeedLink Express Drinks",
                "reliability_score": 0.99,
                "catalog": {
                    "SKU-ENERGY-500ML": {
                        "unit_price": 2.05, # Rush premium
                        "lead_time_days": 1, # Same/Next-Day Express
                        "moq": 100,
                        "max_order_qty": 1500,
                        "quality_score": 0.99,
                        "is_primary": False
                    }
                }
            }
        }

        self.budgets = {
            "Dairy & Plant Alternatives": {
                "category": "Dairy & Plant Alternatives",
                "monthly_budget": 10000.0,
                "spent_amount": 8400.0,
                "committed_amount": 0.0,
                "available_budget": 1600.0 # Only $1,600 left!
            },
            "Bakery & Fresh Foods": {
                "category": "Bakery & Fresh Foods",
                "monthly_budget": 15000.0,
                "spent_amount": 8000.0,
                "committed_amount": 1100.0,
                "available_budget": 5900.0
            },
            "Beverages & Energy": {
                "category": "Beverages & Energy",
                "monthly_budget": 20000.0,
                "spent_amount": 12000.0,
                "committed_amount": 540.0,
                "available_budget": 7460.0
            },
            "Beverages & Bulk Liquids": {
                "category": "Beverages & Bulk Liquids",
                "monthly_budget": 25000.0,
                "spent_amount": 19000.0,
                "committed_amount": 0.0,
                "available_budget": 6000.0 # Enough for 600-750 packs, but not 1,000+
            }
        }

        self.purchase_orders = {
            "PO-8101": {
                "id": "PO-8101",
                "sku_id": "SKU-OAT-1L",
                "sku_name": "Organic Oat Milk 1L Barista Edition",
                "supplier_id": "SUP-OAT-PRIME",
                "supplier_name": "Nordic Oat Logistics & Milling",
                "node_id": "NODE-NORTH",
                "node_name": "North Metro Dark Store (FC-01)",
                "quantity": 150,
                "unit_price": 3.00,
                "total_cost": 450.0,
                "status": "CONFIRMED",
                "lead_time_days": 3,
                "created_at": (datetime.now() - timedelta(days=1)).isoformat(),
                "expected_delivery_date": (datetime.now() + timedelta(days=2)).isoformat(),
                "notes": "Routine replenishment tranche",
                "validation_status": "PASSED"
            },
            "PO-5021": {
                "id": "PO-5021",
                "sku_id": "SKU-BREAD-500G",
                "sku_name": "Artisan Sourdough Loaf 500g",
                "supplier_id": "SUP-ALPHA-BAKERY",
                "supplier_name": "Alpha Artisan Breads Co.",
                "node_id": "NODE-SOUTH",
                "node_name": "South Regional Fulfillment Center (FC-02)",
                "quantity": 500,
                "unit_price": 2.20,
                "total_cost": 1100.0,
                "status": "PARTIALLY_FULFILLED",
                "lead_time_days": 2,
                "created_at": (datetime.now() - timedelta(hours=6)).isoformat(),
                "expected_delivery_date": (datetime.now() + timedelta(days=2)).isoformat(),
                "notes": "Supplier confirmed: Only 250 units available due to mixer outage.",
                "validation_status": "FAILED"
            }
        }

# Global singleton database instance
db = MockDatabase()

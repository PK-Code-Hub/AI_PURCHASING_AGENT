from typing import List, Dict, Optional, Any, Literal
from pydantic import BaseModel, Field
from datetime import datetime

class FulfillmentNode(BaseModel):
    id: str
    name: str
    location: str
    total_capacity_units: int
    used_capacity_units: int
    available_capacity_units: int

class ProductSKU(BaseModel):
    id: str
    name: str
    category: str
    unit_cost: float
    retail_price: float
    volume_per_unit_m3: float
    shelf_life_days: int
    min_safety_stock: int

class InventoryRecord(BaseModel):
    sku_id: str
    sku_name: str
    node_id: str
    node_name: str
    stock_on_hand: int
    in_transit_qty: int
    reserved_qty: int
    avg_daily_demand: float
    current_velocity: float
    days_of_supply: float
    stockout_risk_score: float # 0 - 100

class SupplierOffer(BaseModel):
    supplier_id: str
    supplier_name: str
    sku_id: str
    unit_price: float
    lead_time_days: int
    moq: int
    max_order_qty: int
    reliability_score: float # 0 - 1.0 (e.g. 0.96 = 96% on-time fulfillment)
    quality_score: float
    is_primary: bool = False

class CategoryBudget(BaseModel):
    category: str
    monthly_budget: float
    spent_amount: float
    committed_amount: float
    available_budget: float

class PurchaseOrder(BaseModel):
    id: str
    sku_id: str
    sku_name: str
    supplier_id: str
    supplier_name: str
    node_id: str
    node_name: str
    quantity: int
    unit_price: float
    total_cost: float
    status: Literal["DRAFT", "SUBMITTED", "CONFIRMED", "PARTIALLY_FULFILLED", "REJECTED", "CANCELLED", "COMPLETED"]
    lead_time_days: int
    created_at: str
    expected_delivery_date: str
    notes: Optional[str] = None
    validation_status: Literal["PENDING", "PASSED", "FAILED", "RECOVERED"] = "PENDING"

class InvariantCheck(BaseModel):
    name: str
    passed: bool
    current_value: Any
    limit_value: Any
    severity: Literal["INFO", "WARNING", "CRITICAL"] = "INFO"
    message: str

class ValidationReceipt(BaseModel):
    po_id: Optional[str] = None
    all_passed: bool
    checks: List[InvariantCheck] = []
    discrepancy_detected: bool = False
    failure_reason: Optional[str] = None
    recovery_strategy: Optional[str] = None
    recovery_executed: bool = False

class AgentStep(BaseModel):
    step_num: int
    phase: Literal["OBSERVE", "THINK", "ACT", "VALIDATE", "RECOVER", "DECIDE"]
    thought: str
    action: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
    observation: Optional[Any] = None
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

class PurchasingDecision(BaseModel):
    scenario_id: str
    scenario_name: str
    decision_type: Literal["ACCEPT", "MODIFY", "REJECT", "SPLIT_ORDER", "ESCALATE", "SURGE_REORDER"]
    original_recommended_qty: int
    final_executed_qty: int
    reasoning_summary: str
    key_factors: List[str]
    purchase_orders: List[PurchaseOrder] = []
    validation_receipt: ValidationReceipt
    execution_steps: List[AgentStep] = []
    confidence_score: float = 0.95
    human_approval_required: bool = False
    human_escalation_reason: Optional[str] = None
    metrics_before: Dict[str, Any] = {}
    metrics_after: Dict[str, Any] = {}

class BenchmarkEvalResult(BaseModel):
    id: str
    name: str
    scenario_type: str
    passed: bool
    score: float # 0 - 100
    decision_accuracy: bool
    constraint_compliance: bool
    information_completeness: bool
    validation_loop_passed: bool
    recovery_effectiveness: bool
    latency_ms: float
    execution_summary: str
    audit_log: List[str] = []

class ScenarioInput(BaseModel):
    scenario_id: str
    custom_overrides: Optional[Dict[str, Any]] = None
    autonomous_mode: bool = True
    llm_provider: Optional[str] = "deterministic" # "deterministic", "gemini", "openai"
    api_key: Optional[str] = None

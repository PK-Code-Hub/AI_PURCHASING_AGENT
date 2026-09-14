import os
import sys
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

# Add current workspace to path
workspace_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(workspace_dir))

from backend.models import (
    ScenarioInput, PurchasingDecision, BenchmarkEvalResult
)
from backend.mock_db import db
from backend.agent import PurchasingAgent
from backend.evaluator import EvaluationBenchmarkSuite

app = FastAPI(
    title="AegisProcure AI — Autonomous Purchasing Agent API",
    description="Full-stack AI Purchasing Agent for retail & quick-commerce operations",
    version="1.0.0"
)

# Enable CORS for local dev servers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

agent = PurchasingAgent()
evaluator = EvaluationBenchmarkSuite()

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AegisProcure AI Purchasing Agent",
        "timestamp": os.getenv("API_TIMESTAMP", "2026-09-14T12:00:00Z"),
        "features": [
            "Multi-Factor Constraint Engine",
            "Closed-Loop Invariant Validation",
            "ReAct Execution Trace",
            "Automated Benchmark Suite",
            "Human-in-the-Loop Approval Console"
        ]
    }

@app.get("/api/state")
def get_system_state():
    """Returns current state of the mock enterprise ERP."""
    return {
        "nodes": list(db.nodes.values()),
        "skus": list(db.skus.values()),
        "inventory": [
            {
                "sku_id": inv["sku_id"],
                "sku_name": db.skus.get(inv["sku_id"], {}).get("name", inv["sku_id"]),
                "node_id": inv["node_id"],
                "node_name": db.nodes.get(inv["node_id"], {}).get("name", inv["node_id"]),
                "stock_on_hand": inv["stock_on_hand"],
                "in_transit_qty": inv["in_transit_qty"],
                "reserved_qty": inv["reserved_qty"],
                "avg_daily_demand": inv["avg_daily_demand"],
                "current_velocity": inv["current_velocity"],
                "demand_trend": inv["demand_trend"]
            }
            for inv in db.inventory.values()
        ],
        "suppliers": list(db.suppliers.values()),
        "budgets": list(db.budgets.values()),
        "purchase_orders": list(db.purchase_orders.values())
    }

@app.post("/api/reset")
def reset_database():
    """Resets mock database to canonical starting condition."""
    db.reset()
    return {"message": "Database successfully reset to canonical retail baseline.", "status": "RESET_OK"}

@app.post("/api/agent/run")
def run_agent_scenario(scenario_input: ScenarioInput):
    """Executes the AI Purchasing Agent for a specified scenario or sandbox configuration."""
    try:
        decision = agent.run_scenario(scenario_input)
        return decision
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/evaluations/run")
def run_evaluations():
    """Runs all 8 evaluation benchmark scenarios and returns scorecards."""
    try:
        results = evaluator.run_all_benchmarks()
        total_score = sum(r.score for r in results) / len(results) if results else 0
        total_passed = sum(1 for r in results if r.passed)
        
        return {
            "overall_score": round(total_score, 1),
            "passed_count": total_passed,
            "total_count": len(results),
            "pass_rate_pct": round((total_passed / len(results)) * 100, 1),
            "benchmarks": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/purchase-orders/approve")
def approve_purchase_order(payload: dict):
    """Approves a pending purchase order in human-in-the-loop mode."""
    po_id = payload.get("po_id")
    if po_id in db.purchase_orders:
        db.purchase_orders[po_id]["status"] = "CONFIRMED"
        db.purchase_orders[po_id]["notes"] = (db.purchase_orders[po_id].get("notes", "") + " [Human Buyer Approved]").strip()
        return {"status": "APPROVED", "purchase_order": db.purchase_orders[po_id]}
    return {"error": f"PO {po_id} not found"}

# Mount frontend if build directory exists
dist_dir = workspace_dir / "frontend" / "dist"
if dist_dir.exists():
    app.mount("/assets", StaticFiles(directory=str(dist_dir / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = dist_dir / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))
        return FileResponse(str(dist_dir / "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

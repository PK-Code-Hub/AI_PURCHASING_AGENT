import React, { useState } from 'react';
import { Sliders, Play, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';
import AgentTraceView from './AgentTraceView';
import ValidationCard from './ValidationCard';

export default function SandboxView({ onRunSandbox, isRunning, sandboxDecision }) {
  const [skuId, setSkuId] = useState('SKU-OAT-1L');
  const [nodeId, setNodeId] = useState('NODE-NORTH');
  const [recommendedQty, setRecommendedQty] = useState(750);
  const [dailyDemand, setDailyDemand] = useState(65);
  const [stockOnHand, setStockOnHand] = useState(180);

  const handleSubmit = (e) => {
    e.preventDefault();
    onRunSandbox({
      sku_id: skuId,
      node_id: nodeId,
      recommended_qty: Number(recommendedQty),
      daily_demand: Number(dailyDemand),
      stock_on_hand: Number(stockOnHand)
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Sandbox Controls Form */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <Sliders size={22} color="var(--accent-cyan)" />
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
              Buyer Operational Sandbox Simulator
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Configure arbitrary purchasing parameters and observe real-time ReAct decision formulation, constraint checking, and closed-loop validation.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid-3" style={{ gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Select Product SKU
              </label>
              <select
                value={skuId}
                onChange={(e) => setSkuId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-subtle)',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              >
                <option value="SKU-OAT-1L">Organic Oat Milk 1L Barista</option>
                <option value="SKU-BREAD-500G">Artisan Sourdough Loaf 500g</option>
                <option value="SKU-ENERGY-500ML">Electrolyte Hydration Surge 500ml</option>
                <option value="SKU-WATER-24PK">Natural Mineral Water (24-pack)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Target Fulfillment Node
              </label>
              <select
                value={nodeId}
                onChange={(e) => setNodeId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-subtle)',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              >
                <option value="NODE-NORTH">North Metro Dark Store (FC-01)</option>
                <option value="NODE-SOUTH">South Regional FC (FC-02)</option>
                <option value="NODE-WEST">West Suburb Micro-Hub (FC-03)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Recommended Quantity: <strong style={{ color: 'var(--accent-emerald-light)' }}>{recommendedQty} units</strong>
              </label>
              <input
                type="range"
                min="50"
                max="1500"
                step="25"
                value={recommendedQty}
                onChange={(e) => setRecommendedQty(e.target.value)}
                style={{ width: '100%', accentColor: 'var(--accent-emerald)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Daily Demand Velocity: <strong style={{ color: 'var(--accent-cyan)' }}>{dailyDemand} units/day</strong>
              </label>
              <input
                type="range"
                min="10"
                max="300"
                step="5"
                value={dailyDemand}
                onChange={(e) => setDailyDemand(e.target.value)}
                style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Current Physical Stock: <strong style={{ color: 'var(--accent-violet)' }}>{stockOnHand} units</strong>
              </label>
              <input
                type="range"
                min="0"
                max="800"
                step="10"
                value={stockOnHand}
                onChange={(e) => setStockOnHand(e.target.value)}
                style={{ width: '100%', accentColor: 'var(--accent-violet)' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                type="submit"
                disabled={isRunning}
                className="btn btn-primary"
                style={{ width: '100%', padding: '10px', fontSize: '0.9rem' }}
              >
                {isRunning ? (
                  <>
                    <span className="animate-spin-slow">⟳</span>
                    Analyzing Constraints...
                  </>
                ) : (
                  <>
                    <Play size={16} fill="#07090e" />
                    Run Custom Agent Analysis
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Render Sandbox Results */}
      {sandboxDecision && (
        <>
          <AgentTraceView decision={sandboxDecision} isRunning={false} />
          <ValidationCard
            validationReceipt={sandboxDecision.validation_receipt}
            metricsBefore={sandboxDecision.metrics_before}
            metricsAfter={sandboxDecision.metrics_after}
          />
        </>
      )}
    </div>
  );
}
